import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function ProtectedRoute({ children, requiereAdmin = false }) {
  const { isAuthenticated, isAdmin, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="container page">
        <p className="muted">Cargando tu sesión.</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (requiereAdmin && !isAdmin) {
    return (
      <div className="container page">
        <h1>Acceso restringido</h1>
        <p className="muted">
          Esta sección está disponible solo para administradores.
        </p>
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
