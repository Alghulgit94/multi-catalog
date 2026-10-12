import Link from "next/link"
import { Check, FolderTree, ImageOff, Package, Plus, type LucideIcon } from "lucide-react"
import { requireStoreContext } from "@/lib/auth/session"
import { getDashboardStats, getRecentProducts } from "@/lib/data/panel"
import { getSiteUrl } from "@/lib/site-url"
import { absoluteStoreUrl, storeHomePath } from "@/lib/store-links"
import { toAssetVersion } from "@/lib/types-catalog"
import { buildImageUrl } from "@/lib/media-urls"
import { formatoGs } from "@/config/planes"
import { Button } from "@/components/ui/button"
import { CopyLink } from "@/components/panel/copy-link"
import { DataTable, Td, Thumb, Tr } from "@/components/panel/data-table"
import { PageContainer } from "@/components/panel/page-header"
import { StatCard } from "@/components/panel/stat-card"
import { StatusBadge } from "@/components/panel/status-badge"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
  const { store } = await requireStoreContext()

  const [stats, recientes, origin] = await Promise.all([getDashboardStats(), getRecentProducts(5), getSiteUrl()])
  const linkCatalogo = absoluteStoreUrl(origin, storeHomePath(store.slug))

  const pasos: Paso[] = [
    {
      titulo: "Cargá tu primer producto",
      texto: "Con un nombre, una foto y el precio alcanza para empezar.",
      hecho: stats.totalProducts > 0,
      href: "/panel/productos/nuevo",
      cta: "Agregar producto",
      icono: Package,
    },
    {
      titulo: "Ordená en categorías",
      texto: "Así tus clientes encuentran rápido lo que buscan.",
      hecho: stats.totalCategories > 0,
      href: "/panel/categorias/nueva",
      cta: "Crear categoría",
      icono: FolderTree,
    },
    {
      titulo: "Sumá fotos a todo",
      texto: "Los productos con foto reciben más consultas.",
      hecho: stats.totalProducts > 0 && stats.noImage === 0,
      href: "/panel/carga/gestionar-imagenes",
      cta: "Agregar fotos",
      icono: ImageOff,
    },
  ]
  const hechos = pasos.filter((p) => p.hecho).length

  return (
    <PageContainer>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-texto-secundario">Inicio</p>
        <h1 className="font-titulos text-[28px] leading-tight font-bold tracking-[-0.02em] text-tinta sm:text-[32px]">
          Hola, {store.name}
        </h1>
      </div>

      {/* Link del catálogo */}
      <section className="mt-6 rounded-[16px] border border-linea p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-titulos text-lg font-semibold text-tinta">Tu catálogo está en línea</h2>
            <p className="mt-1 text-sm text-texto-secundario">Compartí este link por WhatsApp, Instagram o donde quieras.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-[520px]">
            <div className="min-w-0 flex-1">
              <CopyLink url={linkCatalogo} />
            </div>
            <Button variant="outline" asChild>
              <a href={storeHomePath(store.slug)} target="_blank" rel="noreferrer">
                Ver catálogo
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Primeros pasos */}
      {hechos < pasos.length && (
        <section className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-titulos text-lg font-semibold text-tinta">Primeros pasos</h2>
            <p className="text-sm text-texto-secundario">
              {hechos} de {pasos.length} listos
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {pasos.map((p) => (
              <PasoCard key={p.titulo} paso={p} />
            ))}
          </div>
        </section>
      )}

      {/* Métricas */}
      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Productos" value={stats.totalProducts} icon={Package} accent="primario" href="/panel/productos" />
        <StatCard label="Categorías" value={stats.totalCategories} icon={FolderTree} accent="verde" href="/panel/categorias" />
        <StatCard
          label="Sin foto"
          value={stats.noImage}
          icon={ImageOff}
          accent={stats.noImage > 0 ? "fucsia" : "amarillo"}
          hint={stats.noImage > 0 ? "Sumales una foto para que se vendan mejor." : "Todos tus productos tienen foto."}
          href={stats.noImage > 0 ? "/panel/carga/gestionar-imagenes" : undefined}
        />
      </section>

      {/* Recientes */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-titulos text-lg font-semibold text-tinta">Últimos cambios</h2>
          {recientes.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/panel/productos">Ver todos</Link>
            </Button>
          )}
        </div>
        {recientes.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-[16px] border border-dashed border-linea p-6">
            <p className="text-sm text-texto-secundario">Todavía no cargaste productos.</p>
            <Button asChild>
              <Link href="/panel/productos/nuevo">
                <Plus /> Agregar producto
              </Link>
            </Button>
          </div>
        ) : (
          <DataTable>
            <tbody>
              {recientes.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    <Link href={`/panel/productos/${p.id}`} className="flex items-center gap-3">
                      <Thumb
                        src={p.cover_image ? buildImageUrl(p.cover_image, 80, toAssetVersion(p.updated_at)) : null}
                        alt={p.name}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold hover:underline">{p.name}</span>
                        <span className="block truncate text-xs text-texto-secundario">{p.categories?.name ?? "Sin categoría"}</span>
                      </span>
                    </Link>
                  </Td>
                  <Td className="hidden whitespace-nowrap text-texto-secundario sm:table-cell">
                    {p.price != null ? formatoGs(p.price) : "Sin precio"}
                  </Td>
                  <Td className="text-right">
                    <StatusBadge tone={p.is_active ? "exito" : "neutro"}>{p.is_active ? "Activo" : "Inactivo"}</StatusBadge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </section>
    </PageContainer>
  )
}

interface Paso {
  titulo: string
  texto: string
  hecho: boolean
  href: string
  cta: string
  icono: LucideIcon
}

function PasoCard({ paso }: { paso: Paso }) {
  const Icono = paso.icono
  return (
    <div
      className={cn(
        "flex flex-col rounded-[16px] border p-5",
        paso.hecho ? "border-linea bg-fondo-alterno/60" : "border-linea bg-white"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            paso.hecho ? "bg-nanduti-verde text-white" : "bg-fondo-alterno text-tinta"
          )}
        >
          {paso.hecho ? <Check className="size-4" strokeWidth={2.5} /> : <Icono className="size-[18px]" strokeWidth={1.5} />}
        </span>
        <h3 className={cn("font-semibold", paso.hecho ? "text-texto-secundario line-through" : "text-tinta")}>{paso.titulo}</h3>
      </div>
      <p className="mt-2 flex-1 text-sm text-texto-secundario">{paso.texto}</p>
      {!paso.hecho && (
        <Button variant="outline" size="sm" className="mt-4 self-start" asChild>
          <Link href={paso.href}>{paso.cta}</Link>
        </Button>
      )}
    </div>
  )
}
