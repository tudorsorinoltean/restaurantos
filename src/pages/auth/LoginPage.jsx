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
                {t('password')}
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

        {/* Demo credentials */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">Demo Access</p>
          <div className="space-y-1 text-sm text-amber-900">
            <div className="flex justify-between">
              <span className="text-amber-700">Email</span>
              <span className="font-mono">demo@restaurantos.app</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">Password</span>
              <span className="font-mono">Demo1234!</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setEmail('demo@restaurantos.app'); setPassword('Demo1234!') }}
            className="mt-3 w-full text-sm text-amber-800 font-medium border border-amber-300 rounded-md py-1.5 hover:bg-amber-100 transition-colors"
          >
            Use demo credentials
          </button>
        </div>
      </div>
    </div>
  )
}
