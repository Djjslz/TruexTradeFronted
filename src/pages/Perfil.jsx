import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { eliminarItem } from '../services/api'
import { procesarAvatar } from '../utils/images'
import {
  validarClave,
  validarNombre,
  validarUbicacion,
  validarUsername,
} from '../utils/validators'
import Avatar from '../components/common/Avatar'
import StatCard from '../components/common/StatCard'
import ArticleCard from '../components/cards/ArticleCard'

function esPropietario(item, user) {
  const autor = item?.usuario
  if (!autor || typeof autor !== 'object') return false
  return String(autor.id) === String(user.id)
}

function Perfil() {
  const { user, token, logout, updateProfile, changePassword } = useAuth()
  const { items, cargando } = useItems()
  const [lista, setLista] = useState([])
  const [error, setError] = useState('')
  const [eliminando, setEliminando] = useState('')

  const [nombre, setNombre] = useState('')
  const [username, setUsername] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [avatar, setAvatar] = useState('')
  const [procesandoAvatar, setProcesandoAvatar] = useState(false)
  const [errorAvatar, setErrorAvatar] = useState('')
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [erroresPerfil, setErroresPerfil] = useState({})
  const [errorPerfil, setErrorPerfil] = useState('')
  const [okPerfil, setOkPerfil] = useState('')

  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [guardandoClave, setGuardandoClave] = useState(false)
  const [errorClave, setErrorClave] = useState('')
  const [okClave, setOkClave] = useState('')

  useEffect(() => {
    setLista(items)
  }, [items])

  useEffect(() => {
    if (!user) return
    setNombre(user.nombre ?? '')
    setUsername(user.username ?? '')
    setUbicacion(user.ubicacion ?? '')
    setAvatar(user.avatar ?? '')
  }, [user])

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

  const limpiarErrorPerfil = (campo) => {
    setErroresPerfil((actuales) => {
      if (!actuales[campo]) return actuales
      const nuevos = { ...actuales }
      delete nuevos[campo]
      return nuevos
    })
    setErrorPerfil('')
    setOkPerfil('')
  }

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

  const handleAvatar = async (evento) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return

    setErrorAvatar('')
    setProcesandoAvatar(true)

    try {
      setAvatar(await procesarAvatar(archivo))
    } catch (err) {
      setErrorAvatar(err.message)
    } finally {
      setProcesandoAvatar(false)
    }
  }

  const handleGuardarPerfil = async (evento) => {
    evento.preventDefault()

    const nuevos = {}
    if (!validarNombre(nombre)) nuevos.nombre = 'El nombre debe tener entre 2 y 60 caracteres.'
    if (!validarUsername(username)) {
      nuevos.username = 'Usa de 3 a 20 caracteres: letras, números, punto o guion bajo.'
    }
    if (!validarUbicacion(ubicacion)) nuevos.ubicacion = 'Indica tu ciudad o región.'

    setErroresPerfil(nuevos)
    if (Object.keys(nuevos).length > 0) return

    setGuardandoPerfil(true)
    setErrorPerfil('')
    setOkPerfil('')

    try {
      await updateProfile({ nombre, username, ubicacion, avatar })
      setOkPerfil('Perfil actualizado correctamente.')
    } catch (err) {
      setErrorPerfil(err.message)
    } finally {
      setGuardandoPerfil(false)
    }
  }

  const handleCambiarClave = async (evento) => {
    evento.preventDefault()
    setErrorClave('')
    setOkClave('')

    if (!actual) {
      setErrorClave('Ingresa tu contraseña actual.')
      return
    }
    if (!validarClave(nueva)) {
      setErrorClave('La nueva contraseña debe tener mínimo 8 caracteres con letra y número.')
      return
    }
    if (nueva !== confirmar) {
      setErrorClave('Las nuevas contraseñas no coinciden.')
      return
    }

    setGuardandoClave(true)

    try {
      await changePassword({ actual, nueva })
      setOkClave('Contraseña actualizada correctamente.')
      setActual('')
      setNueva('')
      setConfirmar('')
    } catch (err) {
      setErrorClave(err.message)
    } finally {
      setGuardandoClave(false)
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

      <section className="section" aria-label="Administrar perfil">
        <div className="section-header">
          <h2>Administrar perfil</h2>
        </div>

        {okPerfil && <p className="perfil-ok" role="status">{okPerfil}</p>}
        {errorPerfil && (
          <p className="form-alert" role="alert">
            {errorPerfil}
          </p>
        )}

        <form className="form" onSubmit={handleGuardarPerfil} noValidate>
          <div className="field">
            <span className="field-label">Foto de perfil</span>
            <div className="avatar-upload">
              <Avatar nombre={nombre || 'U'} src={avatar} size={72} />
              <div className="avatar-upload-actions">
                <label className="btn btn-outline btn-sm">
                  {procesandoAvatar ? 'Procesando…' : avatar ? 'Cambiar foto' : 'Subir foto'}
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatar}
                    disabled={procesandoAvatar}
                  />
                </label>
                {avatar && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setAvatar('')}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
            {errorAvatar && <span className="field-error">{errorAvatar}</span>}
          </div>

          <div className="auth-grid">
            <div className="field">
              <label className="field-label" htmlFor="perfil-nombre">
                Nombre
              </label>
              <input
                id="perfil-nombre"
                type="text"
                className={`input ${erroresPerfil.nombre ? 'input-error' : ''}`.trim()}
                value={nombre}
                onChange={(evento) => {
                  setNombre(evento.target.value)
                  limpiarErrorPerfil('nombre')
                }}
              />
              {erroresPerfil.nombre && (
                <span className="field-error">{erroresPerfil.nombre}</span>
              )}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="perfil-username">
                Usuario
              </label>
              <input
                id="perfil-username"
                type="text"
                className={`input ${erroresPerfil.username ? 'input-error' : ''}`.trim()}
                value={username}
                onChange={(evento) => {
                  setUsername(evento.target.value)
                  limpiarErrorPerfil('username')
                }}
              />
              {erroresPerfil.username && (
                <span className="field-error">{erroresPerfil.username}</span>
              )}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="perfil-ubicacion">
              Ubicación
            </label>
            <input
              id="perfil-ubicacion"
              type="text"
              className={`input ${erroresPerfil.ubicacion ? 'input-error' : ''}`.trim()}
              value={ubicacion}
              onChange={(evento) => {
                setUbicacion(evento.target.value)
                limpiarErrorPerfil('ubicacion')
              }}
            />
            {erroresPerfil.ubicacion && (
              <span className="field-error">{erroresPerfil.ubicacion}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={guardandoPerfil}>
            {guardandoPerfil ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </section>

      <section className="section" aria-label="Cambiar contraseña">
        <div className="section-header">
          <h2>Cambiar contraseña</h2>
        </div>

        {okClave && <p className="perfil-ok" role="status">{okClave}</p>}
        {errorClave && (
          <p className="form-alert" role="alert">
            {errorClave}
          </p>
        )}

        <form className="form" onSubmit={handleCambiarClave} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="clave-actual">
              Contraseña actual
            </label>
            <input
              id="clave-actual"
              type="password"
              className="input"
              value={actual}
              onChange={(evento) => {
                setActual(evento.target.value)
                setErrorClave('')
                setOkClave('')
              }}
              autoComplete="current-password"
            />
          </div>

          <div className="auth-grid">
            <div className="field">
              <label className="field-label" htmlFor="clave-nueva">
                Nueva contraseña
              </label>
              <input
                id="clave-nueva"
                type="password"
                className="input"
                value={nueva}
                onChange={(evento) => {
                  setNueva(evento.target.value)
                  setErrorClave('')
                  setOkClave('')
                }}
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="clave-confirmar">
                Confirmar nueva contraseña
              </label>
              <input
                id="clave-confirmar"
                type="password"
                className="input"
                value={confirmar}
                onChange={(evento) => {
                  setConfirmar(evento.target.value)
                  setErrorClave('')
                  setOkClave('')
                }}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={guardandoClave}>
            {guardandoClave ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default Perfil
