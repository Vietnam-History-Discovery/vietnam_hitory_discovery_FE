import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import AdminSidebar from '../components/admin/AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="hidden md:flex shrink-0">
          <AdminSidebar />
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
