import { requireStoreContext } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getCategory } from "@/lib/data/panel"
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
    <div>
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-semibold text-foreground">Editar Categoría</h1>
        <p className="text-sm text-muted-foreground mt-1">{category.name}</p>
      </div>
      <CategoriaForm category={category} />
    </div>
  )
}
