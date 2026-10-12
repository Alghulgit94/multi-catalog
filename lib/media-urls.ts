/**
 * URLs públicas de las imágenes (servidas por app/media/[...key]/route.ts).
 * Funciones puras: se pueden usar desde componentes de cliente.
 */

import { PLACEHOLDER_IMAGE_URL } from "./catalog-config"
import { toAssetVersion } from "./types-catalog"
import type { Product, Category } from "./types-catalog"

/**
 * Anchos permitidos. Cada combinación distinta cuenta como una transformación
 * de Cloudflare Images, así que la ruta /media redondea hacia arriba a esta lista.
 */
export const MEDIA_WIDTHS = [80, 128, 200, 400, 800, 1200, 1600] as const

interface TransformOptions {
  width?: number
  /** Con alto, la imagen se encaja sin recortar (pad) en width × height. */
  height?: number
  /** Fondo del relleno en modo pad, hex sin `#`. */
  background?: string
  format?: "auto" | "jpeg"
  /** Sufijo `?v=` para romper el caché del CDN/navegador. Ver toAssetVersion. */
  version?: string | null
}

export function getImageUrl(publicId: string | null | undefined, options: TransformOptions = {}): string {
  if (!publicId) return PLACEHOLDER_IMAGE_URL
  const params = new URLSearchParams()
  if (options.width) params.set("w", String(options.width))
  if (options.height) params.set("h", String(options.height))
  if (options.background) params.set("bg", options.background)
  if (options.format && options.format !== "auto") params.set("f", options.format)
  if (options.version) params.set("v", options.version)
  const query = params.toString()
  const path = publicId.split("/").map(encodeURIComponent).join("/")
  return `/media/${path}${query ? `?${query}` : ""}`
}

/** URL de una imagen guardada por su key (para componentes del panel). */
export function buildImageUrl(publicId: string | null, width = 800, version?: string | null): string {
  return getImageUrl(publicId, { width, version })
}

export function getProductCoverUrl(product: Product): string {
  return getImageUrl(product.cover_image, { width: 800, version: toAssetVersion(product.updated_at) })
}

/**
 * Social preview (Open Graph) derivative. Fixed size so the meta tags can
 * declare it — crawlers render the large card instead of a small thumbnail.
 * Padded, never cropped, so the whole product stays visible.
 */
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630
const OG_BACKGROUND = "ffffff"

export function getProductOgImageUrl(product: Product): string | null {
  // Explicit guard: getImageUrl falls back to the placeholder, and announcing
  // a placeholder as the preview image is worse than omitting the tag.
  if (!product.cover_image) return null
  return getImageUrl(product.cover_image, {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    background: OG_BACKGROUND,
    format: "jpeg",
    version: toAssetVersion(product.updated_at),
  })
}

export function getProductGalleryUrls(product: Product): string[] {
  const gallery = product.gallery_images
  if (!Array.isArray(gallery) || !gallery.length) return []
  const version = toAssetVersion(product.updated_at)
  return gallery.map((id) => getImageUrl(id, { width: 800, version }))
}

export function getCategoryImageUrl(category: Category): string {
  return getImageUrl(category.image_path, { width: 400, version: toAssetVersion(category.updated_at) })
}
