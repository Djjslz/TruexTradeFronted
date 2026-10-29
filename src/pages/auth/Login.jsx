import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { validarCorreo } from '../../utils/validators'

function Login() {
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.desde ?? '/perfil'

  const limpiarError = (campo) => {
    setErrores((actuales) => {
      if (!actuales[campo]) return actuales
      const nuevos = { ...actuales }
      delete nuevos[campo]
      return nuevos
    })
    setErrorGeneral('')
  }

  const handleSubmit = async (evento) => {
    evento.preventDefault()

    const nuevos = {}
    if (!validarCorreo(correo)) nuevos.correo = 'Ingresa un correo válido.'
    if (!clave) nuevos.clave = 'Ingresa tu contraseña.'

    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    setEnviando(true)
    setErrorGeneral('')

    try {
      await login({ correo, clave })
      navigate(destino, { replace: true })
    } catch (error) {
      setErrorGeneral(error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <div className="auth-heading">
        <h1>Iniciar sesión</h1>
        <p>Entra para gestionar tus trueques y publicaciones.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {errorGeneral && (
          <p className="form-alert" role="alert">
            {errorGeneral}
          </p>
        )}

        <div className="field">
          <label className="field-label" htmlFor="login-correo">
            Correo
          </label>
          <input
            id="login-correo"
            type="email"
            className={`input ${errores.correo ? 'input-error' : ''}`.trim()}
            value={correo}
            onChange={(evento) => {
              setCorreo(evento.target.value)
              limpiarError('correo')
            }}
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            aria-invalid={Boolean(errores.correo)}
          />
          {errores.correo && <span className="field-error">{errores.correo}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="login-clave">
            Contraseña
          </label>
          <div className="password-field">
            <input
              id="login-clave"
              type={verClave ? 'text' : 'password'}
              className={`input ${errores.clave ? 'input-error' : ''}`.trim()}
              value={clave}
              onChange={(evento) => {
                setClave(evento.target.value)
                limpiarError('clave')
              }}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              aria-invalid={Boolean(errores.clave)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setVerClave((actual) => !actual)}
            >
              {verClave ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {errores.clave && <span className="field-error">{errores.clave}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      {!import.meta.env.VITE_API_URL && (
        <p className="auth-demo">
          Cuenta de prueba: <code>demo@truex.app</code> / <code>truex1234</code>
        </p>
      )}

      <p className="auth-footer">
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </>
  )
}

export default Login
