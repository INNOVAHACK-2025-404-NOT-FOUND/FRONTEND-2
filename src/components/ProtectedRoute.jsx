import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth.js'

export default function ProtectedRoute({ children, roles }) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
