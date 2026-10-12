import { requireStoreContext } from "@/lib/auth/session"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { CategoriaForm } from "../categoria-form"

export default async function NuevaCategoriaPage() {
  await requireStoreContext()

  return (
    <PageContainer size="form">
      <PageHeader
        title="Nueva categoría"
        back="/panel/categorias"
        breadcrumb={[{ label: "Categorías", href: "/panel/categorias" }, { label: "Nueva categoría" }]}
        className="mb-6"
      />
      <CategoriaForm />
    </PageContainer>
  )
}
