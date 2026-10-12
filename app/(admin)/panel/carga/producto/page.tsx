import { requireStoreContext } from "@/lib/auth/session"
import { getCategories, getSubcategories } from "@/lib/data/panel"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { ProductoForm } from "../../productos/producto-form"

export default async function CargaProductoPage() {
  await requireStoreContext()

  const [categories, subcategories] = await Promise.all([getCategories(), getSubcategories()])

  return (
    <PageContainer size="form">
      <PageHeader
        title="Nuevo producto"
        breadcrumb={[{ label: "Carga" }, { label: "Producto" }]}
        description="Cargá un producto a tu catálogo."
        className="mb-6"
      />
      <ProductoForm categories={categories} subcategories={subcategories} />
    </PageContainer>
  )
}
