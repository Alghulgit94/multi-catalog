import { requireStoreContext } from "@/lib/auth/session"
import { getProducts, getCategories } from "@/lib/data/panel"
import { ImageManager } from "./_components/image-manager"

export default async function GestionarImagenesPage() {
  await requireStoreContext()

  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <ImageManager products={products} categories={categories} />
    </div>
  )
}
