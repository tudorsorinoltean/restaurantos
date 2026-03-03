// src/services/reservations.service.js
import {
  collection, addDoc, doc,
  updateDoc, query, where,
  orderBy, Timestamp, onSnapshot, getDocs
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { RESERVATION_STATUS } from '../utils/constants'

const COL = 'reservations'

export async function addReservation(data) {
  return addDoc(collection(db, COL), {
    ...data,
    status: RESERVATION_STATUS.PENDING,
    createdAt: Timestamp.now(),
  })
}

export function subscribeToReservations(callback) {
  const q = query(
    collection(db, COL),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snap => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(items)
  })
}

export async function updateReservationStatus(id, status) {
  return updateDoc(doc(db, COL, id), { status })
}

export async function getReservationsByDate(dateString) {
  const q = query(
    collection(db, COL),
    where('date', '==', dateString),
    orderBy('time', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}