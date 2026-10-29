import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getItemById } from '../services/api'

const ETIQUETAS_TIPO = {
  trueque: 'Trueque',
  venta: 'Venta',
  ambos: 'Trueque o venta',
}

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function ItemDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [imagenActiva, setImagenActiva] = useState(0)

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
  const tienePrecio = Number(item.precio) > 0

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
            {item.tipo && (
              <span
                className={`badge ${
                  item.tipo === 'venta'
                    ? 'badge-venta'
                    : item.tipo === 'ambos'
                      ? 'badge-ambos'
                      : ''
                }`.trim()}
              >
                {ETIQUETAS_TIPO[item.tipo] ?? item.tipo}
              </span>
            )}
            {item.estado && <span className="badge badge-neutral">{item.estado}</span>}
          </div>

          <h1>{item.titulo}</h1>
          <p>{item.descripcion}</p>

          {tienePrecio && <p className="detail-price">{formatoPrecio.format(item.precio)}</p>}

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
    </div>
  )
}

export default ItemDetail
