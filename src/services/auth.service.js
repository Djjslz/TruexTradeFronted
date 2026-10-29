const API_URL = import.meta.env.VITE_API_URL
const usaMock = !API_URL
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
    return datos.mensaje ?? datos.message ?? datos.error ?? porDefecto
  } catch (error) {
    return porDefecto
  }
}

async function asegurarDemo() {
  const usuarios = leerUsuarios()
  if (usuarios.some((usuario) => usuario.email === 'demo@truex.app')) {
    return usuarios
  }

  const demo = {
    id: 'demo',
    nombre: 'David Demo',
    username: 'davidgx',
    email: 'demo@truex.app',
    claveHash: await hashClave('truex1234'),
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
    avatar: '',
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
