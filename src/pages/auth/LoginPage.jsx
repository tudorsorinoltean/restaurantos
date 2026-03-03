// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../services/auth.service'
import { useLanguage } from '../../store/useLanguage'

export default function LoginPage() {
  const { t } = useLanguage()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(t('wrongCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">🍽</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">RestaurantOS</h1>
          <p className="text-sm text-gray-500 mt-1">{t('loginTitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="admin@restaurantos.dev"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parolă
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : null}
            {loading ? t('loggingIn') : t('loginButton')}
          </button>
        </form>
      </div>
    </div>
  )
}
