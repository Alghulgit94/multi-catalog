import { createHash } from "crypto"
import { CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from "./catalog-config"

export type ImageType = "cover" | "gallery"

/**
 * Una carpeta por tienda, nombrada con su ID (no con el slug, que puede
 * cambiar): permite medir el espacio usado, borrar todo al dar de baja la
 * tienda y aplicar límites por plan.
 */
export type StoreFolder = "products" | "categories" | "brand"

export function storeAssetFolder(storeId: string, folder: StoreFolder): string {
  return `stores/${storeId}/${folder}`
}

/** Los assets de una tienda solo se pueden borrar si están en su carpeta. */
export function belongsToStore(storeId: string, publicId: string): boolean {
  return publicId.startsWith(`stores/${storeId}/`)
}

/**
 * La portada mantiene un nombre estable (`{slug}-cover`): es un slot 1:1 con el
 * producto, sobrescribirla es lo correcto y el `invalidate` de la subida más el
 * `?v=` de la URL ya resuelven su caché.
 *
 * Las fotos de galería, en cambio, llevan un sufijo irrepetible. Antes se
 * nombraban por su posición en el array (`-01`, `-02`, …), y con `overwrite`
 * eso destruía fotos: al borrar una del medio y agregar otra, la nueva tomaba
 * el número de una foto que seguía viva y la pisaba.
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

export function signUploadParams(assetFolder: string, publicId: string) {
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!apiKey || !apiSecret) throw new Error("Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET")

  const timestamp = Math.floor(Date.now() / 1000)

  // All params EXCEPT file, api_key — sorted alphabetically.
  // `invalidate` purga el CDN al sobrescribir; sin esto la URL queda igual y
  // Cloudinary sigue sirviendo la imagen vieja (max-age=2592000, 30 días).
  const toSign =
    `asset_folder=${assetFolder}&invalidate=true&overwrite=true&public_id=${publicId}&timestamp=${timestamp}&use_asset_folder_as_public_id_prefix=true` +
    apiSecret

  const signature = createHash("sha1").update(toSign).digest("hex")

  return {
    api_key: apiKey,
    timestamp,
    signature,
    asset_folder: assetFolder,
    public_id: publicId,
  }
}

export function signDestroyParams(publicId: string) {
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!apiKey || !apiSecret) throw new Error("Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET")

  const timestamp = Math.floor(Date.now() / 1000)

  // All params EXCEPT api_key — sorted alphabetically
  const toSign = `invalidate=true&public_id=${publicId}&timestamp=${timestamp}` + apiSecret

  const signature = createHash("sha1").update(toSign).digest("hex")

  return { api_key: apiKey, timestamp, signature, public_id: publicId }
}

/**
 * Borra assets de Cloudinary.
 *
 * Recibe los public_id tal como se guardan en la BD y descarta los que no
 * pertenecen a la carpeta de `storeId`: una fila manipulada no puede hacer que
 * se borren imágenes de otra tienda.
 *
 * Es best-effort y nunca lanza: se usa después de que la fila ya se borró,
 * así que un fallo acá no debe reportarse como si el borrado hubiera fallado.
 */
export async function destroyCloudinaryAssets(storeId: string, publicIds: string[]): Promise<void> {
  const ids = Array.from(new Set(publicIds.filter((id) => id && belongsToStore(storeId, id))))
  if (ids.length === 0) return

  await Promise.all(
    ids.map(async (fullId) => {
      try {
        const signed = signDestroyParams(fullId)

        const form = new FormData()
        form.append("public_id", signed.public_id)
        form.append("api_key", signed.api_key)
        form.append("timestamp", String(signed.timestamp))
        form.append("signature", signed.signature)
        form.append("invalidate", "true")

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
          { method: "POST", body: form }
        )
        const data = await res.json().catch(() => ({}))

        // "not found" es un resultado aceptable: el asset ya no estaba.
        if (!res.ok || (data?.result !== "ok" && data?.result !== "not found")) {
          console.error("[destroyCloudinaryAssets] no se pudo borrar", fullId, data)
        }
      } catch (e) {
        console.error("[destroyCloudinaryAssets] error borrando", fullId, e)
      }
    })
  )
}

export type CloudinaryUploadOutcome =
  | { error: string; success?: undefined; public_id?: undefined; secure_url?: undefined }
  | { error?: undefined; success: true; public_id: string; secure_url: string }

/** Sube un archivo firmando en el servidor. `assetFolder` debe salir de storeAssetFolder(). */
export async function uploadImageToCloudinary(
  file: File,
  assetFolder: string,
  publicId: string
): Promise<CloudinaryUploadOutcome> {
  let signed: ReturnType<typeof signUploadParams>
  try {
    signed = signUploadParams(assetFolder, publicId)
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error generando firma" }
  }

  const uploadData = new FormData()
  uploadData.append("file", file)
  uploadData.append("api_key", signed.api_key)
  uploadData.append("timestamp", String(signed.timestamp))
  uploadData.append("signature", signed.signature)
  uploadData.append("asset_folder", signed.asset_folder)
  uploadData.append("public_id", signed.public_id)
  uploadData.append("invalidate", "true")
  uploadData.append("overwrite", "true")
  uploadData.append("use_asset_folder_as_public_id_prefix", "true")

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: uploadData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { error: err?.error?.message || `HTTP ${res.status}` }
  }

  const data = await res.json()
  return { success: true, public_id: data.public_id as string, secure_url: data.secure_url as string }
}
