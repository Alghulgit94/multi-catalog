"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

/**
 * Sidebar del panel en escritorio: expandido (240px) o riel de íconos (64px).
 * En mobile el menú es un Sheet (ver components/panel/panel-shell.tsx).
 */
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const STORAGE_KEY = "sidebar-collapsed"

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) setIsCollapsedState(JSON.parse(stored) === true)
    } catch {
      // Sin localStorage (modo privado, etc.): queda expandido.
    }
  }, [])

  const setIsCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsedState(collapsed)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed))
    } catch {}
  }, [])

  const toggleSidebar = useCallback(() => setIsCollapsed(!isCollapsed), [isCollapsed, setIsCollapsed])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>{children}</SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) throw new Error("useSidebar must be used within a SidebarProvider")
  return context
}
