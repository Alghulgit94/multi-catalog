import { requireStoreContext } from "@/lib/auth/session"
import { getProducts, getCategories } from "@/lib/data/panel"
import { ProductosPageClient } from "./productos-page-client"

export default async function ProductosPage() {
  await requireStoreContext()

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return <ProductosPageClient products={products} categories={categories} />
}
