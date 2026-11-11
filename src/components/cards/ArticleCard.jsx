import { Link } from 'react-router-dom'

function ArticleCard({ item, onDelete }) {
  const imagen = Array.isArray(item.imagenes) ? item.imagenes[0] : null

  return (
    <article className="card">
      <div className="card-media">
        {imagen ? <img src={imagen} alt={item.titulo} loading="lazy" /> : item.categoria}
      </div>
      <div className="card-body">
        <h3>{item.titulo}</h3>
        <p>{item.descripcion}</p>
        {item.ubicacion && <span className="card-meta">{item.ubicacion}</span>}
        <div className="card-actions">
          <Link to={`/producto/${item.id}`} className="btn btn-outline">
            Ver detalle
          </Link>
          {onDelete && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(item)}
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
