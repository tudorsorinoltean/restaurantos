// src/pages/reservations/ReservationsPage.jsx
import { useEffect, useState } from 'react'
import { subscribeToReservations, updateReservationStatus, addReservation } from '../../services/reservations.service'
import { STATUS_LABELS, STATUS_COLORS, getStatusLabels } from '../../utils/constants'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../store/useLanguage'

function StatusBadge({ status, statusLabels }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {statusLabels[status]}
    </span>
  )
}

function AddReservationModal({ onClose, onSave }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    date: '', time: '19:00', persons: 2, notes: ''
  })
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'persons' ? Number(value) : value }))
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
          <h2 className="text-lg font-semibold text-gray-900">{t('newReservationTitle')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')} *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')} *</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')} *</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')} *</label>
              <input name="time" type="time" value={form.time} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('persons')} *</label>
              <input name="persons" type="number" min="1" max="20" value={form.persons} onChange={handleChange} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input resize-none" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">{t('cancel')}</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ReservationsPage() {
  const { t } = useLanguage()
  const statusLabels = getStatusLabels(t)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal]       = useState(false)

  useEffect(() => {
    const unsub = subscribeToReservations(data => {
      setReservations(data)
      setLoading(false)
    })
    return unsub
  }, [])

  async function handleStatusChange(id, newStatus) {
    await updateReservationStatus(id, newStatus)
  }

  async function handleAddReservation(data) {
    await addReservation(data)
  }

  const filtered = reservations
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .filter(r =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search) ||
      r.date?.includes(search)
    )

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
          <h1 className="text-2xl font-bold text-gray-900">{t('reservationsTitle')}</h1>
          <p className="text-sm text-gray-500 mt-1">{reservations.length} {t('reservationsTotal')}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          {t('newReservation')}
        </button>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="input pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input sm:w-48"
          >
            <option value="all">{t('allStatuses')}</option>
            {Object.entries(statusLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('noReservationsFound')}</p>
          </div>
        ) : (
          <>
            {/* Tabel — doar desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('name')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('phone')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('date')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('time')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('personsShort')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('notes')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('status')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{r.name}</td>
                      <td className="py-3 px-4 text-gray-600">{r.phone}</td>
                      <td className="py-3 px-4 text-gray-600">{r.date}</td>
                      <td className="py-3 px-4 text-gray-600">{r.time}</td>
                      <td className="py-3 px-4 text-gray-600">{r.persons}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs max-w-[120px] truncate">{r.notes || '—'}</td>
                      <td className="py-3 px-4"><StatusBadge status={r.status} statusLabels={statusLabels} /></td>
                      <td className="py-3 px-4">
                        <select
                          value={r.status}
                          onChange={e => handleStatusChange(r.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          {Object.entries(statusLabels).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Carduri — doar mobile */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map(r => (
                <div key={r.id} className="p-4 space-y-2">
                  {/* Rând 1: Nume + Status */}
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{r.name}</p>
                    <StatusBadge status={r.status} statusLabels={statusLabels} />
                  </div>
                  {/* Rând 2: Data, Ora, Persoane */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>📅 {r.date}</span>
                    <span>🕐 {r.time}</span>
                    <span>👥 {r.persons} pers.</span>
                  </div>
                  {/* Rând 3: Telefon */}
                  <p className="text-xs text-gray-500">📞 {r.phone}</p>
                  {/* Rând 4: Note dacă există */}
                  {r.notes && (
                    <p className="text-xs text-gray-400 italic">"{r.notes}"</p>
                  )}
                  {/* Rând 5: Schimbare status */}
                  <select
                    value={r.status}
                    onChange={e => handleStatusChange(r.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full mt-1"
                  >
                    {Object.entries(statusLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddReservationModal
          onClose={() => setShowModal(false)}
          onSave={handleAddReservation}
        />
      )}

    </div>
  )
}
