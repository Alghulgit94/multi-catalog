/**
 * Imágenes en R2 (binding MEDIA). Solo server-side.
 *
 * Las keys conservan la forma de los antiguos public_id de Cloudinary y son lo
 * que se guarda en la BD: `stores/{storeId}/{products|categories|brand}/{nombre}`
 * y `drafts/{draftId}/logo`. Se sirven redimensionadas por /media/[...key].
 */
import { env } from "cloudflare:workers"
import { buildImageUrl } from "./media-urls"

export type ImageType = "cover" | "gallery"

/**
 * Una carpeta por tienda, nombrada con su ID (no con el slug, que puede
 * cambiar): permite medir el espacio usado, borrar todo al dar de baja la
 * tienda y aplicar límites por plan.
 */
export type StoreFolder = "products" | "categories" | "brand"

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"]

function bucket(): R2Bucket {
  return (env as { MEDIA: R2Bucket }).MEDIA
}

export function storeAssetFolder(storeId: string, folder: StoreFolder): string {
  return `stores/${storeId}/${folder}`
}

/** Los assets de una tienda solo se pueden borrar si están en su carpeta. */
export function belongsToStore(storeId: string, publicId: string): boolean {
  return publicId.startsWith(`stores/${storeId}/`)
}

/**
 * La portada mantiene un nombre estable (`{slug}-cover`): es un slot 1:1 con el
 * producto, sobrescribirla es lo correcto y el `?v=` de la URL resuelve su caché.
 *
 * Las fotos de galería, en cambio, llevan un sufijo irrepetible. Antes se
 * nombraban por su posición en el array (`-01`, `-02`, …), y sobrescribir
 * destruía fotos: al borrar una del medio y agregar otra, la nueva tomaba el
 * número de una foto que seguía viva y la pisaba.
 *
 * `index` sobrevive solo como desempate entre las subidas paralelas del mismo
 * milisegundo (la galería se sube con Promise.all), no como identidad.
 */
export function buildUploadParams(
  storeId: string,
  productSlug: string,
  imageType: ImageType,
  index?: number
): { assetFolder: string; publicId: string } {
  const assetFolder = storeAssetFolder(storeId, "products")
  const publicId =
    imageType === "cover"
      ? `${productSlug}-cover`
      : `${productSlug}-${Date.now().toString(36)}${(index ?? 0).toString(36)}`
  return { assetFolder, publicId }
}

export type UploadOutcome =
  | { error: string; success?: undefined; public_id?: undefined; secure_url?: undefined }
  | { error?: undefined; success: true; public_id: string; secure_url: string }

/** Sube un archivo a R2. `assetFolder` debe salir de storeAssetFolder() o ser `drafts/{id}`. */
export async function uploadImage(file: File, assetFolder: string, publicId: string): Promise<UploadOutcome> {
  if (!ALLOWED_TYPES.includes(file.type)) return { error: "Formato de imagen no soportado" }
  if (file.size > MAX_UPLOAD_BYTES) return { error: "La imagen pesa más de 15 MB" }

  const key = `${assetFolder}/${publicId}`
  try {
    await bucket().put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
  } catch (e) {
    console.error("[media] no se pudo subir", key, e)
    return { error: "No se pudo subir la imagen" }
  }
  return { success: true, public_id: key, secure_url: buildImageUrl(key, 800, String(Date.now())) }
}

/**
 * Borra assets de R2.
 *
 * Recibe las keys tal como se guardan en la BD y descarta las que no
 * pertenecen a la carpeta de `storeId`: una fila manipulada no puede hacer que
 * se borren imágenes de otra tienda.
 *
 * Es best-effort y nunca lanza: se usa después de que la fila ya se borró,
 * así que un fallo acá no debe reportarse como si el borrado hubiera fallado.
 */
export async function destroyAssets(storeId: string, publicIds: string[]): Promise<void> {
  const keys = Array.from(new Set(publicIds.filter((id) => id && belongsToStore(storeId, id))))
  if (keys.length === 0) return
  try {
    await bucket().delete(keys)
  } catch (e) {
    console.error("[media] no se pudieron borrar", keys, e)
  }
}

/**
 * Mueve un asset a otra key (p. ej. del borrador del onboarding a la carpeta de
 * marca de la tienda). Devuelve la nueva key, o null si falla.
 */
export async function renameAsset(fromKey: string, toKey: string): Promise<string | null> {
  try {
    const obj = await bucket().get(fromKey)
    if (!obj) return null
    await bucket().put(toKey, obj.body, { httpMetadata: obj.httpMetadata })
    await bucket().delete(fromKey)
    return toKey
  } catch (e) {
    console.error("[media] no se pudo mover", fromKey, e)
    return null
  }
}

/** Borra un asset sin restricción de tienda. Solo para borradores del onboarding (best-effort). */
export async function destroyDraftAsset(publicId: string): Promise<void> {
  if (!publicId.startsWith("drafts/")) return
  try {
    await bucket().delete(publicId)
  } catch (e) {
    console.error("[media] no se pudo borrar el borrador", publicId, e)
  }
}
