"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { requireStoreContext } from "@/lib/auth/session"
import { schema } from "@/lib/db"
import { ensureUniqueSlug, describeWriteError } from "@/lib/slug-server"

const { subcategories } = schema

type SubcategoryResult = {
  success?: boolean
  error?: string
  id?: string
  slug?: string
}

export async function createSubcategory(formData: FormData): Promise<SubcategoryResult> {
  const { db } = await requireStoreContext()
  const body = {
    category_id: formData.get("category_id") as string,
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    sort_order: parseInt((formData.get("sort_order") as string) || "0"),
    is_active: formData.get("is_active") === "true",
  }

  body.slug = await ensureUniqueSlug(db, "subcategories", body.slug, body.name)

  let created: { id: string; slug: string } | undefined
  try {
    ;[created] = await db.db
      .insert(subcategories)
      .values(db.withStore(body))
      .returning({ id: subcategories.id, slug: subcategories.slug })
  } catch (err) {
    return { error: describeWriteError(err, "una subcategoría", body.slug, "No pudimos crear la subcategoría. Probá de nuevo.") }
  }

  revalidatePath("/panel/subcategorias")
  return { success: true, id: created?.id, slug: created?.slug ?? body.slug }
}

export async function updateSubcategory(id: string, formData: FormData): Promise<SubcategoryResult> {
  const { db } = await requireStoreContext()
  const body = {
    category_id: formData.get("category_id") as string,
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    sort_order: parseInt((formData.get("sort_order") as string) || "0"),
    is_active: formData.get("is_active") === "true",
  }

  // Excluir la propia fila: un slug sin cambios debe pasar intacto.
  body.slug = await ensureUniqueSlug(db, "subcategories", body.slug, body.name, id)

  try {
    await db.db.update(subcategories).set(db.safe(body)).where(db.where(subcategories, eq(subcategories.id, id)))
  } catch (err) {
    return { error: describeWriteError(err, "una subcategoría", body.slug, "No pudimos guardar la subcategoría. Probá de nuevo.") }
  }

  revalidatePath("/panel/subcategorias")
  revalidatePath(`/panel/subcategorias/${id}`)
  return { success: true, id, slug: body.slug }
}

export async function deleteSubcategory(id: string) {
  const { db } = await requireStoreContext()
  try {
    await db.db.delete(subcategories).where(db.where(subcategories, eq(subcategories.id, id)))
  } catch (err) {
    console.error("[subcategorias] no se pudo eliminar", err)
    return { error: "No pudimos eliminar la subcategoría. Probá de nuevo." }
  }

  revalidatePath("/panel/subcategorias")
  return { success: true }
}
