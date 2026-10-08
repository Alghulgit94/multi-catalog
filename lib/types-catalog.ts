import { CLOUDINARY_CLOUD_NAME, PLACEHOLDER_IMAGE_URL } from "./catalog-config"

/**
 * Types for the catalog: products, categories and subcategories.
 * Mirror the tables in db/schema.sql.
 */

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_path: string | null   // Cloudinary public_id completo
  sort_order: number
  is_active: boolean
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined relation
  categories?: Pick<Category, "id" | "name" | "slug"> | null
}

export interface ProductImageRow {
  public_id: string
  sort_order: number
  is_cover: boolean
}

export interface Product {
  id: string
  category_id: string
  subcategory_id: string | null
  sku?: string | null
  name: string
  slug: string
  short_description: string | null
  description: string | null
  price: number | null          // In Guaraníes, null = no price
  show_price: boolean
  featured: boolean
  // Derivados de product_images (ver lib/product-images.ts), public_id completos
  cover_image: string | null
  gallery_images: string[]
  product_images?: ProductImageRow[]
  tags: string[]
  is_active: boolean
  is_visible: boolean
  created_at: string
  updated_at: string
  // Joined relations
  categories?: Pick<Category, "id" | "name" | "slug" | "is_visible"> | null
  subcategories?: Pick<Subcategory, "id" | "name" | "slug"> | null
}

export const MAX_GALLERY_IMAGES = 4

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
}

/**
 * Convierte un `updated_at` en un sufijo de versión estable para romper caché.
 *
 * Las imágenes se reemplazan conservando el mismo public_id, así que la URL no
 * cambia y Cloudinary la sirve con `max-age=2592000` (30 días): sin esto, una
 * foto reemplazada sigue viéndose vieja en el navegador durante un mes.
 */
export function toAssetVersion(updatedAt?: string | null): string | null {
  if (!updatedAt) return null
  const ms = Date.parse(updatedAt)
  return Number.isNaN(ms) ? null : String(ms)
}

/** Builds a Cloudinary URL from a stored public_id (usable from client components). */
export function buildCloudinaryUrl(
  publicId: string | null,
  width = 800,
  version?: string | null
): string {
  if (!publicId) return PLACEHOLDER_IMAGE_URL
  const suffix = version ? `?v=${version}` : ""
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},q_auto,f_auto/${publicId}${suffix}`
}
