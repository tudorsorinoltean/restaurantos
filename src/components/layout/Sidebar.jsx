// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import {
  HomeIcon, CalendarDaysIcon,
  Bars3BottomLeftIcon, ChartBarIcon, XMarkIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarSolid,
  Bars3BottomLeftIcon as MenuSolid,
  ChartBarIcon as ChartSolid,
} from '@heroicons/react/24/solid'
import { useLanguage } from '../../store/useLanguage'

export default function Sidebar({ onClose }) {
  const { t } = useLanguage()

  const navItems = [
    { to: '/dashboard',    label: t('dashboard'),    icon: HomeIcon,            iconActive: HomeIconSolid },
    { to: '/reservations', label: t('reservations'), icon: CalendarDaysIcon,    iconActive: CalendarSolid },
    { to: '/menu',         label: t('menu'),          icon: Bars3BottomLeftIcon, iconActive: MenuSolid },
    { to: '/reports',      label: t('reports'),       icon: ChartBarIcon,        iconActive: ChartSolid },
  ]
  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">

      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white text-lg">
            🍽
          </div>
          <span className="text-lg font-bold text-gray-900">
            Restaurant<span className="text-brand-500">OS</span>
          </span>
        </div>
        {/* Buton close — doar pe mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, iconActive: IconActive }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-50 text-brand-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive
                  ? <IconActive className="h-5 w-5 flex-shrink-0" />
                  : <Icon className="h-5 w-5 flex-shrink-0" />
                }
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 px-3">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <p className="text-xs text-gray-400">Sistema online</p>
        </div>
      </div>
    </div>
  )
}