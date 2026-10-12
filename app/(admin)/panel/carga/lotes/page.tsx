import { CheckCircle2 } from "lucide-react"
import { requireStoreContext } from "@/lib/auth/session"
import { FormSection } from "@/components/panel/form-section"
import { PageContainer, PageHeader } from "@/components/panel/page-header"
import { StatusBadge } from "@/components/panel/status-badge"
import { SECCION_ICONOS } from "@/components/panel/nav"
import { CargaForm } from "../_components/carga-form"

const CONSEJOS = [
  "Usá la plantilla con el formato correcto",
  "Revisá los códigos (SKU) antes de cargar",
  "Subí las fotos desde el panel antes de cargar el lote",
]

export default async function CargaLotesPage() {
  await requireStoreContext()

  return (
    <PageContainer size="form">
      <PageHeader
        title="Carga por lotes"
        icon={SECCION_ICONOS.lotes}
        breadcrumb={[{ label: "Carga" }, { label: "Carga por lotes" }]}
        description="Subí muchos productos juntos desde una planilla."
        actions={<StatusBadge tone="aviso">En preparación</StatusBadge>}
      />

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <FormSection title="Nueva planilla" description="Elegí el período y el archivo.">
          <CargaForm />
        </FormSection>

        <FormSection title="Antes de cargar">
          <ul className="flex flex-col gap-3">
            {CONSEJOS.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm text-texto-secundario">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-nanduti-verde" strokeWidth={1.75} />
                {tip}
              </li>
            ))}
          </ul>
        </FormSection>
      </div>
    </PageContainer>
  )
}
