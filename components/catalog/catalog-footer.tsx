import type { PublicStore } from "@/lib/store-types"
import type { CatalogCategory } from "@/lib/catalog-types"
import { buildStoreWhatsAppLink } from "@/lib/catalog-helpers"
import { storeCatalogPath, storeHomePath } from "@/lib/store-links"

interface CatalogFooterProps {
  store: PublicStore
  /** Categorías reales de la tienda; el footer muestra las primeras. */
  categories: CatalogCategory[]
}

const FOOTER_CATEGORY_LIMIT = 5

export function CatalogFooter({ store, categories }: CatalogFooterProps) {
  const waHref = buildStoreWhatsAppLink(store)
  const location = [store.address, store.city].filter(Boolean).join(", ")

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand-name">{store.name}</div>
            {store.tagline && <p className="footer__brand-desc">{store.tagline}</p>}
          </div>

          <div>
            <p className="footer__col-title">Navegación</p>
            <ul className="footer__links">
              <li><a href={storeHomePath(store.slug)} className="footer__link">Inicio</a></li>
              <li><a href={storeCatalogPath(store.slug)} className="footer__link">Catálogo</a></li>
              <li>
                <a href={storeCatalogPath(store.slug, { category: "Destacados" })} className="footer__link">
                  Destacados
                </a>
              </li>
            </ul>
          </div>

          {categories.length > 0 && (
            <div>
              <p className="footer__col-title">Categorías</p>
              <ul className="footer__links">
                {categories.slice(0, FOOTER_CATEGORY_LIMIT).map((cat) => (
                  <li key={cat.id}>
                    <a href={storeCatalogPath(store.slug, { category: cat.name })} className="footer__link">
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(location || waHref || store.email) && (
            <div>
              <p className="footer__col-title">Contacto</p>
              {location && (
                <div className="footer__contact-item">
                  <span>📍</span>
                  <span>{location}</span>
                </div>
              )}
              {waHref && (
                <div className="footer__contact-item">
                  <span>📱</span>
                  <a href={waHref} className="footer__link" target="_blank" rel="noopener noreferrer">
                    +{store.whatsapp}
                  </a>
                </div>
              )}
              {store.email && (
                <div className="footer__contact-item">
                  <span>✉️</span>
                  <a href={`mailto:${store.email}`} className="footer__link">
                    {store.email}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
