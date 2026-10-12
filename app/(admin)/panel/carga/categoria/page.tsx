import { requireStoreContext } from "@/lib/auth/session"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { CategoriaForm } from "../../categorias/categoria-form"

export default async function CargaCategoriaPage() {
  await requireStoreContext()

  return (
    <PageContainer size="form">
      <PageHeader
        title="Nueva categoría"
        breadcrumb={[{ label: "Carga" }, { label: "Categoría" }]}
        description="Las categorías ordenan los productos de tu catálogo."
        className="mb-6"
      />
      <CategoriaForm />
    </PageContainer>
  )
}
