"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Plan } from "@/config/planes"

export interface PanelInfo {
  storeName: string
  storeSlug: string
  /** Plan elegido en el registro (stores.plan_intent). */
  planId: Plan["id"]
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
