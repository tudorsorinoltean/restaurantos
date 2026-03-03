// src/components/layout/Header.jsx
import { useNavigate } from 'react-router-dom'
import { ArrowRightOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../services/auth.service'
import { useLanguage, setLanguage } from '../../store/useLanguage'

export default function Header({ onMenuClick }) {
  const { user }    = useAuth()
  const { lang, t } = useLanguage()
  const navigate    = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'AD'
  const today = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <p className="text-sm text-gray-500 capitalize hidden sm:block">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Language switch */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setLanguage('ro')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              lang === 'ro'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            RO
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              lang === 'en'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            EN
          </button>
        </div>

        <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors ml-1"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="hidden sm:block">{t('logout')}</span>
        </button>
      </div>
    </header>
  )
}