import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useContent } from '../hooks/useContent'
import { procesarImagen } from '../utils/images'
import heroPortada from '../assets/images/hero-portada-panel.jpg'

const CAMPOS_IMAGEN = [
  {
    clave: 'imagenPrincipal',
    etiqueta: 'Imagen del hero',
    ayuda: 'Ocupa todo el recuadro del hero. Si la quitas, vuelve la portada por defecto.',
    respaldo: heroPortada,
  },
]

function Admin() {
  const { user } = useAuth()
  const { contenido, actualizarVisual, restablecer } = useContent()
  const [borrador, setBorrador] = useState(() => ({
    ...contenido.inicio.hero.visual,
  }))
  const [procesando, setProcesando] = useState('')
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const cambiar = (campo, valor) => {
    setBorrador((actual) => ({ ...actual, [campo]: valor }))
    setAviso('')
  }

  const handleArchivo = async (campo, evento) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return

    setError('')
    setAviso('')
    setProcesando(campo)

    try {
      const imagen = await procesarImagen(archivo)
      cambiar(campo, imagen)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcesando('')
    }
  }

  const quitarImagen = (campo) => {
    cambiar(campo, '')
  }

  const guardar = (evento) => {
    evento.preventDefault()
    setError('')

    try {
      actualizarVisual(borrador)
      setAviso('Cambios guardados. Ya se ven en la página de inicio.')
    } catch (err) {
      setError(err.message)
    }
  }

  const restaurar = () => {
    const nuevo = restablecer()
    setBorrador({ ...nuevo.inicio.hero.visual })
    setError('')
    setAviso('Contenido restaurado a los valores originales.')
  }

  const ocupado = Boolean(procesando)

  return (
    <div className="container page admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Panel de administración</p>
          <h1>Contenido de las vistas</h1>
          <p className="muted">
            Edita los textos e imágenes de la landing pública
            {user?.nombre ? `, ${user.nombre}` : ''}.
          </p>
        </div>
        <Link to="/" className="btn btn-outline btn-sm">
          Ver sitio
        </Link>
      </header>

      <div className="admin-layout">
        <aside className="admin-nav" aria-label="Vistas editables">
          <span className="admin-nav-title">Vistas</span>
          <button type="button" className="admin-nav-item is-active">
            Inicio
            <small>Hero visual</small>
          </button>
          <span className="admin-nav-item is-disabled">
            Explorar
            <small>Próximamente</small>
          </span>
          <span className="admin-nav-item is-disabled">
            Perfil
            <small>Próximamente</small>
          </span>
        </aside>

        <form className="admin-panel" onSubmit={guardar} noValidate>
          <div className="admin-panel-header">
            <h2>Inicio · Hero visual</h2>
            <p className="muted">
              Personaliza la imagen y el texto del hero.
            </p>
          </div>

          {error && (
            <p className="form-alert" role="alert">
              {error}
            </p>
          )}
          {aviso && (
            <p className="admin-success" role="status">
              {aviso}
            </p>
          )}

          <div className="admin-images">
            {CAMPOS_IMAGEN.map((campo) => (
              <div className="admin-image-card" key={campo.clave}>
                <div className="admin-image-preview">
                  <img
                    src={borrador[campo.clave] || campo.respaldo}
                    alt={campo.etiqueta}
                  />
                </div>

                <div className="admin-image-body">
                  <span className="field-label">{campo.etiqueta}</span>
                  <small>{campo.ayuda}</small>

                  <div className="admin-image-actions">
                    <label className="btn btn-outline btn-sm">
                      {procesando === campo.clave ? 'Procesando…' : 'Subir imagen'}
                      <input
                        type="file"
                        className="upload-input"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(evento) => handleArchivo(campo.clave, evento)}
                        disabled={ocupado}
                      />
                    </label>

                    {borrador[campo.clave] && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => quitarImagen(campo.clave)}
                        disabled={ocupado}
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="admin-manuscrito">
              Texto del hero
            </label>
            <textarea
              id="admin-manuscrito"
              className="input"
              rows="3"
              value={borrador.textoManuscrito}
              onChange={(evento) =>
                cambiar('textoManuscrito', evento.target.value)
              }
              placeholder="Intercambia Ahora"
            />
            <small>
              Se muestra con el efecto de fragmentos en el hero. Usa un salto de
              línea para separar las frases.
            </small>
          </div>

          <div className="admin-actions">
            <button type="submit" className="btn btn-primary" disabled={ocupado}>
              Guardar cambios
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={restaurar}
              disabled={ocupado}
            >
              Restaurar original
            </button>
          </div>
        </form>

        <aside className="admin-preview" aria-label="Vista previa del hero">
          <span className="admin-nav-title">Vista previa</span>
          <div className="hero-visual admin-hero-preview">
            <img
              className="hero-visual__fondo"
              src={borrador.imagenPrincipal || heroPortada}
              alt=""
              aria-hidden="true"
            />
            <div className="hero-visual__velo" aria-hidden="true" />
            <div className="manoescrito">{borrador.textoManuscrito}</div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Admin
