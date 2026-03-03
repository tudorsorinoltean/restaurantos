// src/pages/dashboard/DashboardPage.jsx
import { useEffect, useState } from "react";
import { subscribeToReservations } from "../../services/reservations.service";
import {
  RESERVATION_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  getStatusLabels,
} from "../../utils/constants";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../store/useLanguage";

function KpiCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`${bg} p-3 rounded-xl`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status, statusLabels }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const statusLabels = getStatusLabels(t);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToReservations((data) => {
      setReservations(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // KPI calculations
  const today = new Date().toISOString().split("T")[0];
  const todayRes = reservations.filter((r) => r.date === today);
  const pending = reservations.filter(
    (r) => r.status === RESERVATION_STATUS.PENDING,
  );
  const confirmed = reservations.filter(
    (r) => r.status === RESERVATION_STATUS.CONFIRMED,
  );
  const cancelled = reservations.filter(
    (r) => r.status === RESERVATION_STATUS.CANCELLED,
  );
  const recent = reservations.slice(0, 8);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboardTitle')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString("ro-RO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title={t('reservationsToday')}
          value={todayRes.length}
          icon={CalendarDaysIcon}
          color="text-brand-500"
          bg="bg-brand-50"
        />
        <KpiCard
          title={t('pending')}
          value={pending.length}
          icon={ClockIcon}
          color="text-yellow-500"
          bg="bg-yellow-50"
        />
        <KpiCard
          title={t('confirmed')}
          value={confirmed.length}
          icon={CheckCircleIcon}
          color="text-blue-500"
          bg="bg-blue-50"
        />
        <KpiCard
          title={t('cancelled')}
          value={cancelled.length}
          icon={XCircleIcon}
          color="text-red-500"
          bg="bg-red-50"
        />
      </div>

      {/* Recent reservations */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('recentReservations')}
        </h2>

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('noReservations')}</p>
            <p className="text-sm text-gray-400 mt-1">
              {t('noReservationsHint')}
            </p>
          </div>
        ) : (
          <>
            {/* Tabel — doar desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">{t('name')}</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">{t('date')}</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">{t('time')}</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">{t('persons')}</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 font-medium text-gray-900">{r.name}</td>
                      <td className="py-3 px-2 text-gray-600">{r.date}</td>
                      <td className="py-3 px-2 text-gray-600">{r.time}</td>
                      <td className="py-3 px-2 text-gray-600">{r.persons}</td>
                      <td className="py-3 px-2"><StatusBadge status={r.status} statusLabels={statusLabels} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Carduri — doar mobile */}
            <div className="sm:hidden space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 pr-3">
                    <p className="font-medium text-gray-900 text-sm truncate">{r.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.date} • {r.time} • {r.persons} pers.</p>
                  </div>
                  <StatusBadge status={r.status} statusLabels={statusLabels} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
