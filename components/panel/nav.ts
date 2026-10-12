import {
  FolderTree,
  Home,
  ImageUp,
  Layers,
  Package,
  Tags,
  Upload,
  type LucideIcon,
} from "lucide-react"

export interface NavChild {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Rutas que marcan el ítem como activo además de `href`. */
  match?: string[]
  children?: NavChild[]
}

/** Navegación del panel del comercio. Único lugar donde se definen las secciones. */
export const PANEL_NAV: NavItem[] = [
  { label: "Inicio", href: "/panel/dashboard", icon: Home },
  {
    label: "Productos",
    href: "/panel/productos",
    icon: Package,
    match: ["/panel/categorias", "/panel/subcategorias"],
    children: [
      { label: "Categorías", href: "/panel/categorias" },
      { label: "Subcategorías", href: "/panel/subcategorias" },
    ],
  },
  {
    label: "Carga",
    href: "/panel/carga/producto",
    icon: Upload,
    match: ["/panel/carga"],
    children: [
      { label: "Producto", href: "/panel/carga/producto" },
      { label: "Categoría", href: "/panel/carga/categoria" },
      { label: "Subcategoría", href: "/panel/carga/subcategoria" },
      { label: "Carga por lotes", href: "/panel/carga/lotes" },
      { label: "Fotos de productos", href: "/panel/carga/gestionar-imagenes" },
    ],
  },
]

/** Íconos por sección, para encabezados de página (PageHeader). */
export const SECCION_ICONOS = {
  inicio: Home,
  productos: Package,
  categorias: FolderTree,
  subcategorias: Tags,
  carga: Upload,
  lotes: Layers,
  fotos: ImageUp,
} satisfies Record<string, LucideIcon>

export function isActive(pathname: string, href: string, match: string[] = []) {
  return [href, ...match].some((p) => pathname === p || pathname.startsWith(`${p}/`))
}
