import { useContext } from 'react'
import { ContentContext } from '../context/ContentContext'

export function useContent() {
  const contexto = useContext(ContentContext)
  if (!contexto) {
    throw new Error('useContent debe usarse dentro de ContentProvider')
  }
  return contexto
}
