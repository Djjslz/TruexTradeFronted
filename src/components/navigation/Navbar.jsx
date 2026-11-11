import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from '../common/ThemeToggle'
import Avatar from '../common/Avatar'
import logo from '../../assets/logos/logo-horizontal.png'

function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const [oculto, setOculto] = useState(false)
  const ultimoScroll = useRef(0)

  useEffect(() => {
    const movil = window.matchMedia('(max-width: 860px)')

    const manejarScroll = () => {
      if (!movil.matches) {
        setOculto(false)
        return
      }

      const actual = window.scrollY
      const anterior = ultimoScroll.current

      if (actual <= 80) {
        setOculto(false)
      } else if (actual > anterior + 4) {
        setOculto(true)
      } else if (actual < anterior - 4) {
        setOculto(false)
      }

      ultimoScroll.current = actual
    }

    const manejarResize = () => {
      if (!movil.matches) setOculto(false)
    }

    window.addEventListener('scroll', manejarScroll, { passive: true })
    window.addEventListener('resize', manejarResize)

    return () => {
      window.removeEventListener('scroll', manejarScroll)
      window.removeEventListener('resize', manejarResize)
    }
  }, [])

  return (
    <header className={`navbar ${oculto ? 'is-hidden' : ''}`.trim()}>
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="TrueX Trade, ir al inicio">
          <img src={logo} alt="TrueX Trade" />
        </Link>

        <nav className="nav-links" aria-label="Navegación principal">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/explorar">Explorar</NavLink>
          {isAdmin && <NavLink to="/admin">Panel</NavLink>}
          <a href="/#categorias">Categorías</a>
          <a href="/#como-funciona">Cómo funciona</a>
        </nav>

        <div className="buscador">
          <input
            type="text"
            className="input"
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
          />
          <button type="button" className="btn btn-ghost btn-sm" aria-label="Buscar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>

        <div className="nav-actions">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/perfil" className="nav-user">
                <Avatar nombre={user.nombre} src={user.avatar} size={30} />
                <span>{user.nombre}</span>
              </Link>
              <button
                type="button"
                className="nav-logout"
                onClick={logout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn btn-primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
