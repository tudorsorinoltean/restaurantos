// src/pages/calendar/CalendarPage.jsx
import { useEffect, useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { ro } from 'date-fns/locale'
import { subscribeToReservations } from '../../services/reservations.service'
import { getStatusLabels } from '../../utils/constants'
import { useLanguage } from '../../store/useLanguage'
import { XMarkIcon } from '@heroicons/react/24/outline'

const STATUS_EVENT_COLORS = {
  pending:   '#f97316',
  confirmed: '#3b82f6',
  arrived:   '#22c55e',
  cancelled: '#ef4444',
  no_show:   '#6b7280',
}

const messagesRO = {
  allDay:           'Toată ziua',
  previous:         '‹ Înapoi',
  next:             'Înainte ›',
  today:            'Azi',
  month:            'Lună',
  week:             'Săptămână',
  day:              'Zi',
  agenda:           'Agendă',
  date:             'Dată',
  time:             'Oră',
  event:            'Rezervare',
  noEventsInRange:  'Nicio rezervare în această perioadă.',
  showMore: total => `+ ${total} mai multe`,
}

const messagesEN = {
  allDay:           'All day',
  previous:         '‹ Back',
  next:             'Next ›',
  today:            'Today',
  month:            'Month',
  week:             'Week',
  day:              'Day',
  agenda:           'Agenda',
  date:             'Date',
  time:             'Time',
  event:            'Reservation',
  noEventsInRange:  'No reservations in this period.',
  showMore: total => `+ ${total} more`,
}

export default function CalendarPage() {
  const { t, lang } = useLanguage()
  const statusLabels = getStatusLabels(t)
  const [reservations, setReservations]   = useState([])
  const [loading, setLoading]             = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const locale    = lang === 'ro' ? ro : enUS
  const culture   = lang === 'ro' ? 'ro' : 'en-GB'
  const messages  = lang === 'ro' ? messagesRO : messagesEN

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale }),
    getDay,
    locales: { 'ro': ro, 'en-GB': enUS },
  })

  useEffect(() => {
    const unsub = subscribeToReservations(data => {
      setReservations(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const events = useMemo(() =>
    reservations
      .filter(r => r.date && r.time)
      .map(r => {
        const start = new Date(`${r.date}T${r.time}`)
        const end   = addMinutes(start, 90)
        return {
          title:    `${r.name} (${r.persons} pers.)`,
          start,
          end,
          resource: r,
        }
      }),
    [reservations]
  )

  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: STATUS_EVENT_COLORS[event.resource?.status] || '#6b7280',
      border: 'none',
      borderRadius: '4px',
      color: 'white',
      fontSize: '12px',
    },
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
    </div>
  )

  const r = selectedEvent?.resource

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('calendar')}</h1>
      </div>

      {/* Calendar */}
      <div className="card p-4">
        <Calendar
          localizer={localizer}
          culture={culture}
          messages={messages}
          events={events}
          defaultView="month"
          views={['month', 'week', 'day']}
          style={{ minHeight: 700 }}
          eventPropGetter={eventPropGetter}
          onSelectEvent={setSelectedEvent}
        />
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{r.name}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Detail rows */}
            <div className="divide-y divide-gray-100">
              {[
                { label: t('phone'),   value: r.phone },
                { label: t('email'),   value: r.email },
                { label: t('date'),    value: r.date },
                { label: t('time'),    value: r.time },
                { label: t('persons'), value: r.persons },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-900">{value || '—'}</span>
                </div>
              ))}

              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">{t('status')}</span>
                <span
                  className="font-medium"
                  style={{ color: STATUS_EVENT_COLORS[r.status] || '#6b7280' }}
                >
                  {statusLabels[r.status] || r.status}
                </span>
              </div>

              {r.notes && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-500">{t('notes')}</span>
                  <span className="text-gray-900 text-right max-w-[220px]">{r.notes}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="btn-secondary w-full"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
