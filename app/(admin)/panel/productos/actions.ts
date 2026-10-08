"use server"

import { revalidatePath } from "next/cache"
import { MAX_GALLERY_IMAGES } from "@/lib/types-catalog"
import {
  belongsToStore,
  buildUploadParams,
  destroyCloudinaryAssets,
  uploadImageToCloudinary,
  type ImageType,
} from "@/lib/cloudinary-upload"
import { requireStoreContext } from "@/lib/auth/session"
import { ensureUniqueSlug, describeWriteError } from "@/lib/slug-server"
import type { StoreDb } from "@/lib/data/store-db"
import { toImageRows } from "@/lib/product-images"

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

/** Reemplaza las imágenes de un producto por las dadas (portada + galería). */
async function replaceProductImages(
  db: StoreDb,
  productId: string,
  cover: string | null,
  gallery: string[]
): Promise<boolean> {
  const del = await db.remove("product_images", `product_id=eq.${productId}`)
  if (!del.ok) return false
  const rows = toImageRows(cover, gallery).map((r) => ({ ...r, product_id: productId }))
  if (rows.length === 0) return true
  return (await db.insertMany("product_images", rows)).ok
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

  if (!body.short_description?.trim()) {
    return { error: "La descripción corta es obligatoria" }
  }
  if (!body.description?.trim()) {
    return { error: "La descripción completa es obligatoria" }
  }
  const gallery = JSON.parse((formData.get("gallery_images") as string) || "[]")
  if (gallery.length > MAX_GALLERY_IMAGES) {
    return { error: `Máximo ${MAX_GALLERY_IMAGES} imágenes en la galería` }
  }

  body.slug = await ensureUniqueSlug(db, "products", body.slug, body.name)

  const res = await db.insert("products", body)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { error: describeWriteError(err, "un producto", body.slug, "Error al crear producto") }
  }

  const rows = await res.json()
  const newId = rows[0]?.id as string
  if (!(await replaceProductImages(db, newId, images.cover, images.gallery))) {
    await db.remove("products", `id=eq.${newId}`)
    return { error: "Error al guardar las imágenes del producto" }
  }
  revalidatePath("/panel/productos")
  revalidatePath("/panel/dashboard")
  return { success: true, id: rows[0]?.id, slug: rows[0]?.slug ?? body.slug }
}

export async function updateProduct(id: string, formData: FormData): Promise<ProductWriteResult> {
  const { db, store } = await requireStoreContext()
  const base = buildProductBody(formData)
  const images = readImages(formData, store.id)

  if (!base.short_description?.trim()) {
    return { error: "La descripción corta es obligatoria" }
  }
  if (!base.description?.trim()) {
    return { error: "La descripción completa es obligatoria" }
  }
  const gallery = JSON.parse((formData.get("gallery_images") as string) || "[]")
  if (gallery.length > MAX_GALLERY_IMAGES) {
    return { error: `Máximo ${MAX_GALLERY_IMAGES} imágenes en la galería` }
  }

  // Excluir la propia fila: un slug sin cambios debe pasar intacto, no auto-desambiguarse.
  base.slug = await ensureUniqueSlug(db, "products", base.slug, base.name, id)

  const body = base

  const res = await db.update("products", `id=eq.${id}`, body)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { error: describeWriteError(err, "un producto", body.slug, "Error al actualizar producto") }
  }

  if (!(await replaceProductImages(db, id, images.cover, images.gallery))) {
    return { error: "Error al guardar las imágenes del producto" }
  }

  revalidatePath("/panel/productos")
  revalidatePath(`/panel/productos/${id}`)
  revalidatePath("/panel/dashboard")
  return { success: true, id, slug: body.slug }
}

type AssetRow = { public_id: string }

/** public_id de las imagenes de un producto. */
async function readProductAssets(db: StoreDb, id: string): Promise<string[]> {
  const rows = await db.select<AssetRow>("product_images", `product_id=eq.${id}&select=public_id`)
  return rows.map((r) => r.public_id)
}

/**
 * public_id que siguen referenciados por algun producto de la tienda.
 * Ante cualquier duda hay que tratar todo como "en uso": no borrar de mas.
 */
async function findAssetsStillInUse(db: StoreDb): Promise<Set<string>> {
  const rows = await db.select<AssetRow>("product_images", "select=public_id")
  return new Set(rows.map((r) => r.public_id))
}

export async function deleteProduct(id: string) {
  const { db, store } = await requireStoreContext()

  // Leer las imágenes ANTES del DELETE: después ya no hay de dónde sacarlas.
  const assets = await readProductAssets(db, id)

  const res = await db.remove("products", `id=eq.${id}`)

  if (!res.ok) {
    return { error: "Error al eliminar producto" }
  }

  // Recién con el DELETE confirmado, y en modo best-effort: el producto ya no
  // existe, así que un fallo de Cloudinary no debe reportarse como error.
  if (assets.length > 0) {
    const stillInUse = await findAssetsStillInUse(db)
    await destroyCloudinaryAssets(store.id, assets.filter((a) => !stillInUse.has(a)))
  }

  revalidatePath("/panel/productos")
  revalidatePath("/panel/dashboard")
  return { success: true }
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const { db } = await requireStoreContext()
  const res = await db.update("products", `id=eq.${id}`, { is_active: isActive })

  if (!res.ok) {
    return { error: "Error al actualizar estado" }
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
    return { error: `Máximo ${MAX_GALLERY_IMAGES} imágenes en la galería` }
  }

  const { db, store } = await requireStoreContext()
  const images = {
    cover_image: data.cover_image && belongsToStore(store.id, data.cover_image) ? data.cover_image : null,
    gallery_images: data.gallery_images.filter((a) => belongsToStore(store.id, a)),
  }

  // Los public_id de galería son únicos por subida, así que una foto quitada no
  // se recicla nunca: hay que borrarla o queda huérfana en Cloudinary para siempre.
  const previous = await readProductAssets(db, id)

  if (!(await replaceProductImages(db, id, images.cover_image, images.gallery_images))) {
    return { error: "Error al actualizar imágenes" }
  }
  // Las imágenes ya no viven en la fila del producto: se actualiza updated_at
  // para que el sufijo ?v= rompa el caché de las fotos reemplazadas.
  await db.update("products", `id=eq.${id}`, { updated_at: new Date().toISOString() })

  const kept = new Set([images.cover_image ?? "", ...images.gallery_images].filter(Boolean))
  const removed = previous.filter((a) => !kept.has(a))

  // Best-effort y recién con el PATCH confirmado: las imágenes ya se guardaron
  // bien, un fallo de Cloudinary no debe reportarse como error de guardado.
  if (removed.length > 0) {
    const stillInUse = await findAssetsStillInUse(db)
    await destroyCloudinaryAssets(store.id, removed.filter((a) => !stillInUse.has(a)))
  }

  revalidatePath("/panel/productos")
  revalidatePath("/panel/carga/gestionar-imagenes")
  return { success: true }
}

export async function uploadProductImage(
  file: File,
  productSlug: string,
  imageType: ImageType,
  index?: number
) {
  const { store } = await requireStoreContext()
  if (!file || file.size === 0) return { error: "Archivo inválido" }
  if (!productSlug) return { error: "productSlug es obligatorio" }
  if (imageType !== "cover" && imageType !== "gallery") return { error: "imageType inválido" }

  const { assetFolder, publicId } = buildUploadParams(store.id, productSlug, imageType, index)
  return uploadImageToCloudinary(file, assetFolder, publicId)
}
