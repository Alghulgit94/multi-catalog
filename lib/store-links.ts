/**
 * Única fuente de URLs de una tienda (panel, WhatsApp, emails, metadatos).
 * Hoy van por ruta (`/nombre-tienda`); si se pasa a subdominios o dominios
 * propios, se cambia solo este archivo.
 */

export function storeHomePath(storeSlug: string): string {
  return `/${storeSlug}`
}

export function storeCatalogPath(storeSlug: string, params?: Record<string, string | undefined>): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) qs.set(key, value)
  }
  const query = qs.toString()
  return `/${storeSlug}/catalogo${query ? `?${query}` : ""}`
}

export function storeProductPath(storeSlug: string, productSlug: string): string {
  return `/${storeSlug}/producto/${encodeURIComponent(productSlug)}`
}

/** URL absoluta de una ruta de tienda. `origin` sin barra final. */
export function absoluteStoreUrl(origin: string, path: string): string {
  return `${origin.replace(/\/$/, "")}${path}`
}
