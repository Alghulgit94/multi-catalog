/**
 * Puente mínimo a window.dataLayer para los eventos de la landing de Katalo.
 * Ver docs/katalo-brand.md para la lista completa de eventos y payloads.
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export function track(event: string, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event, ...data })
}
