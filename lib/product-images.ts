import type { Product, ProductImageRow } from "./types-catalog"

/** Relaciones que se cargan junto a un producto (`db.query.products.findMany({ with })`). */
export const PRODUCT_WITH = {
  categories: { columns: { id: true, name: true, slug: true, is_visible: true } },
  subcategories: { columns: { id: true, name: true, slug: true } },
  product_images: { columns: { public_id: true, sort_order: true, is_cover: true } },
} as const

/**
 * Deriva `cover_image` y `gallery_images` desde las filas de product_images.
 * La portada es la fila is_cover; la galería, el resto por sort_order.
 */
export function withImages(row: Omit<Product, "cover_image" | "gallery_images">): Product {
  const images: ProductImageRow[] = [...(row.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  )
  const cover = images.find((i) => i.is_cover)?.public_id ?? null
  const gallery = images.filter((i) => !i.is_cover).map((i) => i.public_id)
  return { ...row, cover_image: cover, gallery_images: gallery }
}

/** Filas de product_images para guardar la portada y la galería de un producto. */
export function toImageRows(cover: string | null, gallery: string[]) {
  const rows = gallery.map((public_id, i) => ({ public_id, sort_order: i + 1, is_cover: false }))
  if (cover) rows.unshift({ public_id: cover, sort_order: 0, is_cover: true })
  return rows
}
