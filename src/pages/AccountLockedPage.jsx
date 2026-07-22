import { Link, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '../context/useAuth'

export default function AccountLockedPage() {
  const { logout, statusReason } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-wide">
            Vietnam Chronicles
          </h1>
        </div>

        <div className="bg-surface rounded-2xl border border-surface2 p-8 shadow-2xl text-center">
          <div className="flex justify-center mb-5">
            <Lock className="w-12 h-12 text-red-400" />
          </div>

          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Tài khoản bị khóa
          </h2>

          {statusReason && (
            <div className="bg-surface2 border border-gray-700 rounded-lg px-4 py-3 mb-5 text-sm text-gray-300 text-left">
              {statusReason}
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            Nếu bạn có thắc mắc, vui lòng xem{' '}
            <Link to="/policies" className="text-primary hover:text-primary/80 transition-colors">
              Chính sách sử dụng
            </Link>
          </p>

          <button
            onClick={handleLogout}
            className="w-full bg-surface2 hover:bg-surface2/80 text-gray-300 font-semibold rounded-lg px-4 py-2.5 transition-all"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}
