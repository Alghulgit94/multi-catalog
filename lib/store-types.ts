export type StoreStatus =
  | "active_unverified"
  | "in_review"
  | "verified"
  | "paused"
  | "suspended"

export type MemberRole = "owner" | "editor"

/** Fila de `stores` tal como viene de la BD. */
export interface StoreRow {
  id: string
  name: string
  slug: string
  status: StoreStatus
  logo_path: string | null
  primary_color: string | null
  banner_path: string | null
  hero_eyebrow: string | null
  hero_title: string | null
  hero_subtitle: string | null
  shipping_note: string | null
  tagline: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  city: string | null
  currency: string
  locale: string
  plan_id: string | null
  verification_deadline: string | null
  verified_at: string | null
  review_message: string | null
  created_at: string
  updated_at: string
}

/** Datos de tienda listos para el catálogo público (URLs ya resueltas). */
export interface PublicStore {
  id: string
  slug: string
  name: string
  status: StoreStatus
  logoUrl: string | null
  bannerUrl: string | null
  primaryColor: string | null
  heroEyebrow: string
  heroTitle: string
  heroSubtitle: string
  shippingNote: string
  tagline: string
  whatsapp: string
  email: string
  address: string
  city: string
  currency: string
  locale: string
  /** Solo las tiendas verificadas se indexan en Google. */
  indexable: boolean
}

/** Estados en los que el catálogo público se muestra. */
export const PUBLIC_STORE_STATUSES: readonly StoreStatus[] = [
  "active_unverified",
  "in_review",
  "verified",
]
