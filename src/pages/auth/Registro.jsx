import { lazy, Suspense, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logoVertical from '../../assets/logos/logo-vertical.png'
import { procesarAvatar } from '../../utils/images'
import {
  validarClave,
  validarCorreo,
  validarNombre,
  validarUbicacion,
  validarUsername,
} from '../../utils/validators'

const Lanyard = lazy(() => import('../../components/common/Lanyard'))

function Registro() {
  const [nombre, setNombre] = useState('')
  const [username, setUsername] = useState('')
  const [correo, setCorreo] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [clave, setClave] = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [avatar, setAvatar] = useState('')
  const [procesandoAvatar, setProcesandoAvatar] = useState(false)
  const [errorAvatar, setErrorAvatar] = useState('')
  const [acepta, setAcepta] = useState(false)
  const [verClave, setVerClave] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const limpiarError = (campo) => {
    setErrores((actuales) => {
      if (!actuales[campo]) return actuales
      const nuevos = { ...actuales }
      delete nuevos[campo]
      return nuevos
    })
    setErrorGeneral('')
  }

  const handleAvatar = async (evento) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return

    setErrorAvatar('')
    setProcesandoAvatar(true)

    try {
      setAvatar(await procesarAvatar(archivo))
    } catch (error) {
      setErrorAvatar(error.message)
    } finally {
      setProcesandoAvatar(false)
    }
  }

  const handleSubmit = async (evento) => {
    evento.preventDefault()
    const nuevos = {}
    if (!validarNombre(nombre)) {
      nuevos.nombre = 'Escribe tu nombre (2 a 60 caracteres).'
    }
    if (!validarUsername(username)) {
      nuevos.username = 'Usa de 3 a 20 caracteres: letras, números, punto o guion bajo.'
    }
    if (!validarCorreo(correo)) nuevos.correo = 'Ingresa un correo válido.'
    if (!validarUbicacion(ubicacion)) nuevos.ubicacion = 'Indica tu ciudad o región.'
    if (!validarClave(clave)) {
      nuevos.clave = 'Mínimo 8 caracteres con al menos una letra y un número.'
    }
    if (confirmarClave !== clave) {
      nuevos.confirmarClave = 'Las contraseñas no coinciden.'
    }
    if (!acepta) {
      nuevos.terminos = 'Debes aceptar los términos para continuar.'
    }

    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    setEnviando(true)
    setErrorGeneral('')

    try {
      await register({ nombre, username, correo, ubicacion, clave, avatar })
      navigate('/perfil', { replace: true })
    } catch (error) {
      setErrorGeneral(error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <div className="auth-heading">
        <h1>Crea tu cuenta</h1>
        <p>Publica lo que ya no usas y encuentra tu próximo trueque.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {errorGeneral && (
          <p className="form-alert" role="alert">
            {errorGeneral}
          </p>
        )}

        <div className="field">
          <span className="field-label">Foto de perfil (opcional)</span>
          <div className="lanyard-stage" aria-hidden="true">
            <Suspense
              fallback={
                <div className="lanyard-fallback">
                  <img src={logoVertical} alt="" />
                </div>
              }
            >
              <Lanyard
                frontImage={avatar || logoVertical}
                backImage={avatar || logoVertical}
                imageFit={avatar ? 'cover' : 'contain'}
                cardColor="#101216"
                orientation="portrait"
                finish="glossy"
                cornerRadius={0.35}
                size={0.72}
                anchor="center"
                strapLength={0.38}
                strapColor="#e8860c"
                strapWidth={0.6}
                metal="gold"
                gravity={1}
                damping={0.5}
                elasticity={0.5}
                breeze={0.4}
                interactive
                intro
              />
            </Suspense>
          </div>
          <div className="lanyard-actions">
            <div className="avatar-upload-actions">
              <label className="btn btn-outline btn-sm">
                {procesandoAvatar ? 'Procesando…' : avatar ? 'Cambiar foto' : 'Subir foto'}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatar}
                  disabled={procesandoAvatar}
                />
              </label>
              {avatar && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setAvatar('')}
                >
                  Quitar
                </button>
              )}
            </div>
            <p className="lanyard-hint">
              Arrastra la credencial para moverla.{' '}
              {avatar
                ? 'Puedes cambiar o quitar la foto cuando quieras.'
                : 'Si no subes foto, usaremos el logo de TrueX.'}
            </p>
          </div>
          {errorAvatar && <span className="field-error">{errorAvatar}</span>}
        </div>

        <div className="auth-grid">
          <div className="field">
            <label className="field-label" htmlFor="registro-nombre">
              Nombre
            </label>
            <input
              id="registro-nombre"
              type="text"
              className={`input ${errores.nombre ? 'input-error' : ''}`.trim()}
              value={nombre}
              onChange={(evento) => {
                setNombre(evento.target.value)
                limpiarError('nombre')
              }}
              placeholder="Tu nombre"
              autoComplete="name"
              aria-invalid={Boolean(errores.nombre)}
            />
            {errores.nombre && <span className="field-error">{errores.nombre}</span>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="registro-username">
              Usuario
            </label>
            <input
              id="registro-username"
              type="text"
              className={`input ${errores.username ? 'input-error' : ''}`.trim()}
              value={username}
              onChange={(evento) => {
                setUsername(evento.target.value)
                limpiarError('username')
              }}
              placeholder="tunombre"
              autoComplete="username"
              aria-invalid={Boolean(errores.username)}
            />
            {errores.username && (
              <span className="field-error">{errores.username}</span>
            )}
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="registro-correo">
            Correo
          </label>
          <input
            id="registro-correo"
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
          <label className="field-label" htmlFor="registro-ubicacion">
            Ubicación
          </label>
          <input
            id="registro-ubicacion"
            type="text"
            className={`input ${errores.ubicacion ? 'input-error' : ''}`.trim()}
            value={ubicacion}
            onChange={(evento) => {
              setUbicacion(evento.target.value)
              limpiarError('ubicacion')
            }}
            placeholder="Ciudad, departamento"
            autoComplete="address-level2"
            aria-invalid={Boolean(errores.ubicacion)}
          />
          {errores.ubicacion && (
            <span className="field-error">{errores.ubicacion}</span>
          )}
        </div>

        <div className="auth-grid">
          <div className="field">
            <label className="field-label" htmlFor="registro-clave">
              Contraseña
            </label>
            <div className="password-field">
              <input
                id="registro-clave"
                type={verClave ? 'text' : 'password'}
                className={`input ${errores.clave ? 'input-error' : ''}`.trim()}
                value={clave}
                onChange={(evento) => {
                  setClave(evento.target.value)
                  limpiarError('clave')
                }}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
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

          <div className="field">
            <label className="field-label" htmlFor="registro-confirmar">
              Confirmar contraseña
            </label>
            <input
              id="registro-confirmar"
              type={verClave ? 'text' : 'password'}
              className={`input ${errores.confirmarClave ? 'input-error' : ''}`.trim()}
              value={confirmarClave}
              onChange={(evento) => {
                setConfirmarClave(evento.target.value)
                limpiarError('confirmarClave')
              }}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              aria-invalid={Boolean(errores.confirmarClave)}
            />
            {errores.confirmarClave && (
              <span className="field-error">{errores.confirmarClave}</span>
            )}
          </div>
        </div>

        <div className="field">
          <label className="checkbox-field" htmlFor="registro-terminos">
            <input
              id="registro-terminos"
              type="checkbox"
              checked={acepta}
              onChange={(evento) => {
                setAcepta(evento.target.checked)
                limpiarError('terminos')
              }}
              aria-invalid={Boolean(errores.terminos)}
            />
            <span>Acepto los términos y la política de privacidad de TrueX Trade.</span>
          </label>
          {errores.terminos && <span className="field-error">{errores.terminos}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="auth-footer">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </>
  )
}

export default Registro
