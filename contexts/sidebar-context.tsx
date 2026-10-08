"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const STORAGE_KEY = "sidebar-collapsed"
const MD_BREAKPOINT = 768

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount and handle initial screen size
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const isSmallScreen = window.innerWidth < MD_BREAKPOINT

    if (isSmallScreen) {
      // Always collapse on small screens initially
      setIsCollapsedState(true)
    } else if (stored !== null) {
      // Use stored preference on larger screens
      setIsCollapsedState(JSON.parse(stored))
    }

    setIsHydrated(true)
  }, [])

  // Auto-collapse on small screens when resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < MD_BREAKPOINT) {
        setIsCollapsedState(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const setIsCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsedState(collapsed)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed))
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(!isCollapsed)
  }, [isCollapsed, setIsCollapsed])

  // Use default state until hydrated to prevent mismatch
  const value = {
    isCollapsed: isHydrated ? isCollapsed : false,
    setIsCollapsed,
    toggleSidebar,
  }

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
