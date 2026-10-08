import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { StoreProvider } from "@/components/catalog/store-provider"
import { getPublicStore } from "@/lib/data/stores"
import { PLATFORM_NAME } from "@/lib/catalog-config"
import "./catalog.css"

const inter = Inter({ subsets: ["latin"] })

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ store: string }>
}

export async function generateMetadata({ params }: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { store: slug } = await params
  const store = await getPublicStore(slug)

  if (!store) {
    return { title: `Tienda no disponible — ${PLATFORM_NAME}`, robots: { index: false, follow: false } }
  }

  const description = store.heroSubtitle || store.tagline || `Catálogo de ${store.name}. Consultanos por WhatsApp.`
  return {
    title: { default: `${store.name} — Catálogo`, template: `%s | ${store.name}` },
    description,
    // Solo las tiendas verificadas se indexan en Google.
    robots: store.indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: store.name,
      title: store.name,
      description,
      images: store.logoUrl ? [{ url: store.logoUrl, alt: store.name }] : undefined,
    },
  }
}

export default async function CatalogLayout({ children, params }: LayoutProps) {
  const { store: slug } = await params
  const store = await getPublicStore(slug)

  if (!store) {
    return (
      <div className={inter.className}>
        <main className="store-unavailable">
          <h1 className="store-unavailable__title">Tienda no disponible</h1>
          <p className="store-unavailable__text">
            Esta tienda no existe o no está disponible en este momento.
          </p>
        </main>
      </div>
    )
  }

  const brandStyle = store.primaryColor
    ? ({ "--primary": store.primaryColor } as React.CSSProperties)
    : undefined

  return (
    <div className={inter.className} style={brandStyle}>
      <StoreProvider slug={store.slug}>{children}</StoreProvider>
    </div>
  )
}
