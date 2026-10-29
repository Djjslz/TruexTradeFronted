import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import {
  loginUsuario,
  obtenerPerfil,
  registrarUsuario,
} from '../services/auth.service'

export const AuthContext = createContext(null)

const SESION_KEY = 'truex-auth'

function leerSesion() {
  try {
    const guardado = JSON.parse(localStorage.getItem(SESION_KEY) ?? 'null')
    if (guardado?.token && guardado?.user) {
      return guardado
    }
    return null
  } catch (error) {
    return null
  }
}

function guardarSesion(sesion) {
  try {
    localStorage.setItem(SESION_KEY, JSON.stringify(sesion))
  } catch (error) {
    // Sin persistencia si el navegador la bloquea
  }
}

function limpiarSesion() {
  try {
    localStorage.removeItem(SESION_KEY)
  } catch (error) {
    // Sin persistencia si el navegador la bloquea
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesion())
  const [cargando, setCargando] = useState(() => Boolean(leerSesion()?.token))

  useEffect(() => {
    if (!sesion?.token) {
      setCargando(false)
      return
    }

    let activo = true

    obtenerPerfil(sesion.token)
      .then((usuario) => {
        if (!activo) return
        const actualizada = { token: sesion.token, user: usuario }
        guardarSesion(actualizada)
        setSesion(actualizada)
      })
      .catch(() => {
        if (!activo) return
        limpiarSesion()
        setSesion(null)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const login = useCallback(async (datos) => {
    const nueva = await loginUsuario(datos)
    guardarSesion(nueva)
    setSesion(nueva)
    return nueva.user
  }, [])

  const register = useCallback(async (datos) => {
    const nueva = await registrarUsuario(datos)
    guardarSesion(nueva)
    setSesion(nueva)
    return nueva.user
  }, [])

  const logout = useCallback(() => {
    limpiarSesion()
    setSesion(null)
  }, [])

  const value = useMemo(
    () => ({
      user: sesion?.user ?? null,
      token: sesion?.token ?? null,
      cargando,
      isAuthenticated: Boolean(sesion?.user),
      login,
      register,
      logout,
    }),
    [sesion, cargando, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
