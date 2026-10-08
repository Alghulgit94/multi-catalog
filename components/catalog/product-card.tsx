import type { CatalogProduct } from "@/lib/catalog-types"
import type { PublicStore } from "@/lib/store-types"
import { generateWhatsAppLink, formatPrice } from "@/lib/catalog-helpers"
import { storeProductPath } from "@/lib/store-links"
import { getSiteUrl } from "@/lib/site-url"
import { WhatsappIcon } from "./whatsapp-icon"

interface ProductCardProps {
  product: CatalogProduct
  store: PublicStore
}

export async function ProductCard({ product, store }: ProductCardProps) {
  const detailHref = storeProductPath(store.slug, product.slug)
  const waLink = generateWhatsAppLink(product, store, await getSiteUrl())
  const categoryName = product.category ? product.category.name : ""

  return (
    <article className="product-card">
      <a href={detailHref} className="product-card__image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.coverImage}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />
        {product.featured && (
          <span className="product-card__badge">Destacado</span>
        )}
      </a>
      <div className="product-card__body">
        <span className="product-card__category">{categoryName}</span>
        <h3 className="product-card__name">{product.name}</h3>
        {product.showPrice && product.price ? (
          <p className="product-card__price">{formatPrice(product.price, store)}</p>
        ) : null}
      </div>
      <div className="product-card__footer">
        <a href={detailHref} className="product-card__link">
          Ver detalle
        </a>
        {waLink && (
          <a
            href={waLink}
            className="product-card__whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappIcon /> Consultar
          </a>
        )}
      </div>
    </article>
  )
}
