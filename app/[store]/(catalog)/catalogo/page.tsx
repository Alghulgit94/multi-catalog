export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { CatalogFooter } from "@/components/catalog/catalog-footer"
import { ProductCard } from "@/components/catalog/product-card"
import { FilterPills } from "@/components/catalog/filter-pills"
import { SearchInput } from "@/components/catalog/search-input"
import { WhatsappFab } from "@/components/catalog/whatsapp-fab"
import { notFound } from "next/navigation"
import { getPublicStore } from "@/lib/data/stores"
import { getCatalogData } from "@/lib/data/catalog"
import { storeHomePath } from "@/lib/store-links"
import { getFilteredProducts } from "@/lib/catalog-helpers"

interface PageProps {
  params: Promise<{ store: string }>
  searchParams: Promise<{ category?: string; q?: string; subcategory?: string }>
}

export default async function CatalogPage({ params: routeParams, searchParams }: PageProps) {
  const { store: slug } = await routeParams
  const store = await getPublicStore(slug)
  if (!store) notFound()

  const params = await searchParams
  const currentCategory = params.category ?? "Todos"
  const currentQuery = params.q ?? ""
  const currentSubcategory = params.subcategory ?? ""

  const { products, categories, subcategories } = await getCatalogData(store.id)
  const filtered = getFilteredProducts(currentQuery, currentCategory, products, currentSubcategory)

  return (
    <>
      <CatalogHeader store={store} activePage="catalog" />

      <main>
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb" aria-label="Navegación de migas de pan" style={{ paddingTop: "32px" }}>
            <a href={storeHomePath(store.slug)} className="breadcrumb__item">Inicio</a>
            <span className="breadcrumb__sep" aria-hidden="true">/</span>
            <span className="breadcrumb__item breadcrumb__item--active">Catálogo</span>
          </nav>

          {/* Page header */}
          <div className="page-header">
            <h1 className="page-header__title">Catálogo</h1>
            <p className="page-header__description">Todos los productos de {store.name}.</p>
          </div>

          {/* Search */}
          <Suspense>
            <SearchInput defaultValue={currentQuery} />
          </Suspense>

          {/* Filter pills */}
          <Suspense>
            <FilterPills
              categories={categories}
              currentCategory={currentCategory}
              subcategories={subcategories}
              currentSubcategory={currentSubcategory}
            />
          </Suspense>

          {/* Product grid */}
          <section className="catalog-section" aria-label="Productos">
            <div className="product-grid" id="product-grid">
              {filtered.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                  <h3 className="empty-state__title">Sin resultados</h3>
                  <p className="empty-state__description">
                    No encontramos productos para tu búsqueda. Probá con otro término.
                  </p>
                </div>
              ) : (
                filtered.map((p) => <ProductCard key={p.id} product={p} store={store} />)
              )}
            </div>
          </section>
        </div>
      </main>

      <CatalogFooter store={store} categories={categories} />
      <WhatsappFab store={store} />
    </>
  )
}
