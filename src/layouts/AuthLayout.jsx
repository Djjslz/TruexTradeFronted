import { Link, Outlet } from 'react-router-dom'
import ThemeToggle from '../components/common/ThemeToggle'
import logo from '../assets/logos/logo-vertical.png'

function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-glow auth-glow-top" aria-hidden="true" />
      <div className="auth-glow auth-glow-bottom" aria-hidden="true" />

      <div className="auth-theme">
        <ThemeToggle />
      </div>

      <div className="auth-shell-inner">
        <Link to="/" className="auth-brand" aria-label="TrueX Trade, ir al inicio">
          <img src={logo} alt="TrueX Trade" />
        </Link>

        <main className="auth-card">
          <Outlet />
        </main>

        <Link to="/" className="auth-back">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default AuthLayout
