"use server"

import { revalidatePath } from "next/cache"
import { requireStoreContext } from "@/lib/auth/session"
import { eq } from "drizzle-orm"
import { dbErrorCode, schema } from "@/lib/db"
import { belongsToStore, destroyAssets } from "@/lib/media"
import { ensureUniqueSlug, describeWriteError } from "@/lib/slug-server"

const { categories } = schema

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

  let id: string | undefined
  try {
    const [row] = await db.db.insert(categories).values(db.withStore(body)).returning({ id: categories.id })
    id = row?.id
  } catch (err) {
    return { error: describeWriteError(err, "una categoría", body.slug, "No pudimos crear la categoría. Probá de nuevo.") }
  }

  revalidatePath("/panel/categorias")
  revalidatePath("/panel/dashboard")
  return { success: true, id }
}

export async function updateCategory(id: string, formData: FormData) {
  const { db, store } = await requireStoreContext()
  const body = readCategoryForm(formData, store.id)
  body.slug = await ensureUniqueSlug(db, "categories", body.slug, body.name, id)

  try {
    await db.db.update(categories).set(db.safe(body)).where(db.where(categories, eq(categories.id, id)))
  } catch (err) {
    return { error: describeWriteError(err, "una categoría", body.slug, "No pudimos guardar la categoría. Probá de nuevo.") }
  }

  revalidatePath("/panel/categorias")
  revalidatePath(`/panel/categorias/${id}`)
  revalidatePath("/panel/dashboard")
  return { success: true }
}

export async function deleteCategory(id: string) {
  const { db, store } = await requireStoreContext()

  // Leer la imagen ANTES del DELETE, si no queda huérfana en R2.
  const [row] = await db.db
    .select({ image_path: categories.image_path })
    .from(categories)
    .where(db.where(categories, eq(categories.id, id)))
  const imagePath = row?.image_path ?? null

  try {
    await db.db.delete(categories).where(db.where(categories, eq(categories.id, id)))
  } catch (err) {
    // FK RESTRICT: la categoría todavía tiene productos.
    console.error("[categorias] no se pudo eliminar", err)
    return {
      error:
        dbErrorCode(err) === "foreign_key"
          ? "No se puede eliminar: la categoría tiene productos. Movelos a otra categoría primero."
          : "No pudimos eliminar la categoría. Probá de nuevo.",
    }
  }

  // Best-effort: la categoría ya no existe, no reportar un fallo de R2.
  if (imagePath) await destroyAssets(store.id, [imagePath])

  revalidatePath("/panel/categorias")
  revalidatePath("/panel/dashboard")
  return { success: true }
}
