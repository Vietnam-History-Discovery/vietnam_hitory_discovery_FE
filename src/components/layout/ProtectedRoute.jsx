import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user, userStatus } = useAuth()
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (user && userStatus === 'INACTIVE') {
    return <Navigate to="/account-locked" replace />
  }
  return children
}
