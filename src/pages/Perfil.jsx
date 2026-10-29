import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/common/Avatar'
import StatCard from '../components/common/StatCard'

function Perfil() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="container page">
        <h1>Mi perfil</h1>
        <p className="muted">Inicia sesión para ver tu perfil y tus trueques.</p>
        <Link to="/login" className="btn btn-primary">
          Iniciar sesión
        </Link>
      </div>
    )
  }

  const { stats = {} } = user

  return (
    <div className="container page">
      <section className="profile-header">
        <Avatar nombre={user.nombre} src={user.avatar} size={72} />
        <div>
          <h1>{user.nombre}</h1>
          <p className="profile-meta">
            @{user.username}
            {user.ubicacion ? ` · ${user.ubicacion}` : ''}
          </p>
          <p className="profile-meta">{user.email}</p>
        </div>
      </section>

      <div className="profile-stats">
        <StatCard valor={stats.publicaciones ?? 0} etiqueta="Publicaciones" />
        <StatCard valor={stats.intercambios ?? 0} etiqueta="Intercambios" />
        <StatCard valor={stats.calificacion ?? 0} etiqueta="Calificación" />
      </div>

      <div className="profile-actions">
        <Link to="/publicar" className="btn btn-primary">
          Publicar artículo
        </Link>
        <Link to="/explorar" className="btn btn-outline">
          Explorar trueques
        </Link>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default Perfil
