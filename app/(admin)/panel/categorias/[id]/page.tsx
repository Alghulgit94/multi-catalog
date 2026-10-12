import { notFound } from "next/navigation"
import { requireStoreContext } from "@/lib/auth/session"
import { getCategory } from "@/lib/data/panel"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { CategoriaForm } from "../categoria-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarCategoriaPage({ params }: Props) {
  await requireStoreContext()

  const { id } = await params
  const category = await getCategory(id)
  if (!category) notFound()

  return (
    <PageContainer size="form">
      <PageHeader
        title={category.name}
        back="/panel/categorias"
        breadcrumb={[{ label: "Categorías", href: "/panel/categorias" }, { label: "Editar" }]}
        className="mb-6"
      />
      <CategoriaForm category={category} />
    </PageContainer>
  )
}
