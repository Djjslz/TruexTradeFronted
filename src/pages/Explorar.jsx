import { useMemo, useState } from 'react'
import ArticleCard from '../components/cards/ArticleCard'
import { useItems } from '../hooks/useItems'

function Explorar() {
  const { items, cargando, error } = useItems()
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return items
    return items.filter((item) =>
      [item.titulo, item.categoria, item.descripcion, item.ubicacion]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(texto)),
    )
  }, [items, busqueda])

  return (
    <div className="container page">
      <div className="section-header">
        <h1>Explorar trueques</h1>
      </div>

      <input
        type="search"
        className="input search"
        placeholder="Buscar por título, categoría o ubicación"
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
      />

      {cargando && <p className="empty">Cargando artículos…</p>}
      {!cargando && error && <p className="empty">{error}</p>}
      {!cargando && !error && filtrados.length === 0 && (
        <p className="empty">No se encontraron artículos.</p>
      )}

      {!cargando && !error && filtrados.length > 0 && (
        <div className="grid">
          {filtrados.map((item) => (
            <ArticleCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Explorar
