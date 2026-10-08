/**
 * UI-shaped types for the public catalog (mapped from raw Supabase rows).
 * Separate from types-catalog.ts which mirrors the DB schema.
 */

export interface CatalogCategory {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  isVisible: boolean
}

export interface CatalogSubcategory {
  id: string
  categoryId: string
  name: string
  slug: string
}

export interface CatalogProduct {
  id: string
  name: string
  slug: string
  category: { id: string | null; name: string; slug: string; is_visible?: boolean }
  subcategory: { id: string; name: string; slug: string } | null
  featured: boolean
  price: number | null
  showPrice: boolean
  shortDescription: string
  description: string
  coverImage: string
  /** Fixed-size Open Graph derivative; null when the product has no cover. */
  ogImage: string | null
  galleryImages: string[]
  tags: string[]
  isVisible: boolean
  categoryIsVisible: boolean
}
