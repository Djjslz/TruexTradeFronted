import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function ProtectedRoute({ children }) {
  const { isAuthenticated, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="container page">
        <p className="muted">Cargando tu sesión…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
