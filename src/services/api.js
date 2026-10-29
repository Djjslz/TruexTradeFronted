import { items as itemsBase } from '../data/items'

const API_URL = import.meta.env.VITE_API_URL
const usaMock = !API_URL
const ITEMS_KEY = 'truex-items'

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
    return [...leerItemsLocales(), ...itemsBase]
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
    return locales.find((item) => item.id === id) ?? itemsBase.find((item) => item.id === id) ?? null
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
