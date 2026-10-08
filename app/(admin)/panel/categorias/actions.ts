"use server"

import { revalidatePath } from "next/cache"
import { requireStoreContext } from "@/lib/auth/session"
import {
  belongsToStore,
  destroyCloudinaryAssets,
  type CloudinaryUploadOutcome,
  storeAssetFolder,
  uploadImageToCloudinary,
} from "@/lib/cloudinary-upload"
import { ensureUniqueSlug, describeWriteError } from "@/lib/slug-server"

function readCategoryForm(formData: FormData, storeId: string) {
  const imagePath = (formData.get("image_path") as string) || null
  return {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || null,
    sort_order: parseInt((formData.get("sort_order") as string) || "0"),
    is_active: formData.get("is_active") === "true",
    is_visible: formData.get("is_visible") === "true",
    // Solo se aceptan imágenes que viven en la carpeta de esta tienda.
    image_path: imagePath && belongsToStore(storeId, imagePath) ? imagePath : null,
  }
}

export async function createCategory(formData: FormData) {
  const { db, store } = await requireStoreContext()
  const body = readCategoryForm(formData, store.id)
  body.slug = await ensureUniqueSlug(db, "categories", body.slug, body.name)

  const res = await db.insert("categories", body)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { error: describeWriteError(err, "una categoría", body.slug, "Error al crear categoría") }
  }

  const rows = await res.json()
  revalidatePath("/panel/categorias")
  revalidatePath("/panel/dashboard")
  return { success: true, id: rows[0]?.id }
}

export async function updateCategory(id: string, formData: FormData) {
  const { db, store } = await requireStoreContext()
  const body = readCategoryForm(formData, store.id)
  body.slug = await ensureUniqueSlug(db, "categories", body.slug, body.name, id)

  const res = await db.update("categories", `id=eq.${id}`, body)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { error: describeWriteError(err, "una categoría", body.slug, "Error al actualizar categoría") }
  }

  revalidatePath("/panel/categorias")
  revalidatePath(`/panel/categorias/${id}`)
  revalidatePath("/panel/dashboard")
  return { success: true }
}

export async function deleteCategory(id: string) {
  const { db, store } = await requireStoreContext()

  // Leer la imagen ANTES del DELETE, si no queda huérfana en Cloudinary.
  const [row] = await db.select<{ image_path: string | null }>("categories", `id=eq.${id}&select=image_path`)
  const imagePath = row?.image_path ?? null

  const res = await db.remove("categories", `id=eq.${id}`)

  if (!res.ok) {
    return { error: "Error al eliminar categoría" }
  }

  // Best-effort: la categoría ya no existe, no reportar un fallo de Cloudinary.
  if (imagePath) await destroyCloudinaryAssets(store.id, [imagePath])

  revalidatePath("/panel/categorias")
  revalidatePath("/panel/dashboard")
  return { success: true }
}

export async function uploadCategoryImage(formData: FormData): Promise<CloudinaryUploadOutcome> {
  const { store } = await requireStoreContext()
  const file = formData.get("file") as File
  const slug = formData.get("slug") as string

  if (!file || !slug) {
    return { error: "Archivo y slug son requeridos" }
  }

  return uploadImageToCloudinary(file, storeAssetFolder(store.id, "categories"), slug)
}
