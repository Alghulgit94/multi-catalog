import { requireStoreContext } from "@/lib/auth/session"
import { getCategories } from "@/lib/data/panel"
import { SubcategoryForm } from "../subcategory-form"

export default async function NuevaSubcategoryPage() {
  await requireStoreContext()

  const categories = await getCategories()

  return (
    <div>
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-semibold text-foreground">Nueva Subcategoría</h1>
        <p className="text-sm text-muted-foreground mt-1">Crear una nueva subcategoría de productos</p>
      </div>
      <SubcategoryForm categories={categories} />
    </div>
  )
}
