import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}
