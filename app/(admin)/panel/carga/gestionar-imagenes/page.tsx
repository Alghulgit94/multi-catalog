import { requireStoreContext } from "@/lib/auth/session"
import { getProducts, getCategories } from "@/lib/data/panel"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { SECCION_ICONOS } from "@/components/panel/nav"
import { ImageManager } from "./_components/image-manager"

export default async function GestionarImagenesPage() {
  await requireStoreContext()

  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <PageContainer className="pb-0 sm:pb-0">
      <PageHeader
        title="Fotos de productos"
        icon={SECCION_ICONOS.fotos}
        breadcrumb={[{ label: "Carga" }, { label: "Fotos de productos" }]}
        description="Elegí un producto y cargale la portada y la galería."
      />
      <ImageManager products={products} categories={categories} />
    </PageContainer>
  )
}
