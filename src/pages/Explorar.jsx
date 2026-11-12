import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArticleCard from '../components/cards/ArticleCard'
import SplashCursor from '../components/common/SplashCursor'
import { useItems } from '../hooks/useItems'
import { useTheme } from '../hooks/useTheme'

const normalizarTexto = (valor) =>
  String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

function Explorar() {
  const { items, cargando, error } = useItems()
  const { esOscuro } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const busqueda = searchParams.get('buscar') ?? ''

  const manejarBusqueda = (evento) => {
    const valor = evento.target.value
    const params = new URLSearchParams(searchParams)

    if (valor.trim()) params.set('buscar', valor)
    else params.delete('buscar')

    setSearchParams(params, { replace: true })
  }

  const filtrados = useMemo(() => {
    const terminos = normalizarTexto(busqueda.trim()).split(/\s+/).filter(Boolean)
    if (!terminos.length) return items

    return items.filter((item) => {
      const contenido = normalizarTexto(
        [
          item.titulo,
          item.categoria,
          item.descripcion,
          item.ubicacion,
          item.estado,
          item.usuario?.nombre ?? item.usuario,
        ]
          .filter(Boolean)
          .join(' '),
      )

      return terminos.every((termino) => contenido.includes(termino))
    })
  }, [items, busqueda])

  return (
    <div className="container page">
      <div className="explorar-page">
        <SplashCursor
          contained
          theme={esOscuro ? 'dark' : 'light'}
          quality="medium"
          zIndex={0}
        />

        <div className="explorar-content">
          <div className="section-header">
            <h1>Explorar trueques</h1>
          </div>

          <input
            type="search"
            className="input search"
            placeholder="Buscar por título, categoría o ubicación"
            value={busqueda}
            onChange={manejarBusqueda}
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
      </div>
    </div>
  )
}

export default Explorar
