import { requireStoreContext } from "@/lib/auth/session"
import { getCategories, getSubcategories } from "@/lib/data/panel"
import { ProductoForm } from "../producto-form"

export default async function NuevoProductoPage() {
  await requireStoreContext()

  const [categories, subcategories] = await Promise.all([
    getCategories(),
    getSubcategories(),
  ])

  return (
    <div>
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-semibold text-foreground">Nuevo Producto</h1>
        <p className="text-sm text-muted-foreground mt-1">Agregar un nuevo producto al catálogo</p>
      </div>
      <ProductoForm categories={categories} subcategories={subcategories} />
    </div>
  )
}
