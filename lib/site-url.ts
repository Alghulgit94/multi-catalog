/**
 * Resolves the public origin of the catalog, for absolute links (WhatsApp
 * messages, Open Graph tags). Server-only: reads request headers.
 */

import { cache } from "react"
import { headers } from "next/headers"
import { SITE_URL } from "./catalog-config"

export const getSiteUrl = cache(async (): Promise<string> => {
  if (SITE_URL) return SITE_URL.replace(/\/$/, "")

  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  return `${proto}://${host}`
})
