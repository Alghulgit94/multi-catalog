"use client"

import { createContext, useContext, type ReactNode } from "react"

export interface PanelInfo {
  storeName: string
  storeSlug: string
  userName: string
  userEmail: string
}

const PanelContext = createContext<PanelInfo | undefined>(undefined)

export function PanelProvider({ value, children }: { value: PanelInfo; children: ReactNode }) {
  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
}

export function usePanel(): PanelInfo {
  const ctx = useContext(PanelContext)
  if (!ctx) throw new Error("usePanel debe usarse dentro de PanelProvider")
  return ctx
}
