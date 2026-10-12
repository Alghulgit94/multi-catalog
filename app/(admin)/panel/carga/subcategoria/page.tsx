import { requireStoreContext } from "@/lib/auth/session"
import { getCategories } from "@/lib/data/panel"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { SubcategoryForm } from "../../subcategorias/subcategory-form"

export default async function CargaSubcategoryPage() {
  await requireStoreContext()

  const categories = await getCategories()

  return (
    <PageContainer size="form">
      <PageHeader
        title="Nueva subcategoría"
        breadcrumb={[{ label: "Carga" }, { label: "Subcategoría" }]}
        description="Ordenan los productos dentro de una categoría."
        className="mb-6"
      />
      <SubcategoryForm categories={categories} />
    </PageContainer>
  )
}
