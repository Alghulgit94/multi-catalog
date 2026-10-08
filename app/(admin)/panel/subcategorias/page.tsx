import { requireStoreContext } from "@/lib/auth/session"
import { getSubcategories } from "@/lib/data/panel"
import { getCategories } from "@/lib/data/panel"
import { SubcategoriesPageClient } from "./subcategories-page-client"

export default async function SubcategoriesPage() {
  await requireStoreContext()

  const [subcategories, categories] = await Promise.all([
    getSubcategories(),
    getCategories(),
  ])

  return <SubcategoriesPageClient subcategories={subcategories} categories={categories} />
}
