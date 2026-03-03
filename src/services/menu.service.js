// src/services/menu.service.js
import {
  collection, addDoc, doc, updateDoc,
  deleteDoc, orderBy, query, onSnapshot, Timestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'

const CATEGORIES = 'menu_categories'
const ITEMS      = 'menu_items'

export function subscribeToCategories(callback) {
  const q = query(collection(db, CATEGORIES), orderBy('order', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export function subscribeToItems(callback) {
  const q = query(collection(db, ITEMS), orderBy('name', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function addCategory(data) {
  return addDoc(collection(db, CATEGORIES), { ...data, createdAt: Timestamp.now() })
}

export async function addItem(data) {
  return addDoc(collection(db, ITEMS), { ...data, createdAt: Timestamp.now() })
}

export async function updateItem(id, data) {
  return updateDoc(doc(db, ITEMS, id), data)
}

export async function deleteItem(id) {
  return deleteDoc(doc(db, ITEMS, id))
}

export async function toggleItemAvailability(id, available) {
  return updateDoc(doc(db, ITEMS, id), { available })
}