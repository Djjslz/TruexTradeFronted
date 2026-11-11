import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  restablecerClave,
  solicitarRecuperacion,
} from '../../services/auth.service'
import { validarClave, validarCorreo } from '../../utils/validators'

function Recuperar() {
  const [paso, setPaso] = useState('solicitar')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSolicitar = async (evento) => {
    evento.preventDefault()
    setError('')

    if (!validarCorreo(correo)) {
      setError('Ingresa un correo válido.')
      return
    }

    setEnviando(true)
    try {
      await solicitarRecuperacion(correo)
      setPaso('restablecer')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const handleRestablecer = async (evento) => {
    evento.preventDefault()
    setError('')

    if (!validarClave(clave)) {
      setError('Mínimo 8 caracteres con al menos una letra y un número.')
      return
    }
    if (clave !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setEnviando(true)
    try {
      await restablecerClave({ correo, clave })
      setPaso('listo')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (paso === 'listo') {
    return (
      <>
        <div className="auth-heading">
          <h1>Contraseña actualizada</h1>
          <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
        </div>
        <Link to="/login" className="btn btn-primary btn-lg">
          Ir a iniciar sesión
        </Link>
      </>
    )
  }

  return (
    <>
      <div className="auth-heading">
        <h1>Recuperar contraseña</h1>
        <p>
          {paso === 'solicitar'
            ? 'Ingresa el correo de tu cuenta.'
            : 'Define tu nueva contraseña.'}
        </p>
      </div>

      {paso === 'solicitar' ? (
        <form className="auth-form" onSubmit={handleSolicitar} noValidate>
          {error && (
            <p className="form-alert" role="alert">
              {error}
            </p>
          )}

          <div className="field">
            <label className="field-label" htmlFor="recuperar-correo">
              Correo
            </label>
            <input
              id="recuperar-correo"
              type="email"
              className="input"
              value={correo}
              onChange={(evento) => {
                setCorreo(evento.target.value)
                setError('')
              }}
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={enviando}>
            {enviando ? 'Verificando…' : 'Continuar'}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleRestablecer} noValidate>
          {error && (
            <p className="form-alert" role="alert">
              {error}
            </p>
          )}

          <p className="auth-demo">
            Cuenta: <code>{correo}</code>
          </p>

          <div className="field">
            <label className="field-label" htmlFor="recuperar-clave">
              Nueva contraseña
            </label>
            <div className="password-field">
              <input
                id="recuperar-clave"
                type={verClave ? 'text' : 'password'}
                className="input"
                value={clave}
                onChange={(evento) => {
                  setClave(evento.target.value)
                  setError('')
                }}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setVerClave((actual) => !actual)}
              >
                {verClave ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="recuperar-confirmar">
              Confirmar contraseña
            </label>
            <input
              id="recuperar-confirmar"
              type={verClave ? 'text' : 'password'}
              className="input"
              value={confirmar}
              onChange={(evento) => {
                setConfirmar(evento.target.value)
                setError('')
              }}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Restablecer contraseña'}
          </button>
        </form>
      )}

      <p className="auth-footer">
        <Link to="/login">Volver a iniciar sesión</Link>
      </p>
    </>
  )
}

export default Recuperar
