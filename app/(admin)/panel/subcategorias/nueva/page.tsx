import { requireStoreContext } from "@/lib/auth/session"
import { getCategories } from "@/lib/data/panel"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { SubcategoryForm } from "../subcategory-form"

export default async function NuevaSubcategoryPage() {
  await requireStoreContext()

  const categories = await getCategories()

  return (
    <PageContainer size="form">
      <PageHeader
        title="Nueva subcategoría"
        back="/panel/subcategorias"
        breadcrumb={[{ label: "Subcategorías", href: "/panel/subcategorias" }, { label: "Nueva subcategoría" }]}
        className="mb-6"
      />
      <SubcategoryForm categories={categories} />
    </PageContainer>
  )
}
