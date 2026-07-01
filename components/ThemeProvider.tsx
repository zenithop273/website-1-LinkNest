'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Mode = 'dark' | 'light'
const Ctx = createContext<{ mode: Mode; toggle: () => void }>({ mode: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('dark')

  // Read saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('ln-theme') as Mode | null
    const preferred = saved ?? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    setMode(preferred)
  }, [])

  // Apply class to <html>
  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('dark', 'light')
    html.classList.add(mode)
    localStorage.setItem('ln-theme', mode)
  }, [mode])

  const toggle = () => setMode(m => m === 'dark' ? 'light' : 'dark')

  return <Ctx.Provider value={{ mode, toggle }}>{children}</Ctx.Provider>
}

export function useThemeMode() { return useContext(Ctx) }
