import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial = user?.username?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || 'U'

  return (
    <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b border-surface2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="text-primary font-bold tracking-[0.2em] text-sm uppercase shrink-0"
          >
            Vietnam Chronicles
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/dynasties"
              className={`text-sm transition-colors ${isActive('/dynasties') ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            >
              Dynasties
            </Link>
            <Link
              to="/timeline"
              className={`text-sm transition-colors ${isActive('/timeline') ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            >
              Timeline
            </Link>
            <Link
              to="/articles"
              className={`text-sm transition-colors ${isActive('/articles') ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            >
              Articles
            </Link>
            <Link
              to="/chat"
              className={`text-sm transition-colors ${isActive('/chat') ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            >
              Chat
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
              {initial}
            </div>

            {/* Username (md+) */}
            <span className="hidden md:block text-sm text-gray-400">
              {user?.username || user?.email?.split('@')[0] || 'User'}
            </span>

            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors ml-1"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
