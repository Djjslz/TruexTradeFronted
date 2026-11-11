import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { eliminarItem } from '../services/api'
import Avatar from '../components/common/Avatar'
import StatCard from '../components/common/StatCard'
import ArticleCard from '../components/cards/ArticleCard'

function esPropietario(item, user) {
  const autor = item?.usuario
  if (!autor || typeof autor !== 'object') return false
  return String(autor.id) === String(user.id)
}

function Perfil() {
  const { user, token, logout } = useAuth()
  const { items, cargando } = useItems()
  const [lista, setLista] = useState([])
  const [error, setError] = useState('')
  const [eliminando, setEliminando] = useState('')

  useEffect(() => {
    setLista(items)
  }, [items])

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
  const misPublicaciones = lista.filter((item) => esPropietario(item, user))

  const handleEliminar = async (item) => {
    const confirmado = window.confirm(
      `¿Eliminar "${item.titulo}"? Esta acción no se puede deshacer.`,
    )
    if (!confirmado) return

    setEliminando(item.id)
    setError('')

    try {
      await eliminarItem(item.id, token)
      setLista((actuales) => actuales.filter((publicacion) => publicacion.id !== item.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setEliminando('')
    }
  }

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
        <StatCard valor={misPublicaciones.length} etiqueta="Publicaciones" />
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

      <section className="section" aria-label="Mis publicaciones">
        <div className="section-header">
          <h2>Mis publicaciones</h2>
        </div>

        {error && (
          <p className="form-alert" role="alert">
            {error}
          </p>
        )}

        {cargando && <p className="empty">Cargando publicaciones…</p>}

        {!cargando && misPublicaciones.length === 0 && (
          <p className="empty">
            Aún no has publicado nada. ¡Publica tu primer artículo!
          </p>
        )}

        {misPublicaciones.length > 0 && (
          <div className="grid">
            {misPublicaciones.map((item) => (
              <ArticleCard
                key={item.id}
                item={item}
                onDelete={eliminando ? undefined : handleEliminar}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Perfil
