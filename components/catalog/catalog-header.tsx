import type { PublicStore } from "@/lib/store-types"
import { buildStoreWhatsAppLink } from "@/lib/catalog-helpers"
import { storeCatalogPath, storeHomePath } from "@/lib/store-links"
import { WhatsappIcon } from "./whatsapp-icon"
import { MobileMenu } from "./mobile-menu"
import { HeaderSearch } from "./header-search"

interface CatalogHeaderProps {
  store: PublicStore
  activePage?: "home" | "catalog" | "product"
}

export function CatalogHeader({ store, activePage = "home" }: CatalogHeaderProps) {
  const waHref = buildStoreWhatsAppLink(store)

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header__inner">
            <a href={storeHomePath(store.slug)} className="header__logo">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={store.logoUrl} alt={store.name} className="header__logo-img" />
              ) : (
                <span className="header__logo-text">{store.name}</span>
              )}
            </a>

            <nav className="header__nav" aria-label="Navegación principal">
              <a
                href={storeHomePath(store.slug)}
                className={`header__nav-link${activePage === "home" ? " header__nav-link--active" : ""}`}
              >
                Inicio
              </a>
              <a
                href={storeCatalogPath(store.slug)}
                className={`header__nav-link${activePage === "catalog" || activePage === "product" ? " header__nav-link--active" : ""}`}
              >
                Catálogo
              </a>
              <a href={storeCatalogPath(store.slug, { category: "Destacados" })} className="header__nav-link">
                Destacados
              </a>
            </nav>

            <HeaderSearch activePage={activePage} />

            {waHref && (
              <a
                href={waHref}
                className="btn btn--whatsapp btn--sm header__cta"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
              >
                <WhatsappIcon />
                WhatsApp
              </a>
            )}

            <button className="header__menu-btn" id="menu-btn" aria-label="Abrir menú">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu whatsappHref={waHref} />
    </>
  )
}
