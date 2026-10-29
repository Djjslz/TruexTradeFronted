const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,20}$/

export function validarCorreo(correo) {
  return CORREO_REGEX.test(String(correo).trim())
}

export function validarNombre(nombre) {
  const limpio = String(nombre).trim()
  return limpio.length >= 2 && limpio.length <= 60
}

export function validarUsername(username) {
  return USERNAME_REGEX.test(String(username).trim())
}

export function validarClave(clave) {
  const valor = String(clave)
  return valor.length >= 8 && /[a-zA-Z]/.test(valor) && /\d/.test(valor)
}

export function validarUbicacion(ubicacion) {
  return String(ubicacion).trim().length >= 2
}
