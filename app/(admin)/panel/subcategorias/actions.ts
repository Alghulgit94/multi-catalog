"use server"

import { revalidatePath } from "next/cache"
import { requireStoreContext } from "@/lib/auth/session"
import { ensureUniqueSlug, describeWriteError } from "@/lib/slug-server"

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

  const res = await db.insert("subcategories", body)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { error: describeWriteError(err, "una subcategoría", body.slug, "Error al crear subcategoría") }
  }

  const rows = await res.json()
  revalidatePath("/panel/subcategorias")
  return { success: true, id: rows[0]?.id, slug: rows[0]?.slug ?? body.slug }
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

  const res = await db.update("subcategories", `id=eq.${id}`, body)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { error: describeWriteError(err, "una subcategoría", body.slug, "Error al actualizar subcategoría") }
  }

  revalidatePath("/panel/subcategorias")
  revalidatePath(`/panel/subcategorias/${id}`)
  return { success: true, id, slug: body.slug }
}

export async function deleteSubcategory(id: string) {
  const { db } = await requireStoreContext()
  const res = await db.remove("subcategories", `id=eq.${id}`)

  if (!res.ok) {
    return { error: "Error al eliminar subcategoría" }
  }

  revalidatePath("/panel/subcategorias")
  return { success: true }
}
