import { createContext, useCallback, useMemo, useState } from 'react'
import { CONTENIDO_INICIAL } from '../data/contenido'

export const ContentContext = createContext(null)

const CONTENIDO_KEY = 'truex-contenido'

function clonar(valor) {
  return JSON.parse(JSON.stringify(valor))
}

function normalizarVisual(visual = {}) {
  const base = CONTENIDO_INICIAL.inicio.hero.visual

  return {
    imagenPrincipal:
      typeof visual.imagenPrincipal === 'string'
        ? visual.imagenPrincipal
        : base.imagenPrincipal,
    imagenSecundaria:
      typeof visual.imagenSecundaria === 'string'
        ? visual.imagenSecundaria
        : base.imagenSecundaria,
    textoManuscrito:
      typeof visual.textoManuscrito === 'string'
        ? visual.textoManuscrito
        : base.textoManuscrito,
  }
}

function normalizarContenido(guardado) {
  if (!guardado || typeof guardado !== 'object') {
    return clonar(CONTENIDO_INICIAL)
  }

  return {
    ...clonar(CONTENIDO_INICIAL),
    inicio: {
      ...CONTENIDO_INICIAL.inicio,
      hero: {
        ...CONTENIDO_INICIAL.inicio.hero,
        visual: normalizarVisual(guardado?.inicio?.hero?.visual),
      },
    },
  }
}

function leerContenido() {
  try {
    return normalizarContenido(
      JSON.parse(localStorage.getItem(CONTENIDO_KEY) ?? 'null'),
    )
  } catch (error) {
    return clonar(CONTENIDO_INICIAL)
  }
}

function guardarContenido(contenido) {
  try {
    localStorage.setItem(CONTENIDO_KEY, JSON.stringify(contenido))
  } catch (error) {
    throw new Error(
      'No se pudieron guardar los cambios. Intenta con imágenes más ligeras.',
    )
  }
}

export function ContentProvider({ children }) {
  const [contenido, setContenido] = useState(() => leerContenido())

  const actualizarVisual = useCallback(
    (parcial) => {
      const nuevo = {
        ...contenido,
        inicio: {
          ...contenido.inicio,
          hero: {
            ...contenido.inicio.hero,
            visual: {
              ...contenido.inicio.hero.visual,
              ...parcial,
            },
          },
        },
      }

      guardarContenido(nuevo)
      setContenido(nuevo)
      return nuevo
    },
    [contenido],
  )

  const restablecer = useCallback(() => {
    const nuevo = clonar(CONTENIDO_INICIAL)

    try {
      localStorage.removeItem(CONTENIDO_KEY)
    } catch (error) {
      // Sin persistencia si el navegador la bloquea
    }

    setContenido(nuevo)
    return nuevo
  }, [])

  const value = useMemo(
    () => ({
      contenido,
      actualizarVisual,
      restablecer,
    }),
    [contenido, actualizarVisual, restablecer],
  )

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  )
}
