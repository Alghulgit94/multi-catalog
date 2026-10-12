import { notFound } from "next/navigation"
import { requireStoreContext } from "@/lib/auth/session"
import { getProduct, getCategories, getSubcategories } from "@/lib/data/panel"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { ProductoForm } from "../producto-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: Props) {
  await requireStoreContext()

  const { id } = await params
  const [product, categories, subcategories] = await Promise.all([
    getProduct(id),
    getCategories(),
    getSubcategories(),
  ])

  if (!product) notFound()

  return (
    <PageContainer size="form">
      <PageHeader
        title={product.name}
        back="/panel/productos"
        breadcrumb={[{ label: "Productos", href: "/panel/productos" }, { label: "Editar" }]}
        className="mb-6"
      />
      <ProductoForm product={product} categories={categories} subcategories={subcategories} />
    </PageContainer>
  )
}
