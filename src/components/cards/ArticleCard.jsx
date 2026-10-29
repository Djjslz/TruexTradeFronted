import { Link } from 'react-router-dom'

function ArticleCard({ item }) {
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
        <Link to={`/producto/${item.id}`} className="btn btn-outline">
          Ver detalle
        </Link>
      </div>
    </article>
  )
}

export default ArticleCard
