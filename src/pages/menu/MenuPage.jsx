// src/pages/menu/MenuPage.jsx
import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  subscribeToCategories, subscribeToItems,
  addCategory, addItem,
  updateItem, deleteItem, toggleItemAvailability
} from '../../services/menu.service'

// ─── Modal Categorie ───────────────────────────────────────
function CategoryModal({ onClose, onSave }) {
  const [name, setName]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await onSave(name)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Categorie nouă</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nume categorie *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              placeholder="ex: Aperitive, Paste, Deserturi..."
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Anulează</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Se salvează...' : 'Salvează'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal Produs ──────────────────────────────────────────
function ItemModal({ categories, item, onClose, onSave }) {
  const [form, setForm] = useState({
    name:        item?.name        || '',
    description: item?.description || '',
    price:       item?.price       || '',
    categoryId:  item?.categoryId  || categories[0]?.id || '',
    available:   item?.available   ?? true,
  })
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : name === 'price' ? Number(value) : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await onSave(form)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{item ? 'Editează produs' : 'Produs nou'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nume produs *</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input resize-none" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preț (RON) *</label>
              <input name="price" type="number" min="0" step="0.5" value={form.price} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} className="input">
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input name="available" type="checkbox" id="available" checked={form.available} onChange={handleChange} className="h-4 w-4 text-brand-500 rounded" />
            <label htmlFor="available" className="text-sm text-gray-700">Disponibil în meniu</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Anulează</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Se salvează...' : 'Salvează'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Pagina principală ─────────────────────────────────────
export default function MenuPage() {
  const [categories, setCategories]         = useState([])
  const [items, setItems]                   = useState([])
  const [loading, setLoading]               = useState(true)
  const [activeCat, setActiveCat]           = useState(null)
  const [showCatModal, setShowCatModal]     = useState(false)
  const [showItemModal, setShowItemModal]   = useState(false)
  const [editingItem, setEditingItem]       = useState(null)

  useEffect(() => {
    const unsubCat = subscribeToCategories(data => {
      setCategories(data)
      if (data.length > 0 && !activeCat) setActiveCat(data[0].id)
      setLoading(false)
    })
    const unsubItems = subscribeToItems(setItems)
    return () => { unsubCat(); unsubItems() }
  }, [])

  const filteredItems = items.filter(i => i.categoryId === activeCat)

  async function handleAddCategory(name) {
    const doc = await addCategory({ name, order: categories.length })
    setActiveCat(doc.id)
  }

  async function handleSaveItem(form) {
    if (editingItem) {
      await updateItem(editingItem.id, form)
    } else {
      await addItem(form)
    }
    setEditingItem(null)
  }

  function openEditItem(item) {
    setEditingItem(item)
    setShowItemModal(true)
  }

  async function handleDeleteItem(id) {
    if (window.confirm('Ștergi acest produs?')) {
      await deleteItem(id)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meniu</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} produse în {categories.length} categorii</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatModal(true)} className="btn-secondary flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Categorie
          </button>
          <button
            onClick={() => { setEditingItem(null); setShowItemModal(true) }}
            disabled={categories.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4" />
            Produs
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500">Nicio categorie încă.</p>
          <p className="text-sm text-gray-400 mt-1">Adaugă o categorie pentru a începe să construiești meniul.</p>
          <button onClick={() => setShowCatModal(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
            <PlusIcon className="h-4 w-4" /> Adaugă categorie
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

  {/* Categorii — horizontal scroll pe mobile, sidebar pe desktop */}
  <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:w-48 lg:flex-shrink-0">
    {categories.map(cat => (
      <button
        key={cat.id}
        onClick={() => setActiveCat(cat.id)}
        className={`flex-shrink-0 text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          activeCat === cat.id
            ? 'bg-brand-50 text-brand-600'
            : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200 lg:border-0'
        }`}
      >
        {cat.name}
        <span className="ml-2 text-xs text-gray-400">
          ({items.filter(i => i.categoryId === cat.id).length})
        </span>
      </button>
    ))}
  </div>

  {/* Produse */}
  <div className="flex-1 min-w-0">
    {filteredItems.length === 0 ? (
      <div className="card text-center py-12">
        <p className="text-gray-500">Niciun produs în această categorie.</p>
        <button
          onClick={() => { setEditingItem(null); setShowItemModal(true) }}
          className="btn-primary mt-4 inline-flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" /> Adaugă produs
        </button>
      </div>
    ) : (
      <div className="grid gap-3">
        {filteredItems.map(item => (
          <div key={item.id} className="card flex items-center justify-between py-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Toggle disponibilitate */}
              <button
                onClick={() => toggleItemAvailability(item.id, !item.available)}
                className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                  item.available ? 'bg-green-400' : 'bg-gray-300'
                }`}
              >
                <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${
                  item.available ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
              <div className="min-w-0">
                <p className={`font-medium truncate ${item.available ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                  {item.name}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-semibold text-brand-600 text-sm">{item.price} RON</span>
              <button onClick={() => openEditItem(item)} className="text-gray-400 hover:text-brand-500 transition-colors">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
      )}

      {/* Modals */}
      {showCatModal && (
        <CategoryModal onClose={() => setShowCatModal(false)} onSave={handleAddCategory} />
      )}
      {showItemModal && (
        <ItemModal
          categories={categories}
          item={editingItem}
          onClose={() => { setShowItemModal(false); setEditingItem(null) }}
          onSave={handleSaveItem}
        />
      )}
    </div>
  )
}