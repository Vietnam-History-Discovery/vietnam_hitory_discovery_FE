import { NavLink } from 'react-router-dom'
import { Users, FileText, ArrowLeft } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/articles', label: 'Bài viết', icon: FileText },
]

export default function AdminSidebar() {
  return (
    <div className="w-64 bg-surface flex flex-col border-r border-surface2 shrink-0 h-full">
      <div className="px-4 py-4 border-b border-surface2 shrink-0">
        <span className="text-[10px] uppercase tracking-widest font-medium text-gray-400">
          Quản trị
        </span>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto min-h-0">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 border-r-2 border-primary text-primary'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-surface2/60'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-surface2 shrink-0">
        <NavLink
          to="/"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại trang chính
        </NavLink>
      </div>
    </div>
  )
}
