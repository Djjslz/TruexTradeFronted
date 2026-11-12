const API_URL_DEFECTO = 'https://truex-trade-backend.onrender.com/api'
const API_URL = ((import.meta.env.VITE_API_URL ?? '').trim() || API_URL_DEFECTO).replace(/\/+$/, '')
const usaMock = API_URL.includes('tu-api-en-la-nube')
const ITEMS_KEY = 'truex-items'
const COMMENTS_KEY = 'truex-comentarios'

function leerItemsLocales() {
  try {
    const guardado = JSON.parse(localStorage.getItem(ITEMS_KEY) ?? '[]')
    return Array.isArray(guardado) ? guardado : []
  } catch (error) {
    return []
  }
}

function guardarItemsLocales(lista) {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(lista))
  } catch (error) {
    throw new Error('No hay espacio para guardar las imágenes. Intenta con archivos más pequeños.')
  }
}

function leerComentariosLocales() {
  try {
    const guardado = JSON.parse(localStorage.getItem(COMMENTS_KEY) ?? '[]')
    return Array.isArray(guardado) ? guardado : []
  } catch (error) {
    return []
  }
}

function guardarComentariosLocales(lista) {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(lista))
  } catch (error) {
    throw new Error('No se pudo guardar el comentario.')
  }
}

function crearId() {
  return globalThis.crypto?.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function leerError(respuesta, porDefecto) {
  try {
    const datos = await respuesta.json()
    return datos.mensaje ?? datos.message ?? datos.error ?? porDefecto
  } catch (error) {
    return porDefecto
  }
}

export async function getItems() {
  if (usaMock) {
    return leerItemsLocales()
  }

  const respuesta = await fetch(`${API_URL}/items`)
  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los artículos')
  }

  const datos = await respuesta.json()
  if (Array.isArray(datos)) return datos
  return datos.data ?? datos.items ?? []
}

export async function getItemById(id) {
  if (usaMock) {
    const locales = leerItemsLocales()
    return locales.find((item) => item.id === id) ?? null
  }

  const respuesta = await fetch(`${API_URL}/items/${id}`)
  if (!respuesta.ok) {
    throw new Error('No se pudo cargar el artículo')
  }

  const datos = await respuesta.json()
  return datos.data ?? datos.item ?? datos
}

export async function crearItem(datos, token) {
  if (usaMock) {
    const nuevo = {
      id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : `item-${Date.now()}`,
      ...datos,
      favoritos: 0,
      createdAt: new Date().toISOString(),
    }

    guardarItemsLocales([nuevo, ...leerItemsLocales()])
    return nuevo
  }

  const respuesta = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(datos),
  })

  if (!respuesta.ok) {
    throw new Error(await leerError(respuesta, 'No se pudo publicar el artículo.'))
  }

  const datosRespuesta = await respuesta.json()
  return datosRespuesta.data ?? datosRespuesta.item ?? datosRespuesta
}

export async function eliminarItem(id, token) {
  if (usaMock) {
    const items = leerItemsLocales()
    if (!items.some((item) => item.id === id)) {
      throw new Error('No se encontró la publicación o no tienes permiso para eliminarla.')
    }

    guardarItemsLocales(items.filter((item) => item.id !== id))

    const comentarios = leerComentariosLocales().filter(
      (comentario) => String(comentario.itemId) !== String(id),
    )
    guardarComentariosLocales(comentarios)

    return true
  }

  const respuesta = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!respuesta.ok) {
    throw new Error(await leerError(respuesta, 'No se pudo eliminar la publicación.'))
  }

  return true
}

export async function getComentarios(itemId) {
  if (usaMock) {
    return leerComentariosLocales()
      .filter((comentario) => String(comentario.itemId) === String(itemId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  const respuesta = await fetch(`${API_URL}/items/${itemId}/comments`)
  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los comentarios.')
  }

  const datos = await respuesta.json()
  if (Array.isArray(datos)) return datos
  return datos.data ?? datos.comentarios ?? []
}

export async function crearComentario(itemId, datos, token) {
  if (usaMock) {
    const texto = String(datos?.texto ?? '').trim()
    if (!texto) throw new Error('Escribe un comentario.')

    const nuevo = {
      id: crearId(),
      itemId,
      texto,
      autor: datos?.autor ?? { nombre: 'Anónimo' },
      createdAt: new Date().toISOString(),
    }

    guardarComentariosLocales([...leerComentariosLocales(), nuevo])
    return nuevo
  }

  const respuesta = await fetch(`${API_URL}/items/${itemId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ texto: datos?.texto }),
  })

  if (!respuesta.ok) {
    throw new Error(await leerError(respuesta, 'No se pudo publicar el comentario.'))
  }

  const datosRespuesta = await respuesta.json()
  return datosRespuesta.data ?? datosRespuesta.comment ?? datosRespuesta
}
