const API_URL = (import.meta.env.VITE_API_URL ?? '').trim()
const usaMock = !API_URL || API_URL.includes('tu-api-en-la-nube')
const USUARIOS_KEY = 'truex-usuarios'

function leerUsuarios() {
  try {
    const guardado = JSON.parse(localStorage.getItem(USUARIOS_KEY) ?? '[]')
    return Array.isArray(guardado) ? guardado : []
  } catch (error) {
    return []
  }
}

function guardarUsuarios(usuarios) {
  try {
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios))
  } catch (error) {
    // Sin persistencia si el navegador la bloquea
  }
}

async function hashClave(clave) {
  const datos = new TextEncoder().encode(`truex:${clave}`)
  if (globalThis.crypto?.subtle) {
    const buffer = await crypto.subtle.digest('SHA-256', datos)
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }
  return btoa(encodeURIComponent(clave))
}

function crearTokenMock(id) {
  return `mock.${btoa(encodeURIComponent(id))}.${Date.now()}`
}

function leerIdTokenMock(token) {
  const partes = String(token).split('.')
  if (partes.length !== 3 || partes[0] !== 'mock') return null
  try {
    return decodeURIComponent(atob(partes[1]))
  } catch (error) {
    return null
  }
}

function normalizarUsuario(usuario = {}) {
  const email = usuario.email ?? usuario.correo ?? ''
  const nombre = usuario.nombre ?? usuario.name ?? usuario.username ?? 'Usuario'
  const username = usuario.username ?? String(email).split('@')[0] ?? ''

  return {
    id: usuario.id ?? usuario._id ?? '',
    nombre,
    username,
    email,
    rol:
      usuario.rol ??
      usuario.role ??
      (email === 'demo@truex.app' ? 'admin' : 'usuario'),
    avatar: usuario.avatar ?? usuario.foto ?? '',
    verificado: Boolean(usuario.verificado ?? usuario.verified),
    ubicacion: usuario.ubicacion ?? usuario.location ?? '',
    stats: {
      publicaciones: usuario.stats?.publicaciones ?? 0,
      intercambios: usuario.stats?.intercambios ?? 0,
      calificacion: usuario.stats?.calificacion ?? 0,
    },
  }
}

function normalizarSesion(datos) {
  const raiz = datos?.data ?? datos ?? {}
  const token = raiz.token ?? raiz.accessToken ?? raiz.access_token ?? raiz.jwt ?? null
  const usuario = raiz.user ?? raiz.usuario ?? raiz.perfil ?? null

  if (!token || !usuario) {
    throw new Error('La respuesta del servidor no es válida.')
  }

  return { token, user: normalizarUsuario(usuario) }
}

async function leerError(respuesta, porDefecto) {
  try {
    const datos = await respuesta.json()

    if (respuesta.status === 404) {
      return 'Esta función aún no está disponible en el servidor.'
    }

    if (datos.errores && typeof datos.errores === 'object') {
      const mensajes = Object.values(datos.errores).filter(Boolean)
      if (mensajes.length > 0) return mensajes[0]
    }

    return datos.mensaje ?? datos.message ?? datos.error ?? porDefecto
  } catch (error) {
    return porDefecto
  }
}

async function asegurarDemo() {
  const usuarios = leerUsuarios()
  const indiceDemo = usuarios.findIndex(
    (usuario) => usuario.email === 'demo@truex.app',
  )

  if (indiceDemo >= 0) {
    if (usuarios[indiceDemo].rol === 'admin') return usuarios

    const actualizados = usuarios.map((usuario, indice) =>
      indice === indiceDemo ? { ...usuario, rol: 'admin' } : usuario,
    )
    guardarUsuarios(actualizados)
    return actualizados
  }

  const demo = {
    id: 'demo',
    nombre: 'David Demo',
    username: 'davidgx',
    email: 'demo@truex.app',
    claveHash: await hashClave('truex1234'),
    rol: 'admin',
    avatar: '',
    verificado: true,
    ubicacion: 'Pasto, Nariño',
    stats: { publicaciones: 3, intercambios: 5, calificacion: 4.8 },
    createdAt: new Date().toISOString(),
  }

  const lista = [demo, ...usuarios]
  guardarUsuarios(lista)
  return lista
}

async function registrarMock(datos) {
  const usuarios = leerUsuarios()
  const email = datos.correo.trim().toLowerCase()
  const username = datos.username.trim().toLowerCase()

  if (usuarios.some((usuario) => usuario.email === email)) {
    throw new Error('Ya existe una cuenta con este correo.')
  }

  if (usuarios.some((usuario) => usuario.username.toLowerCase() === username)) {
    throw new Error('Ese nombre de usuario ya está en uso.')
  }

  const nuevo = {
    id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`,
    nombre: datos.nombre.trim(),
    username: datos.username.trim(),
    email,
    claveHash: await hashClave(datos.clave),
    rol: 'usuario',
    avatar: datos.avatar ?? '',
    verificado: false,
    ubicacion: datos.ubicacion.trim(),
    stats: { publicaciones: 0, intercambios: 0, calificacion: 0 },
    createdAt: new Date().toISOString(),
  }

  guardarUsuarios([...usuarios, nuevo])

  return { token: crearTokenMock(nuevo.id), user: normalizarUsuario(nuevo) }
}

async function loginMock(datos) {
  const usuarios = await asegurarDemo()
  const email = datos.correo.trim().toLowerCase()
  const usuario = usuarios.find((item) => item.email === email)

  if (!usuario) {
    throw new Error('Correo o contraseña incorrectos.')
  }

  const hash = await hashClave(datos.clave)
  if (hash !== usuario.claveHash) {
    throw new Error('Correo o contraseña incorrectos.')
  }

  return { token: crearTokenMock(usuario.id), user: normalizarUsuario(usuario) }
}

async function perfilMock(token) {
  const id = leerIdTokenMock(token)
  const usuario = id ? leerUsuarios().find((item) => item.id === id) : null

  if (!usuario) {
    throw new Error('Tu sesión expiró. Inicia sesión de nuevo.')
  }

  return normalizarUsuario(usuario)
}

export async function registrarUsuario(datos) {
  if (usaMock) {
    return registrarMock(datos)
  }

  const respuesta = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: datos.nombre.trim(),
      username: datos.username.trim(),
      email: datos.correo.trim().toLowerCase(),
      password: datos.clave,
      ubicacion: datos.ubicacion.trim(),
      avatar: datos.avatar ?? '',
    }),
  })

  if (!respuesta.ok) {
    throw new Error(await leerError(respuesta, 'No se pudo crear la cuenta.'))
  }

  return normalizarSesion(await respuesta.json())
}

export async function loginUsuario(datos) {
  if (usaMock) {
    return loginMock(datos)
  }

  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: datos.correo.trim().toLowerCase(),
      password: datos.clave,
    }),
  })

  if (!respuesta.ok) {
    throw new Error(await leerError(respuesta, 'Correo o contraseña incorrectos.'))
  }

  return normalizarSesion(await respuesta.json())
}

export async function obtenerPerfil(token) {
  if (usaMock) {
    return perfilMock(token)
  }

  const respuesta = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!respuesta.ok) {
    throw new Error(
      await leerError(respuesta, 'Tu sesión expiró. Inicia sesión de nuevo.'),
    )
  }

  const datos = await respuesta.json()
  const raiz = datos.data ?? datos
  return normalizarUsuario(raiz.user ?? raiz.usuario ?? raiz.perfil ?? raiz)
}

export async function actualizarPerfil(datos, token) {
  if (usaMock) {
    const id = leerIdTokenMock(token)
    const usuarios = leerUsuarios()
    const indice = usuarios.findIndex((usuario) => usuario.id === id)

    if (indice < 0) {
      throw new Error('Tu sesión expiró. Inicia sesión de nuevo.')
    }

    const username = datos.username?.trim()
    if (
      username &&
      usuarios.some(
        (usuario, posicion) =>
          posicion !== indice &&
          usuario.username.toLowerCase() === username.toLowerCase(),
      )
    ) {
      throw new Error('Ese nombre de usuario ya está en uso.')
    }

    const actualizado = {
      ...usuarios[indice],
      ...(datos.nombre !== undefined ? { nombre: datos.nombre.trim() } : {}),
      ...(username ? { username } : {}),
      ...(datos.ubicacion !== undefined ? { ubicacion: datos.ubicacion.trim() } : {}),
      ...(datos.avatar !== undefined ? { avatar: datos.avatar } : {}),
    }

    usuarios[indice] = actualizado
    guardarUsuarios(usuarios)
    return normalizarUsuario(actualizado)
  }

  const respuesta = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      nombre: datos.nombre,
      username: datos.username,
      ubicacion: datos.ubicacion,
      avatar: datos.avatar,
    }),
  })

  if (!respuesta.ok) {
    throw new Error(await leerError(respuesta, 'No se pudo actualizar el perfil.'))
  }

  const datosRespuesta = await respuesta.json()
  const raiz = datosRespuesta.data ?? datosRespuesta
  return normalizarUsuario(raiz.user ?? raiz.usuario ?? raiz.perfil ?? raiz)
}

export async function cambiarClave(datos, token) {
  if (usaMock) {
    const id = leerIdTokenMock(token)
    const usuarios = leerUsuarios()
    const indice = usuarios.findIndex((usuario) => usuario.id === id)

    if (indice < 0) {
      throw new Error('Tu sesión expiró. Inicia sesión de nuevo.')
    }

    const hashActual = await hashClave(datos.actual ?? '')
    if (usuarios[indice].claveHash !== hashActual) {
      throw new Error('La contraseña actual no es correcta.')
    }

    usuarios[indice] = {
      ...usuarios[indice],
      claveHash: await hashClave(datos.nueva),
    }
    guardarUsuarios(usuarios)
    return true
  }

  const respuesta = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      actual: datos.actual,
      nueva: datos.nueva,
      currentPassword: datos.actual,
      newPassword: datos.nueva,
    }),
  })

  if (!respuesta.ok) {
    throw new Error(await leerError(respuesta, 'No se pudo cambiar la contraseña.'))
  }

  return true
}

export async function solicitarRecuperacion(correo) {
  const email = correo.trim().toLowerCase()

  if (usaMock) {
    await asegurarDemo()
    if (!leerUsuarios().some((usuario) => usuario.email === email)) {
      throw new Error('No existe una cuenta con ese correo.')
    }
    return true
  }

  const respuesta = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!respuesta.ok) {
    throw new Error(await leerError(respuesta, 'No se pudo solicitar la recuperación.'))
  }

  return true
}

export async function restablecerClave(datos) {
  const email = datos.correo.trim().toLowerCase()

  if (usaMock) {
    const usuarios = leerUsuarios()
    const indice = usuarios.findIndex((usuario) => usuario.email === email)

    if (indice < 0) {
      throw new Error('No existe una cuenta con ese correo.')
    }

    usuarios[indice] = {
      ...usuarios[indice],
      claveHash: await hashClave(datos.clave),
    }
    guardarUsuarios(usuarios)
    return true
  }

  const respuesta = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: datos.clave }),
  })

  if (!respuesta.ok) {
    throw new Error(await leerError(respuesta, 'No se pudo restablecer la contraseña.'))
  }

  return true
}
