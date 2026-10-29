import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from '../common/ThemeToggle'
import Avatar from '../common/Avatar'
import logo from '../../assets/logos/logo-horizontal.png'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="TrueX Trade, ir al inicio">
          <img src={logo} alt="TrueX Trade" />
        </Link>

        <nav className="nav-links" aria-label="Navegación principal">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/explorar">Explorar</NavLink>
          <NavLink to="/publicar">Publicar</NavLink>
          <NavLink to="/perfil">Perfil</NavLink>
        </nav>

        <div className="nav-actions">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/perfil" className="nav-user">
                <Avatar nombre={user.nombre} src={user.avatar} size={30} />
                <span>{user.nombre}</span>
              </Link>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Salir
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
