import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import { getItemById, getComentarios, crearComentario } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/common/Avatar'

const CLAVE_FAVORITOS = 'truex-favoritos'
const CLAVE_ME_GUSTA = 'truex-me-gusta'

function leerGuardados(clave) {
  try {
    const valor = JSON.parse(window.localStorage.getItem(clave) ?? '[]')
    return Array.isArray(valor) ? valor : []
  } catch {
    return []
  }
}

function guardarGuardado(clave, id, activo) {
  const lista = new Set(leerGuardados(clave))
  if (activo) lista.add(String(id))
  else lista.delete(String(id))
  window.localStorage.setItem(clave, JSON.stringify([...lista]))
}

function formatearFecha(valor) {
  if (!valor) return ''
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ItemDetail() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const [item, setItem] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [imagenActiva, setImagenActiva] = useState(0)
  const [favorito, setFavorito] = useState(false)
  const [meGusta, setMeGusta] = useState(false)
  const [zoomAbierto, setZoomAbierto] = useState(false)
  const [zoomEscala, setZoomEscala] = useState(1)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })
  const [zoomOrigen, setZoomOrigen] = useState({ x: 50, y: 50 })
  const [arrastrandoZoom, setArrastrandoZoom] = useState(false)
  const arrastreZoom = useRef(null)

  const [comentarios, setComentarios] = useState([])
  const [cargandoComentarios, setCargandoComentarios] = useState(true)
  const [texto, setTexto] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)
  const [errorComentario, setErrorComentario] = useState('')

  useEffect(() => {
    let activo = true

    setCargando(true)
    setError('')

    getItemById(id)
      .then((datos) => {
        if (!activo) return
        setItem(datos)
        setImagenActiva(0)
      })
      .catch((err) => {
        if (activo) setError(err.message)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [id])

  useEffect(() => {
    setFavorito(leerGuardados(CLAVE_FAVORITOS).includes(String(id)))
    setMeGusta(leerGuardados(CLAVE_ME_GUSTA).includes(String(id)))
  }, [id])

  const alternarFavorito = () => {
    const nuevo = !favorito
    setFavorito(nuevo)
    guardarGuardado(CLAVE_FAVORITOS, id, nuevo)
  }

  const alternarMeGusta = () => {
    const nuevo = !meGusta
    setMeGusta(nuevo)
    guardarGuardado(CLAVE_ME_GUSTA, id, nuevo)
  }

  const limitarZoom = (valor) => Math.min(3, Math.max(1, Math.round(valor * 10) / 10))

  const restablecerZoom = () => {
    setZoomEscala(1)
    setZoomPos({ x: 0, y: 0 })
    setZoomOrigen({ x: 50, y: 50 })
  }

  const abrirZoom = () => {
    restablecerZoom()
    setZoomAbierto(true)
  }

  const cerrarZoom = () => {
    setZoomAbierto(false)
    setArrastrandoZoom(false)
    arrastreZoom.current = null
  }

  const cambiarZoom = (delta) => {
    const nueva = limitarZoom(zoomEscala + delta)
    setZoomEscala(nueva)
    if (nueva === 1) {
      setZoomPos({ x: 0, y: 0 })
      setZoomOrigen({ x: 50, y: 50 })
    }
  }

  const alternarZoom = (evento) => {
    if (arrastreZoom.current?.movido) return
    if (zoomEscala > 1) {
      restablecerZoom()
      return
    }

    const caja = evento.currentTarget.getBoundingClientRect()
    const x = ((evento.clientX - caja.left) / caja.width) * 100
    const y = ((evento.clientY - caja.top) / caja.height) * 100
    setZoomOrigen({
      x: Math.min(86, Math.max(14, x)),
      y: Math.min(86, Math.max(14, y)),
    })
    setZoomEscala(2.2)
  }

  const iniciarArrastreZoom = (evento) => {
    if (zoomEscala <= 1) return
    evento.currentTarget.setPointerCapture?.(evento.pointerId)
    arrastreZoom.current = {
      x: evento.clientX,
      y: evento.clientY,
      posX: zoomPos.x,
      posY: zoomPos.y,
      movido: false,
    }
    setArrastrandoZoom(true)
  }

  const moverArrastreZoom = (evento) => {
    const inicio = arrastreZoom.current
    if (!inicio) return

    const dx = evento.clientX - inicio.x
    const dy = evento.clientY - inicio.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) inicio.movido = true
    setZoomPos({ x: inicio.posX + dx, y: inicio.posY + dy })
  }

  const terminarArrastreZoom = (evento) => {
    if (!arrastreZoom.current) return
    if (evento.currentTarget.hasPointerCapture?.(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId)
    }
    setArrastrandoZoom(false)
    window.setTimeout(() => {
      arrastreZoom.current = null
    }, 0)
  }

  useEffect(() => {
    setZoomAbierto(false)
  }, [id])

  useEffect(() => {
    if (!zoomAbierto) return undefined

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const alTeclear = (evento) => {
      if (evento.key === 'Escape') cerrarZoom()
      else if (evento.key === '+' || evento.key === '=') cambiarZoom(0.4)
      else if (evento.key === '-') cambiarZoom(-0.4)
      else if (evento.key === '0') restablecerZoom()
    }

    document.addEventListener('keydown', alTeclear)

    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = overflowAnterior
    }
  }, [zoomAbierto, zoomEscala])

  useEffect(() => {
    let activo = true

    setCargandoComentarios(true)

    getComentarios(id)
      .then((datos) => {
        if (activo) setComentarios(datos)
      })
      .catch(() => {
        if (activo) setComentarios([])
      })
      .finally(() => {
        if (activo) setCargandoComentarios(false)
      })

    return () => {
      activo = false
    }
  }, [id])

  const handleComentario = async (evento) => {
    evento.preventDefault()

    const textoLimpio = texto.trim()
    if (!textoLimpio) {
      setErrorComentario('Escribe un comentario.')
      return
    }
    if (!user) {
      setErrorComentario('Inicia sesión para comentar.')
      return
    }

    setEnviandoComentario(true)
    setErrorComentario('')

    try {
      const nuevo = await crearComentario(
        id,
        {
          texto: textoLimpio,
          autor: { id: user.id, nombre: user.nombre, avatar: user.avatar ?? '' },
        },
        token,
      )
      setComentarios((actuales) => [...actuales, nuevo])
      setTexto('')
    } catch (err) {
      setErrorComentario(err.message)
    } finally {
      setEnviandoComentario(false)
    }
  }

  if (cargando) {
    return (
      <div className="container page">
        <p className="muted">Cargando artículo…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container page">
        <h1>No se pudo cargar el artículo</h1>
        <p className="muted">{error}</p>
        <Link to="/explorar" className="btn btn-primary">
          Volver a explorar
        </Link>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container page">
        <h1>Artículo no encontrado</h1>
        <Link to="/explorar" className="btn btn-primary">
          Volver a explorar
        </Link>
      </div>
    )
  }

  const imagenes = Array.isArray(item.imagenes) ? item.imagenes : []
  const usuario = item.usuario?.nombre ?? item.usuario ?? 'Usuario'

  return (
    <div className="container page">
      <div className="detail-topbar">
        <Link to="/explorar" className="detail-back">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Volver a explorar
        </Link>

        <Link
          to="/explorar"
          className="detail-close"
          aria-label="Cerrar artículo y volver a explorar"
          title="Cerrar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Link>
      </div>

      <div className="detail">
        <div className={`detail-media ${imagenes.length > 0 ? 'detail-media--zoomable' : ''}`.trim()}>
          {imagenes.length > 0 ? (
            <>
              <img src={imagenes[imagenActiva]} alt={item.titulo} />
              <button
                type="button"
                className="detail-zoom-btn"
                onClick={abrirZoom}
                aria-label={`Ampliar imagen de ${item.titulo}`}
              >
                <span className="detail-zoom-btn__badge">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.4-3.4M11 8v6M8 11h6" />
                  </svg>
                  Ampliar
                </span>
              </button>
            </>
          ) : (
            item.categoria
          )}
        </div>

        <div className="detail-body">
          <div className="detail-badges">
            <span className="badge">{item.categoria}</span>
            {item.estado && <span className="badge badge-neutral">{item.estado}</span>}
          </div>

          <h1>{item.titulo}</h1>
          <p>{item.descripcion}</p>

          <p className="detail-user">
            Publicado por {usuario}
            {item.ubicacion ? ` · ${item.ubicacion}` : ''}
          </p>

          <div className="detail-acciones">
            <button type="button" className="btn btn-primary">
              Proponer trueque
            </button>

            <div className="detail-social">
              <button
                type="button"
                className={`btn btn-ghost btn-sm detail-social__btn ${favorito ? 'is-active' : ''}`.trim()}
                aria-pressed={favorito}
                onClick={alternarFavorito}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={favorito ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
                </svg>
                Favoritos
              </button>

              <button
                type="button"
                className={`btn btn-ghost btn-sm detail-social__btn ${meGusta ? 'is-active' : ''}`.trim()}
                aria-pressed={meGusta}
                onClick={alternarMeGusta}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={meGusta ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
                Me gusta
              </button>
            </div>
          </div>

          {imagenes.length > 1 && (
            <div className="detail-thumbs">
              {imagenes.map((imagen, indice) => (
                <button
                  key={`${indice}-${imagen.slice(-24)}`}
                  type="button"
                  className={`detail-thumb ${indice === imagenActiva ? 'is-active' : ''}`.trim()}
                  onClick={() => setImagenActiva(indice)}
                  aria-label={`Ver imagen ${indice + 1}`}
                >
                  <img src={imagen} alt={`Vista ${indice + 1} de ${item.titulo}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="comentarios" aria-label="Comentarios">
        <div className="seccion-header">
          <h2>Comentarios ({comentarios.length})</h2>
        </div>

        {cargandoComentarios && <p className="muted">Cargando comentarios…</p>}

        {!cargandoComentarios && comentarios.length === 0 && (
          <p className="muted">Aún no hay comentarios. ¡Sé el primero en opinar!</p>
        )}

        {!cargandoComentarios && comentarios.length > 0 && (
          <ul className="comentarios-lista">
            {comentarios.map((comentario) => (
              <li className="comentario" key={comentario.id}>
                <Avatar
                  nombre={comentario.autor?.nombre ?? 'Usuario'}
                  src={comentario.autor?.avatar}
                  size={40}
                />
                <div className="comentario-cuerpo">
                  <div className="comentario-cabecera">
                    <strong>{comentario.autor?.nombre ?? 'Usuario'}</strong>
                    <span>{formatearFecha(comentario.createdAt)}</span>
                  </div>
                  <p>{comentario.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {user ? (
          <form className="comentario-form" onSubmit={handleComentario}>
            <textarea
              className="input"
              rows="3"
              maxLength="500"
              placeholder="Escribe un comentario…"
              value={texto}
              onChange={(evento) => {
                setTexto(evento.target.value)
                setErrorComentario('')
              }}
            />
            {errorComentario && <span className="field-error">{errorComentario}</span>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={enviandoComentario || !texto.trim()}
            >
              {enviandoComentario ? 'Enviando…' : 'Comentar'}
            </button>
          </form>
        ) : (
          <p className="comentario-login">
            <Link to="/login">Inicia sesión</Link> para dejar un comentario.
          </p>
        )}
      </section>

      {zoomAbierto &&
        imagenes.length > 0 &&
        createPortal(
          <div
            className="detail-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Imagen ampliada de ${item.titulo}`}
            onClick={(evento) => {
              if (evento.target === evento.currentTarget) cerrarZoom()
            }}
          >
            <div className="detail-lightbox__panel">
              <div className="detail-lightbox__bar">
                <span className="detail-lightbox__title">{item.titulo}</span>
                <button
                  type="button"
                  className="detail-lightbox__close"
                  onClick={cerrarZoom}
                  aria-label="Cerrar imagen ampliada"
                  autoFocus
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <div
                className={`detail-lightbox__stage${zoomEscala > 1 ? ' is-zoomed' : ''}${
                  arrastrandoZoom ? ' is-dragging' : ''
                }`}
                onClick={alternarZoom}
                onPointerDown={iniciarArrastreZoom}
                onPointerMove={moverArrastreZoom}
                onPointerUp={terminarArrastreZoom}
                onPointerCancel={terminarArrastreZoom}
              >
                <img
                  src={imagenes[imagenActiva]}
                  alt={item.titulo}
                  draggable={false}
                  style={{
                    transform: `translate(${zoomPos.x}px, ${zoomPos.y}px) scale(${zoomEscala})`,
                    transformOrigin: `${zoomOrigen.x}% ${zoomOrigen.y}%`,
                  }}
                />
              </div>

              <div className="detail-lightbox__tools">
                <div className="detail-lightbox__zoom">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => cambiarZoom(-0.4)}
                    disabled={zoomEscala <= 1}
                    aria-label="Alejar imagen"
                  >
                    −
                  </button>
                  <span className="detail-lightbox__nivel" aria-live="polite">
                    {Math.round(zoomEscala * 100)}%
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => cambiarZoom(0.4)}
                    disabled={zoomEscala >= 3}
                    aria-label="Acercar imagen"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={restablecerZoom}
                    disabled={zoomEscala === 1 && zoomPos.x === 0 && zoomPos.y === 0}
                  >
                    Restablecer
                  </button>
                </div>
                <span className="detail-lightbox__ayuda">
                  Haz clic en la foto para acercar · Arrastra para mover
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default ItemDetail
