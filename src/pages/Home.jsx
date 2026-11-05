import { Link } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import CircularCarousel from '../components/common/CircularCarousel'
import { useContent } from '../hooks/useContent'
import { useTheme } from '../hooks/useTheme'
import pasoRegistro from '../assets/images/paso-1-registro.svg'
import pasoPublica from '../assets/images/paso-2-publica.svg'
import pasoIntercambia from '../assets/images/paso-3-intercambia.svg'
import pasoNuevaVida from '../assets/images/paso-4-nueva-vida.svg'

const ICONOS = {
  laptop: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="18" x2="22" y2="18" />
      <line x1="12" y1="2" x2="12" y2="18" />
    </svg>
  ),
  camisa: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4 h -8 l -3 5 h 14 l -3 -5 z" />
      <path d="M8 9 l -4 -5 m 12 0 l 4 -5" />
      <path d="M12 9 l 0 11" />
    </svg>
  ),
  sofa: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="14" height="10" rx="2" />
      <path d="M17 7 v -3 h -4 v 3" />
      <circle cx="5" cy="17" r="1" fill="currentColor" />
      <circle cx="17" cy="17" r="1" fill="currentColor" />
    </svg>
  ),
  balon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4.5 v 15 m -7.5 0 h 15" />
    </svg>
  ),
  moto: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="17.5" r="2" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="17.5" cy="17.5" r="2" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M6.5 17.5 L 14 14 L 17.5 17.5" />
      <path d="M6.5 17.5 L 4 15 L 6.5 12.5" />
    </svg>
  ),
  libros: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5 v -15 L 2 1.5" />
      <path d="M12 3 v 16.5" />
      <path d="M20 19.5 v -15 L 18 1.5" />
      <line x1="8" y1="8" x2="8" y2="16" />
      <line x1="16" y1="8" x2="16" y2="16" />
    </svg>
  ),
  guitarra: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="14" r="5" fill="none" />
      <line x1="6" y1="14" x2="18" y2="14" />
      <path d="M18 14 Q 20 12 18 10" fill="none" />
      <path d="M18 14 Q 20 16 18 18" fill="none" />
      <rect x="16" y="11" width="2" height="6" rx="1" />
    </svg>
  ),
  osito: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 5 C 8 5 7 7 7 9 L 7 12 L 5 12 L 5 14 L 7 14 L 7 18 L 9 18 L 9 14 L 11 14 L 11 18 L 13 18 L 13 14 L 15 14 L 15 12 L 13 12 L 13 9 C 13 7 12 5 10 5 Z" />
      <circle cx="8.5" cy="7" r="1" />
      <circle cx="11.5" cy="7" r="1" />
    </svg>
  ),
  gamepad: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="7" width="12" height="10" rx="4" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="11" cy="10" r="1" />
      <circle cx="13" cy="14" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M17 12 L 18 12 L 18 10 L 17 10 Z" />
    </svg>
  ),
  puntos: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  camara: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="8" rx="2" ry="2" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  auriculares: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12 C 5 10 7 8 10 8 L 14 8 C 17 8 19 10 19 12" />
      <path d="M5 12 L 3 12 L 3 16 C 3 18 5 20 8 20 L 16 20 C 19 20 21 18 21 16 L 21 12 L 19 12" />
      <path d="M10 8 L 10 12" />
      <path d="M14 8 L 14 12" />
    </svg>
  ),
  reloj: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  zapatilla: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16 L 8 12 L 12 16 L 16 12 L 20 16 L 20 19 L 4 19 Z" />
      <path d="M6 19 L 8 16 L 10 19" />
      <path d="M12 19 L 14 16 L 16 19" />
    </svg>
  ),
}

const CATEGORIAS = [
  { clave: 'tecnologia', label: 'Tecnología', icono: ICONOS.laptop },
  { clave: 'ropa', label: 'Ropa', icono: ICONOS.camisa },
  { clave: 'hogar', label: 'Hogar', icono: ICONOS.sofa },
  { clave: 'deportes', label: 'Deportes', icono: ICONOS.balon },
  { clave: 'vehiculos', label: 'Vehículos', icono: ICONOS.moto },
  { clave: 'libros', label: 'Libros', icono: ICONOS.libros },
  { clave: 'instrumentos', label: 'Instrumentos', icono: ICONOS.guitarra },
  { clave: 'juguetes', label: 'Juguetes', icono: ICONOS.osito },
  { clave: 'coleccionables', label: 'Coleccionables', icono: ICONOS.gamepad },
  { clave: 'otros', label: 'Otros', icono: ICONOS.puntos },
]

const PUBLICACIONES = [
  {
    id: 1,
    titulo: 'Laptop Lenovo',
    estado: 'Bueno estado',
    tipo: 'trueque',
    categoria: 'Tecnología',
    icono: ICONOS.laptop,
  },
  {
    id: 2,
    titulo: 'Nike Air Force 1',
    estado: 'Excelente estado',
    tipo: 'trueque',
    categoria: 'Ropa',
    icono: ICONOS.zapatilla,
  },
  {
    id: 3,
    titulo: 'Cámara Canon',
    estado: 'Bueno estado',
    tipo: 'trueque',
    categoria: 'Cámaras',
    icono: ICONOS.camara,
  },
  {
    id: 4,
    titulo: 'Audífonos Sony',
    estado: 'Excelente estado',
    tipo: 'trueque',
    categoria: 'Audio',
    icono: ICONOS.auriculares,
  },
  {
    id: 5,
    titulo: 'Guitarra Eléctrica',
    estado: 'Bueno estado',
    tipo: 'venta',
    categoria: 'Instrumentos',
    icono: ICONOS.guitarra,
  },
  {
    id: 6,
    titulo: 'Apple Watch',
    estado: 'Excelente estado',
    tipo: 'trueque',
    categoria: 'Tecnología',
    icono: ICONOS.reloj,
  },
]

const PASOS_CARRUSEL = [
  {
    src: pasoRegistro,
    alt: 'Persona creando una cuenta',
    title: '01 · Regístrate',
    subtitle: 'Crea tu cuenta en pocos minutos.',
  },
  {
    src: pasoPublica,
    alt: 'Caja con una publicación nueva',
    title: '02 · Publica',
    subtitle: 'Sube los objetos que ya no usas.',
  },
  {
    src: pasoIntercambia,
    alt: 'Flechas de intercambio',
    title: '03 · Intercambia',
    subtitle: 'Conéctate con personas interesadas.',
  },
  {
    src: pasoNuevaVida,
    alt: 'Brote de una nueva vida',
    title: '04 · Dale una nueva vida',
    subtitle: 'Tus objetos siguen siendo útiles.',
  },
]

function Chip({ item }) {
  return (
    <Link to={`/explorar?categoria=${item.clave}`} className="chip">
      <div className="icono">{item.icono}</div>
      <span>{item.label}</span>
    </Link>
  )
}

function Tarjeta({ p }) {
  const esVenta = p.tipo === 'venta'
  const imagen = Array.isArray(p.imagenes) ? p.imagenes[0] : p.imagen

  return (
    <Link to={`/producto/${p.id}`} className="tarjeta" aria-label={p.titulo}>
      <span className="favorito" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14 c 1.49 -1.46 3 -3.21 3 -5.5 A 5.5 5.5 0 0 0 16.5 3 c -1.76 0 -3.5 2 -4 5 -0.5 -3 -2.24 -5 -4 -5 -2 0 -3.5 2 -4 5 0 2.29 1.51 4.04 3 5.5 l 0 0 L 12 15 Z" />
        </svg>
      </span>
      <div className="media">
        {imagen ? (
          <img src={imagen} alt={p.titulo} loading="lazy" />
        ) : (
          p.icono ?? <span className="icono">{p.categoria}</span>
        )}
      </div>
      <div className="body">
        <h3>{p.titulo}</h3>
        {p.estado && <span className="estado">{p.estado}</span>}
        <span className={`tipo ${esVenta ? 'tipo-venta' : 'tipo-trueque'}`}>
          {esVenta ? 'Venta' : 'Trueque'}
        </span>
      </div>
      {p.ubicacion && (
        <div className="meta">
          <span>📍 {p.ubicacion}</span>
        </div>
      )}
    </Link>
  )
}

function Home() {
  const { contenido } = useContent()
  const { items } = useItems()
  const { esOscuro } = useTheme()
  const visual = contenido.inicio.hero.visual

  const publicaciones = items.length > 0
    ? items.slice(0, 6).map((item) => ({
        id: item.id,
        titulo: item.titulo,
        estado: item.estado,
        tipo: item.tipo,
        categoria: item.categoria,
        imagenes: item.imagenes,
        imagen: item.imagen,
        ubicacion: item.ubicacion,
      }))
    : PUBLICACIONES

  return (
    <div className="container page">
      <section className="hero-home">
        <div className="hero-grid">
          <div className="hero-content">
            <h1>
              Intercambia lo que ya no usas,
              <br />
              encuentra lo que <strong>sí necesitas.</strong>
            </h1>
            <p>
              TrueX es la plataforma donde las personas conectan, intercambian
              y dan una nueva vida a sus objetos.
            </p>
            <div className="hero-actions">
              <Link to="/registro" className="btn btn-primary btn-lg">
                Comienza ahora <span>→</span>
              </Link>
              <a href="#como-funciona" className="btn btn-outline btn-lg">
                Cómo funciona
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="mano" aria-hidden="true">
              {visual.imagenPrincipal ? (
                <img src={visual.imagenPrincipal} alt="" />
              ) : (
                '🎮'
              )}
            </div>
            <div className="camara" aria-hidden="true">
              {visual.imagenSecundaria ? (
                <img src={visual.imagenSecundaria} alt="" />
              ) : (
                '📷'
              )}
            </div>
            <div className="flechas" aria-hidden="true">
              <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                <path d="M 30 60 Q 60 30 90 60" />
                <path d="M 90 60 Q 60 90 30 60" />
                <path d="M 75 45 L 90 60 L 75 75" />
                <path d="M 45 75 L 30 60 L 45 45" />
              </svg>
            </div>
            <div className="manoescrito">{visual.textoManuscrito}</div>
          </div>
        </div>
      </section>

      <section className="seccion" id="categorias" aria-label="Categorías">
        <div className="seccion-header">
          <h2>Explora por categorías</h2>
          <Link to="/explorar" className="ver-todas">
            Ver todas →
          </Link>
        </div>
        <div className="chips">
          {CATEGORIAS.map((item) => <Chip key={item.clave} item={item} />)}
        </div>
      </section>

      <section className="seccion" aria-label="Publicaciones recientes">
        <div className="seccion-header">
          <h2>Publicaciones recientes</h2>
          <Link to="/explorar" className="ver-todas">
            Ver todas →
          </Link>
        </div>
        <div className="publicaciones">
          {publicaciones.map((p) => <Tarjeta key={p.id} p={p} />)}
        </div>
      </section>

      <section className="como-funciona" id="como-funciona" aria-label="Cómo funciona">
        <div className="seccion-header como-funciona-header">
          <div>
            <h2>Cómo funciona</h2>
            <p className="muted">Cuatro pasos para darle una nueva vida a lo que ya no usas.</p>
          </div>
        </div>

        <div className="como-funciona-carousel">
          <CircularCarousel
            items={PASOS_CARRUSEL}
            preset="cylinder"
            intro="rise"
            cardWidth={190}
            gap={36}
            autoplay="step"
            interval={3.5}
            direction="left"
            captions
            fadeColor={esOscuro ? '#1e1e1e' : '#ffffff'}
            depthFade={0.5}
            innerShade={0.75}
            cornerRadius={18}
          />
        </div>
      </section>

      <section className="cta-comunidad" id="comunidad">
        <div className="fondo" aria-hidden="true"></div>
        <h2>Únete a una comunidad que da valor a lo que tiene</h2>
        <p>TrueX, más que objetos, oportunidades.</p>
        <Link to="/registro" className="btn-cuenta">
          Crear cuenta gratuita <span>→</span>
        </Link>
      </section>
    </div>
  )
}

export default Home
