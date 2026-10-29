import { Link } from 'react-router-dom'
import ArticleCard from '../components/cards/ArticleCard'
import { useItems } from '../hooks/useItems'

function Home() {
  const { items, cargando, error } = useItems()

  return (
    <div className="container page">
      <section className="hero">
        <p className="hero-tag">Trueques en línea</p>
        <h1>Dale una segunda vida a lo que ya no usas</h1>
        <p className="hero-text">
          Publica tus artículos, descubre lo que otros ofrecen y cierra un
          trueque sin dinero de por medio.
        </p>
        <div className="hero-actions">
          <Link to="/explorar" className="btn btn-primary">
            Explorar trueques
          </Link>
          <Link to="/publicar" className="btn btn-outline">
            Publicar un artículo
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Trueques recientes</h2>
          <Link to="/explorar">Ver todos</Link>
        </div>

        {cargando && <p className="empty">Cargando trueques…</p>}
        {!cargando && error && <p className="empty">{error}</p>}
        {!cargando && !error && items.length === 0 && (
          <p className="empty">Aún no hay publicaciones. ¡Sé el primero en publicar!</p>
        )}

        {!cargando && !error && items.length > 0 && (
          <div className="grid">
            {items.map((item) => (
              <ArticleCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
