// src/pages/reports/ReportsPage.jsx
import { useEffect, useState } from 'react'
import { subscribeToReservations } from '../../services/reservations.service'
import { RESERVATION_STATUS, getStatusLabels } from '../../utils/constants'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../store/useLanguage'

const CHART_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#ef4444', '#6b7280']

function StatCard({ title, value, subtitle }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

export default function ReportsPage() {
  const { t } = useLanguage()
  const statusLabels = getStatusLabels(t)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const unsub = subscribeToReservations(data => {
      setReservations(data)
      setLoading(false)
    })
    return unsub
  }, [])

  // ── Date pentru grafice ──────────────────────────────────

  // Rezervări pe zi (ultimele 14 zile)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().split('T')[0]
  })

  const byDay = last14Days.map(date => ({
    date:  date.slice(5), // MM-DD
    count: reservations.filter(r => r.date === date).length,
  }))

  // Distribuție pe status
  const byStatus = Object.entries(RESERVATION_STATUS).map(([, val], i) => ({
    name:  statusLabels[val],
    value: reservations.filter(r => r.status === val).length,
    color: CHART_COLORS[i],
  })).filter(s => s.value > 0)

  // Rezervări pe oră
  const byHour = Array.from({ length: 24 }, (_, h) => {
    const hour = String(h).padStart(2, '0')
    return {
      hour:  `${hour}:00`,
      count: reservations.filter(r => r.time?.startsWith(hour)).length,
    }
  }).filter(h => h.count > 0)

  // Stats generale
  const totalPersons   = reservations.reduce((sum, r) => sum + (Number(r.persons) || 0), 0)
  const avgPersons     = reservations.length ? (totalPersons / reservations.length).toFixed(1) : 0
  const thisMonth      = new Date().toISOString().slice(0, 7)
  const thisMonthCount = reservations.filter(r => r.date?.startsWith(thisMonth)).length

  // ── Export CSV ───────────────────────────────────────────
  function exportCSV() {
    const headers = [t('name'), t('phone'), t('email'), t('date'), t('time'), t('persons'), t('status'), t('notes')]
    const rows = reservations.map(r => [
      r.name || '',
      r.phone || '',
      r.email || '',
      r.date || '',
      r.time || '',
      r.persons || '',
      statusLabels[r.status] || r.status || '',
      r.notes || '',
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${t('reservationsTitle').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
          <h1 className="text-2xl font-bold text-gray-900">{t('reportsTitle')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('reportsSubtitle')}</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
          <ArrowDownTrayIcon className="h-4 w-4" />
          {t('exportCSV')}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('totalReservations')} value={reservations.length} />
        <StatCard title={t('thisMonth')}         value={thisMonthCount} />
        <StatCard title={t('totalPersons')}      value={totalPersons} />
        <StatCard title={t('avgPersons')}        value={avgPersons} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar chart — rezervări ultimele 14 zile */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t('last14Days')}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — distribuție status */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t('statusDistribution')}</h2>
          {byStatus.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
              {t('noReservationsYet')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={byStatus}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {byStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar chart — rezervări pe oră */}
        <div className="card lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t('byHour')}</h2>
          {byHour.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
              {t('noHourData')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byHour} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  )
}
