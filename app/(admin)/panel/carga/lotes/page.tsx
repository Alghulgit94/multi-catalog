import { requireStoreContext } from "@/lib/auth/session"
import { CargaForm } from "../_components/carga-form"

export default async function CargaLotesPage() {
  await requireStoreContext()

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Carga</p>
        <h1 className="text-2xl font-bold text-foreground">Carga en Lotes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sube el catálogo del mes para actualizar los productos en el sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Upload form card */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-border">
            <h2 className="text-base font-semibold text-foreground mb-1">Nuevo catálogo</h2>
            <p className="text-xs text-muted-foreground mb-5">
              Selecciona el período y carga el archivo correspondiente
            </p>
            <CargaForm />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Total productos stat */}
          <div className="rounded-xl bg-primary p-5 text-white shadow-sm">
            <p className="text-xs font-medium text-white/70 mb-1">Total Productos</p>
            <p className="text-3xl font-bold">—</p>
            <p className="text-[11px] text-white/60 mt-2">Actualizado con el último catálogo</p>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl bg-white p-5 border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-3">Recomendaciones</h3>
            <ul className="flex flex-col gap-2">
              {[
                "Usa el formato de plantilla oficial",
                "Verifica los códigos SKU antes de cargar",
                "Las imágenes deben estar en Cloudinary",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 shrink-0">
                    check_circle
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Template download */}
          <div className="rounded-xl bg-foreground p-5 text-white shadow-sm">
            <h3 className="text-sm font-semibold mb-1">¿Necesitas una plantilla?</h3>
            <p className="text-[11px] text-white/60 mb-3">
              Descarga la plantilla oficial con el formato correcto para la carga de catálogos.
            </p>
            <button className="w-full rounded-lg bg-white/10 hover:bg-white/20 transition-colors py-2 text-xs font-medium text-white">
              Descargar plantilla .xlsx
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
