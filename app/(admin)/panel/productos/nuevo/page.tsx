import { requireStoreContext } from "@/lib/auth/session"
import { getCategories, getSubcategories } from "@/lib/data/panel"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { ProductoForm } from "../producto-form"

export default async function NuevoProductoPage() {
  await requireStoreContext()

  const [categories, subcategories] = await Promise.all([getCategories(), getSubcategories()])

  return (
    <PageContainer size="form">
      <PageHeader
        title="Nuevo producto"
        back="/panel/productos"
        breadcrumb={[{ label: "Productos", href: "/panel/productos" }, { label: "Nuevo producto" }]}
        className="mb-6"
      />
      <ProductoForm categories={categories} subcategories={subcategories} />
    </PageContainer>
  )
}
