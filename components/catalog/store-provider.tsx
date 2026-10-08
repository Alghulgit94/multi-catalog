"use client"

import { createContext, useContext, type ReactNode } from "react"
import { storeCatalogPath, storeHomePath } from "@/lib/store-links"

const StoreSlugContext = createContext<string | null>(null)

/** Da a los componentes de cliente del catálogo el slug de su tienda. */
export function StoreProvider({ slug, children }: { slug: string; children: ReactNode }) {
  return <StoreSlugContext.Provider value={slug}>{children}</StoreSlugContext.Provider>
}

export function useStoreLinks() {
  const slug = useContext(StoreSlugContext)
  if (!slug) throw new Error("useStoreLinks debe usarse dentro de StoreProvider")
  return {
    home: storeHomePath(slug),
    catalog: (params?: Record<string, string | undefined>) => storeCatalogPath(slug, params),
  }
}
