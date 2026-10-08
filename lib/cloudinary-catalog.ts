/**
 * Cloudinary URL builder for the public catalog.
 * Pure functions — no DOM, no fetch.
 */

import { CLOUDINARY_CLOUD_NAME, PLACEHOLDER_IMAGE_URL } from "./catalog-config"
import { toAssetVersion } from "./types-catalog"
import type { Product, Category } from "./types-catalog"

interface TransformOptions {
  crop?: string
  background?: string
  width?: number
  height?: number
  quality?: string
  format?: string
  /** Sufijo `?v=` para romper el caché del CDN/navegador. Ver toAssetVersion. */
  version?: string | null
}

function buildTransform(options: TransformOptions): string {
  const parts: string[] = []
  if (options.crop) parts.push(`c_${options.crop}`)
  if (options.background) parts.push(`b_${options.background}`)
  if (options.width) parts.push(`w_${options.width}`)
  if (options.height) parts.push(`h_${options.height}`)
  if (options.quality) parts.push(`q_${options.quality}`)
  if (options.format) parts.push(`f_${options.format}`)
  return parts.join(",")
}

export function getImageUrl(
  publicId: string | null | undefined,
  options: TransformOptions = {}
): string {
  if (!publicId) return PLACEHOLDER_IMAGE_URL
  const transform = buildTransform(options)
  const transformPart = transform ? `${transform}/` : ""
  const suffix = options.version ? `?v=${options.version}` : ""
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformPart}${publicId}${suffix}`
}

export function getProductCoverUrl(product: Product): string {
  return getImageUrl(product.cover_image, {
    width: 800,
    quality: "auto",
    format: "auto",
    version: toAssetVersion(product.updated_at),
  })
}

/**
 * Social preview (Open Graph) derivative. Fixed size so the meta tags can
 * declare it — crawlers render the large card instead of a small thumbnail.
 * Padded, never cropped, so the whole product stays visible.
 */
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export function getProductOgImageUrl(product: Product): string | null {
  // Explicit guard: getImageUrl falls back to the placeholder, and announcing
  // a placeholder as the preview image is worse than omitting the tag.
  if (!product.cover_image) return null
  return getImageUrl(product.cover_image, {
    crop: "pad",
    background: "auto",
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    quality: "auto",
    format: "jpg",
    version: toAssetVersion(product.updated_at),
  })
}

export function getProductGalleryUrls(product: Product): string[] {
  const gallery = product.gallery_images
  if (!Array.isArray(gallery) || !gallery.length) return []
  const version = toAssetVersion(product.updated_at)
  return gallery.map((id) =>
    getImageUrl(id, { width: 800, quality: "auto", format: "auto", version })
  )
}

export function getCategoryImageUrl(category: Category): string {
  return getImageUrl(category.image_path, {
    width: 400,
    quality: "auto",
    format: "auto",
    version: toAssetVersion(category.updated_at),
  })
}
