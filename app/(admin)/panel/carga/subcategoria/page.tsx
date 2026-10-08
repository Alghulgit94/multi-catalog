import { requireStoreContext } from "@/lib/auth/session"
import { getCategories } from "@/lib/data/panel"
import { SubcategoryForm } from "../../subcategorias/subcategory-form"

export default async function CargaSubcategoryPage() {
  await requireStoreContext()

  const categories = await getCategories()

  return (
    <div>
      <div className="px-8 pt-8 pb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Carga</p>
        <h1 className="text-2xl font-semibold text-foreground">Nueva Subcategoría</h1>
        <p className="text-sm text-muted-foreground mt-1">Crea una nueva subcategoría dentro de una categoría</p>
      </div>
      <SubcategoryForm categories={categories} />
    </div>
  )
}
