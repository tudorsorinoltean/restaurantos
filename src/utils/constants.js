// src/utils/constants.js
export const RESERVATION_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  ARRIVED:   'arrived',
  CANCELLED: 'cancelled',
  NO_SHOW:   'no_show',
}

export const STATUS_LABELS = {
  pending:   'În așteptare',
  confirmed: 'Confirmată',
  arrived:   'Sosit',
  cancelled: 'Anulată',
  no_show:   'Neprezent',
}

export const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  arrived:   'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show:   'bg-gray-100 text-gray-800',
}