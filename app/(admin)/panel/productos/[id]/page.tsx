import { requireStoreContext } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getProduct, getCategories, getSubcategories } from "@/lib/data/panel"
import { ProductoForm } from "../producto-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: Props) {
  await requireStoreContext()

  const { id } = await params
  const [product, categories, subcategories] = await Promise.all([
    getProduct(id),
    getCategories(),
    getSubcategories(),
  ])

  if (!product) notFound()

  return (
    <div>
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-semibold text-foreground">Editar Producto</h1>
        <p className="text-sm text-muted-foreground mt-1">{product.name}</p>
      </div>
      <ProductoForm product={product} categories={categories} subcategories={subcategories} />
    </div>
  )
}
