import { requireStoreContext } from "@/lib/auth/session"
import { CategoriaForm } from "../../categorias/categoria-form"

export default async function CargaCategoriaPage() {
  await requireStoreContext()

  return (
    <div>
      <div className="px-8 pt-8 pb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Carga</p>
        <h1 className="text-2xl font-semibold text-foreground">Nueva Categoría</h1>
        <p className="text-sm text-muted-foreground mt-1">Crea una nueva categoría de productos</p>
      </div>
      <CategoriaForm />
    </div>
  )
}
