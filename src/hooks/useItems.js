import { useCallback, useEffect, useState } from 'react'
import { getItems } from '../services/api'

export function useItems() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recarga, setRecarga] = useState(0)

  const refrescar = useCallback(() => {
    setRecarga((valor) => valor + 1)
  }, [])

  useEffect(() => {
    let activo = true

    getItems()
      .then((datos) => {
        if (!activo) return
        setItems(datos)
        setError('')
      })
      .catch((err) => {
        if (activo) setError(err.message)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [recarga])

  useEffect(() => {
    const intervalo = setInterval(refrescar, 30000)

    const alEnfocar = () => refrescar()
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') refrescar()
    }

    window.addEventListener('focus', alEnfocar)
    document.addEventListener('visibilitychange', alCambiarVisibilidad)

    return () => {
      clearInterval(intervalo)
      window.removeEventListener('focus', alEnfocar)
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
    }
  }, [refrescar])

  return { items, cargando, error, refrescar }
}
