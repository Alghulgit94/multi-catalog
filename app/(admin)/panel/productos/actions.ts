"use server"

import { revalidatePath } from "next/cache"
import { MAX_GALLERY_IMAGES } from "@/lib/types-catalog"
import { eq } from "drizzle-orm"
import { belongsToStore, destroyAssets } from "@/lib/media"
import { requireStoreContext } from "@/lib/auth/session"
import { schema } from "@/lib/db"
import { ensureUniqueSlug, describeWriteError } from "@/lib/slug-server"
import type { StoreDb } from "@/lib/data/store-db"
import { toImageRows } from "@/lib/product-images"

const { products, product_images } = schema

export type ProductWriteResult = {
  success?: boolean
  error?: string
  id?: string
  /** Slug definitivo que quedó en la BD, ya desambiguado. */
  slug?: string
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

/** Portada y galería del formulario; solo se aceptan imágenes de la carpeta de esta tienda. */
function readImages(formData: FormData, storeId: string) {
  const coverRaw = (formData.get("cover_image") as string) || null
  const galleryRaw = formData.get("gallery_images") as string
  const gallery = (galleryRaw ? JSON.parse(galleryRaw) : []) as string[]
  return {
    cover: coverRaw && belongsToStore(storeId, coverRaw) ? coverRaw : null,
    gallery: gallery.filter((id) => belongsToStore(storeId, id)),
  }
}

/**
 * Reemplaza las imágenes de un producto por las dadas (portada + galería).
 * Borrado e inserción van en un batch de D1 (transacción): nunca queda a medias.
 */
async function replaceProductImages(
  db: StoreDb,
  productId: string,
  cover: string | null,
  gallery: string[]
): Promise<boolean> {
  const rows = toImageRows(cover, gallery).map((r) => db.withStore({ ...r, product_id: productId }))
  const remove = db.db.delete(product_images).where(db.where(product_images, eq(product_images.product_id, productId)))
  try {
    if (rows.length === 0) await remove
    else await db.db.batch([remove, db.db.insert(product_images).values(rows)])
    return true
  } catch (e) {
    console.error("[productos] no se pudieron guardar las imágenes", e)
    return false
  }
}

/**
 * La FK products.subcategory_id es simple (SQLite no puede anular solo una
 * columna de una FK compuesta), así que la pertenencia a la tienda se valida acá.
 */
async function subcategoryInStore(db: StoreDb, subcategoryId: string | null): Promise<boolean> {
  if (!subcategoryId) return true
  return (await db.count(schema.subcategories, eq(schema.subcategories.id, subcategoryId))) > 0
}

function buildProductBody(formData: FormData) {
  const tagsRaw = (formData.get("tags") as string) || ""
  const subcategoryRaw = (formData.get("subcategory_id") as string) || ""

  return {
    category_id: formData.get("category_id") as string,
    subcategory_id: subcategoryRaw || null,
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    short_description: (formData.get("short_description") as string) || null,
    description: (formData.get("description") as string) || null,
    price: formData.get("price") ? parseFloat(formData.get("price") as string) : null,
    show_price: formData.get("show_price") === "true",
    featured: formData.get("featured") === "true",
    tags: parseTags(tagsRaw),
    is_active: formData.get("is_active") === "true",
    is_visible: formData.get("is_visible") === "true",
  }
}

export async function createProduct(formData: FormData): Promise<ProductWriteResult> {
  const { db, store } = await requireStoreContext()
  const body = buildProductBody(formData)
  const images = readImages(formData, store.id)

  if (!(await subcategoryInStore(db, body.subcategory_id))) {
    return { error: "La categoría o subcategoría elegida no es válida." }
  }
  if (!body.short_description?.trim()) {
    return { error: "Escribí una descripción corta" }
  }
  if (!body.description?.trim()) {
    return { error: "Escribí la descripción completa" }
  }
  const gallery = JSON.parse((formData.get("gallery_images") as string) || "[]")
  if (gallery.length > MAX_GALLERY_IMAGES) {
    return { error: `La galería admite hasta ${MAX_GALLERY_IMAGES} fotos` }
  }

  body.slug = await ensureUniqueSlug(db, "products", body.slug, body.name)

  let created: { id: string; slug: string } | undefined
  try {
    ;[created] = await db.db
      .insert(products)
      .values(db.withStore(body))
      .returning({ id: products.id, slug: products.slug })
  } catch (err) {
    return { error: describeWriteError(err, "un producto", body.slug, "No pudimos crear el producto. Probá de nuevo.") }
  }
  if (!created) return { error: "No pudimos crear el producto. Probá de nuevo." }

  if (!(await replaceProductImages(db, created.id, images.cover, images.gallery))) {
    await db.db.delete(products).where(db.where(products, eq(products.id, created.id)))
    return { error: "No pudimos guardar las fotos del producto. Probá de nuevo." }
  }
  revalidatePath("/panel/productos")
  revalidatePath("/panel/dashboard")
  return { success: true, id: created.id, slug: created.slug }
}

export async function updateProduct(id: string, formData: FormData): Promise<ProductWriteResult> {
  const { db, store } = await requireStoreContext()
  const base = buildProductBody(formData)
  const images = readImages(formData, store.id)

  if (!(await subcategoryInStore(db, base.subcategory_id))) {
    return { error: "La categoría o subcategoría elegida no es válida." }
  }
  if (!base.short_description?.trim()) {
    return { error: "Escribí una descripción corta" }
  }
  if (!base.description?.trim()) {
    return { error: "Escribí la descripción completa" }
  }
  const gallery = JSON.parse((formData.get("gallery_images") as string) || "[]")
  if (gallery.length > MAX_GALLERY_IMAGES) {
    return { error: `La galería admite hasta ${MAX_GALLERY_IMAGES} fotos` }
  }

  // Excluir la propia fila: un slug sin cambios debe pasar intacto, no auto-desambiguarse.
  base.slug = await ensureUniqueSlug(db, "products", base.slug, base.name, id)

  const body = base

  try {
    await db.db.update(products).set(db.safe(body)).where(db.where(products, eq(products.id, id)))
  } catch (err) {
    return { error: describeWriteError(err, "un producto", body.slug, "No pudimos guardar el producto. Probá de nuevo.") }
  }

  if (!(await replaceProductImages(db, id, images.cover, images.gallery))) {
    return { error: "No pudimos guardar las fotos del producto. Probá de nuevo." }
  }

  revalidatePath("/panel/productos")
  revalidatePath(`/panel/productos/${id}`)
  revalidatePath("/panel/dashboard")
  return { success: true, id, slug: body.slug }
}

/** Keys de las imagenes de un producto. */
async function readProductAssets(db: StoreDb, id: string): Promise<string[]> {
  const rows = await db.db
    .select({ public_id: product_images.public_id })
    .from(product_images)
    .where(db.where(product_images, eq(product_images.product_id, id)))
  return rows.map((r) => r.public_id)
}

/**
 * public_id que siguen referenciados por algun producto de la tienda.
 * Ante cualquier duda hay que tratar todo como "en uso": no borrar de mas.
 */
async function findAssetsStillInUse(db: StoreDb): Promise<Set<string>> {
  const rows = await db.db
    .select({ public_id: product_images.public_id })
    .from(product_images)
    .where(db.where(product_images))
  return new Set(rows.map((r) => r.public_id))
}

export async function deleteProduct(id: string) {
  const { db, store } = await requireStoreContext()

  // Leer las imágenes ANTES del DELETE: después ya no hay de dónde sacarlas.
  const assets = await readProductAssets(db, id)

  try {
    await db.db.delete(products).where(db.where(products, eq(products.id, id)))
  } catch (err) {
    console.error("[productos] no se pudo eliminar", err)
    return { error: "No pudimos eliminar el producto. Probá de nuevo." }
  }

  // Recién con el DELETE confirmado, y en modo best-effort: el producto ya no
  // existe, así que un fallo de R2 no debe reportarse como error.
  if (assets.length > 0) {
    const stillInUse = await findAssetsStillInUse(db)
    await destroyAssets(store.id, assets.filter((a) => !stillInUse.has(a)))
  }

  revalidatePath("/panel/productos")
  revalidatePath("/panel/dashboard")
  return { success: true }
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const { db } = await requireStoreContext()
  try {
    await db.db.update(products).set({ is_active: isActive }).where(db.where(products, eq(products.id, id)))
  } catch (err) {
    console.error("[productos] no se pudo cambiar el estado", err)
    return { error: "No pudimos cambiar el estado. Probá de nuevo." }
  }

  revalidatePath("/panel/productos")
  revalidatePath("/panel/dashboard")
  return { success: true }
}

export async function updateProductImages(
  id: string,
  data: { cover_image: string | null; gallery_images: string[] }
) {
  if (data.gallery_images.length > MAX_GALLERY_IMAGES) {
    return { error: `La galería admite hasta ${MAX_GALLERY_IMAGES} fotos` }
  }

  const { db, store } = await requireStoreContext()
  const images = {
    cover_image: data.cover_image && belongsToStore(store.id, data.cover_image) ? data.cover_image : null,
    gallery_images: data.gallery_images.filter((a) => belongsToStore(store.id, a)),
  }

  // Las keys de galería son únicas por subida, así que una foto quitada no se
  // recicla nunca: hay que borrarla o queda huérfana en R2 para siempre.
  const previous = await readProductAssets(db, id)

  if (!(await replaceProductImages(db, id, images.cover_image, images.gallery_images))) {
    return { error: "No pudimos guardar las fotos. Probá de nuevo." }
  }
  // Las imágenes ya no viven en la fila del producto: se actualiza updated_at
  // para que el sufijo ?v= rompa el caché de las fotos reemplazadas.
  await db.db
    .update(products)
    .set({ updated_at: new Date().toISOString() })
    .where(db.where(products, eq(products.id, id)))

  const kept = new Set([images.cover_image ?? "", ...images.gallery_images].filter(Boolean))
  const removed = previous.filter((a) => !kept.has(a))

  // Best-effort y recién con el update confirmado: las imágenes ya se guardaron
  // bien, un fallo de R2 no debe reportarse como error de guardado.
  if (removed.length > 0) {
    const stillInUse = await findAssetsStillInUse(db)
    await destroyAssets(store.id, removed.filter((a) => !stillInUse.has(a)))
  }

  revalidatePath("/panel/productos")
  revalidatePath("/panel/carga/gestionar-imagenes")
  return { success: true }
}
