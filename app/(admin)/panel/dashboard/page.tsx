import { requireStoreContext } from "@/lib/auth/session"
import Link from "next/link"
import { getDashboardStats, getProducts, getCategories } from "@/lib/data/panel"
import { Package, FolderOpen, ImageOff, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductosPageClient } from "../productos/productos-page-client"

export default async function DashboardPage() {
  const { user } = await requireStoreContext()

  const [stats, products, categories] = await Promise.all([
    getDashboardStats(),
    getProducts(),
    getCategories(),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenido, {user.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Productos</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalProducts}</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-secondary/30 p-2">
              <FolderOpen className="h-5 w-5 text-secondary-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Categorías</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalCategories}</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-destructive/10 p-2">
              <ImageOff className="h-5 w-5 text-destructive" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Sin imagen</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.noImage}</p>
          {stats.noImage > 0 && (
            <p className="text-xs text-destructive mt-1">Requieren atención</p>
          )}
        </div>
      </div>

      {/* Products table */}
      <ProductosPageClient
        products={products}
        categories={categories}
        extraActions={
          <Button variant="outline" asChild>
            <Link href="/panel/categorias/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Link>
          </Button>
        }
      />
    </div>
  )
}
