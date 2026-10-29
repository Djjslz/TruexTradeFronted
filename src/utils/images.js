const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const TAMANO_MAXIMO = 5 * 1024 * 1024
const LADO_MAXIMO = 1280

function leerArchivo(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader()
    lector.onload = () => resolver(lector.result)
    lector.onerror = () => rechazar(new Error('No se pudo leer la imagen.'))
    lector.readAsDataURL(archivo)
  })
}

function cargarImagen(fuente) {
  return new Promise((resolver, rechazar) => {
    const imagen = new Image()
    imagen.onload = () => resolver(imagen)
    imagen.onerror = () => rechazar(new Error('No se pudo procesar la imagen.'))
    imagen.src = fuente
  })
}

export async function procesarImagen(archivo) {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    throw new Error('Formato no permitido. Usa JPG, PNG, WEBP o GIF.')
  }

  if (archivo.size > TAMANO_MAXIMO) {
    throw new Error('La imagen supera los 5 MB. Elige una más liviana.')
  }

  const dataUrl = await leerArchivo(archivo)

  if (archivo.type === 'image/gif') {
    return dataUrl
  }

  const imagen = await cargarImagen(dataUrl)
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height))

  if (escala === 1 && archivo.size <= 700 * 1024) {
    return dataUrl
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(imagen.width * escala))
  canvas.height = Math.max(1, Math.round(imagen.height * escala))

  const contexto = canvas.getContext('2d')
  contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/webp', 0.85)
}
