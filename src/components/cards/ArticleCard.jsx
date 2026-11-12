import { Link, useNavigate } from 'react-router-dom'

function ArticleCard({ item, onDelete }) {
  const navigate = useNavigate()
  const imagen = Array.isArray(item.imagenes) ? item.imagenes[0] : null
  const abrir = () => navigate(`/producto/${item.id}`)

  const alPresionarTecla = (evento) => {
    if (evento.target !== evento.currentTarget) return
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault()
      abrir()
    }
  }

  return (
    <article
      className="card"
      role="link"
      tabIndex={0}
      onClick={abrir}
      onKeyDown={alPresionarTecla}
      aria-label={item.titulo}
    >
      <div className="card-media">
        {imagen ? <img src={imagen} alt={item.titulo} loading="lazy" /> : item.categoria}
      </div>
      <div className="card-body">
        <h3>{item.titulo}</h3>
        <p>{item.descripcion}</p>
        {item.ubicacion && <span className="card-meta">{item.ubicacion}</span>}
        <div className="card-actions">
          <Link
            to={`/producto/${item.id}`}
            className="btn btn-outline"
            onClick={(evento) => evento.stopPropagation()}
          >
            Ver detalle
          </Link>
          {onDelete && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={(evento) => {
                evento.stopPropagation()
                onDelete(item)
              }}
              onKeyDown={(evento) => evento.stopPropagation()}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ArticleCard
