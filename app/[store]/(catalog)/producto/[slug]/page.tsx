export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { CatalogFooter } from "@/components/catalog/catalog-footer"
import { ProductCard } from "@/components/catalog/product-card"
import { ProductGallery } from "@/components/catalog/product-gallery"
import { WhatsappFab } from "@/components/catalog/whatsapp-fab"
import { getPublicStore } from "@/lib/data/stores"
import {
  getPublicProductBySlug,
  getPublicRelatedProducts,
  getPublicCategories,
} from "@/lib/data/catalog"
import { generateWhatsAppLink, formatPrice } from "@/lib/catalog-helpers"
import { absoluteStoreUrl, storeCatalogPath, storeHomePath, storeProductPath } from "@/lib/store-links"
import { getSiteUrl } from "@/lib/site-url"
import { OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from "@/lib/media-urls"

interface PageProps {
  params: Promise<{ store: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { store: storeSlug, slug } = await params
  const store = await getPublicStore(storeSlug)
  if (!store) return {}
  const product = await getPublicProductBySlug(store.id, slug)
  if (!product) return { title: "Producto no encontrado" }

  const siteUrl = await getSiteUrl()
  const title = product.name
  const description = product.shortDescription || product.description || undefined

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      type: "website",
      siteName: store.name,
      title,
      description,
      url: absoluteStoreUrl(siteUrl, storeProductPath(store.slug, product.slug)),
      images: product.ogImage
        ? [
            {
              url: product.ogImage,
              width: OG_IMAGE_WIDTH,
              height: OG_IMAGE_HEIGHT,
              type: "image/jpeg",
              alt: product.name,
            },
          ]
        : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { store: storeSlug, slug } = await params
  const store = await getPublicStore(storeSlug)
  if (!store) notFound()
  const product = await getPublicProductBySlug(store.id, slug)

  if (!product) {
    notFound()
  }

  const relatedProducts =
    product.category?.id
      ? await getPublicRelatedProducts(store.id, product.category.id, product.id)
      : []

  const [waLink, categories] = await Promise.all([
    getSiteUrl().then((siteUrl) => generateWhatsAppLink(product, store, siteUrl)),
    getPublicCategories(store.id),
  ])

  return (
    <>
      <CatalogHeader store={store} activePage="product" />

      <main>
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb" aria-label="Navegación de migas de pan" style={{ paddingTop: "32px" }}>
            <a href={storeHomePath(store.slug)} className="breadcrumb__item">Inicio</a>
            <span className="breadcrumb__sep" aria-hidden="true">/</span>
            <a href={storeCatalogPath(store.slug)} className="breadcrumb__item">Catálogo</a>
            <span className="breadcrumb__sep" aria-hidden="true">/</span>
            <span className="breadcrumb__item breadcrumb__item--active" id="breadcrumb-product-name">
              {product.name}
            </span>
          </nav>
        </div>

        {/* Product Detail */}
        <div id="product-detail">
          <div className="container">
            <div className="product-detail__grid" style={{ paddingBottom: "64px" }}>
              {/* Gallery */}
              <div className="product-detail__gallery">
                <ProductGallery
                  images={product.galleryImages}
                  altText={product.name}
                />
              </div>

              {/* Info */}
              <div className="product-detail__info">
                <span className="product-detail__category" id="product-category">
                  {product.category?.name ?? ""}
                </span>
                <h1 className="product-detail__name" id="product-name">
                  {product.name}
                </h1>
                {product.showPrice && product.price ? (
                  <p className="product-detail__price" id="product-price">
                    {formatPrice(product.price, store)}
                  </p>
                ) : null}
                <div className="product-detail__divider" />
                <p className="product-detail__description" id="product-description">
                  {product.description || product.shortDescription || ""}
                </p>

                <div className="product-detail__cta">
                  {waLink && (
                  <a
                    href={waLink}
                    className="btn btn--whatsapp btn--lg"
                    data-whatsapp-link
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Consultar por WhatsApp
                  </a>
                  )}
                  <a href={storeCatalogPath(store.slug)} className="btn btn--outline btn--lg">
                    Ver catálogo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related">
            <div className="container">
              <div className="section-header">
                <h2 className="section-header__title">Productos Relacionados</h2>
                <a href={storeCatalogPath(store.slug)} className="section-header__link">Ver catálogo →</a>
              </div>
              <div className="product-grid" id="related-products">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} store={store} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <CatalogFooter store={store} categories={categories} />
      <WhatsappFab store={store} />
    </>
  )
}
