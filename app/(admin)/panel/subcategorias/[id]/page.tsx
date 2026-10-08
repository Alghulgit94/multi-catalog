import { requireStoreContext } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getSubcategory, getCategories } from "@/lib/data/panel"
import { SubcategoryForm } from "../subcategory-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarSubcategoryPage({ params }: Props) {
  await requireStoreContext()

  const { id } = await params
  const [subcategory, categories] = await Promise.all([
    getSubcategory(id),
    getCategories(),
  ])

  if (!subcategory) notFound()

  return (
    <div>
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-semibold text-foreground">Editar Subcategoría</h1>
        <p className="text-sm text-muted-foreground mt-1">{subcategory.name}</p>
      </div>
      <SubcategoryForm subcategory={subcategory} categories={categories} />
    </div>
  )
}
