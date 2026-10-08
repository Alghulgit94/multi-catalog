import { requireStoreContext } from "@/lib/auth/session"
import { getCategories } from "@/lib/data/panel"
import { CategoriasPageClient } from "./categorias-page-client"

export default async function CategoriasPage() {
  await requireStoreContext()

  const categories = await getCategories()

  return <CategoriasPageClient categories={categories} />
}
