import { useEffect, useState } from 'react'
import { getItems } from '../services/api'

export function useItems() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    getItems()
      .then((datos) => {
        if (activo) setItems(datos)
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
  }, [])

  return { items, cargando, error }
}
