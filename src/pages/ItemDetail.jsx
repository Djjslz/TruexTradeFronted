import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getItemById, getComentarios, crearComentario } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/common/Avatar'

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
      <div className="detail">
        <div className="detail-media">
          {imagenes.length > 0 ? (
            <img src={imagenes[imagenActiva]} alt={item.titulo} />
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

          <button type="button" className="btn btn-primary">
            Proponer trueque
          </button>

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
    </div>
  )
}

export default ItemDetail
