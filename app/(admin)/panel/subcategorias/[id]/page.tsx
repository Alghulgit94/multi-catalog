import { notFound } from "next/navigation"
import { requireStoreContext } from "@/lib/auth/session"
import { getSubcategory, getCategories } from "@/lib/data/panel"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { SubcategoryForm } from "../subcategory-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarSubcategoryPage({ params }: Props) {
  await requireStoreContext()

  const { id } = await params
  const [subcategory, categories] = await Promise.all([getSubcategory(id), getCategories()])

  if (!subcategory) notFound()

  return (
    <PageContainer size="form">
      <PageHeader
        title={subcategory.name}
        back="/panel/subcategorias"
        breadcrumb={[{ label: "Subcategorías", href: "/panel/subcategorias" }, { label: "Editar" }]}
        className="mb-6"
      />
      <SubcategoryForm subcategory={subcategory} categories={categories} />
    </PageContainer>
  )
}
