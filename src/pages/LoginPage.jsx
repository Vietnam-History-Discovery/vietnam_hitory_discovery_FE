import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-wide">
            Vietnam Chronicles
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Sign in to explore Vietnamese history
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-surface2 p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-gray-100 mb-6">Welcome back</h2>

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-400 rounded-lg px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-surface2 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-surface2 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg px-4 py-2.5 transition-all mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
