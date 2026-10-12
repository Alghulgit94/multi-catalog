import { cache } from "react"
import { eq } from "drizzle-orm"
import { getDb, schema } from "../db"
import { PUBLIC_STORE_STATUSES, type PublicStore, type StoreRow } from "../store-types"
import { getImageUrl } from "../media-urls"
import { toAssetVersion } from "../types-catalog"

export function mapPublicStore(row: StoreRow): PublicStore {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    logoUrl: row.logo_path ? getImageUrl(row.logo_path, { width: 400, version: toAssetVersion(row.updated_at) }) : null,
    bannerUrl: row.banner_path ? getImageUrl(row.banner_path, { width: 1600, version: toAssetVersion(row.updated_at) }) : null,
    primaryColor: row.primary_color,
    heroEyebrow: row.hero_eyebrow ?? "",
    heroTitle: row.hero_title ?? row.name,
    heroSubtitle: row.hero_subtitle ?? "",
    shippingNote: row.shipping_note ?? "",
    tagline: row.tagline ?? "",
    whatsapp: (row.whatsapp ?? "").replace(/\D/g, ""),
    email: row.email ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    currency: row.currency,
    locale: row.locale,
    indexable: row.status === "verified",
  }
}

/**
 * Tienda por slug para el catálogo público. Devuelve null si no existe o si
 * está pausada/suspendida: el catálogo muestra "tienda no disponible" en ambos
 * casos, sin revelar cuál.
 */
export const getPublicStore = cache(async (slug: string): Promise<PublicStore | null> => {
  const [row] = await getDb().select().from(schema.stores).where(eq(schema.stores.slug, slug)).limit(1)
  if (!row || !PUBLIC_STORE_STATUSES.includes(row.status)) return null
  return mapPublicStore(row)
})
