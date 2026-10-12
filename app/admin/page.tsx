import type { Metadata } from "next"
import { requireSuperadmin } from "@/lib/auth/session"
import { AdminShell } from "@/components/panel/admin-shell"
import { EmptyState } from "@/components/panel/empty-state"
import { PageContainer, PageHeader } from "@/components/panel/page-header"

export const metadata: Metadata = {
  title: "Superadmin",
  robots: { index: false, follow: false },
}

// Paso 7 de la etapa 1: panel de superadmin (cola de revision, tiendas, historial).
export default async function AdminPage() {
  const user = await requireSuperadmin()
  return (
    <div className="katalo-app font-cuerpo text-tinta antialiased">
      <AdminShell email={user.email}>
        <PageContainer>
          <PageHeader title="Revisión de tiendas" description="Acá vas a aprobar las tiendas nuevas y ver su historial." />
          <EmptyState
            className="mt-6"
            illustration="admin"
            title="Pronto vas a poder revisar las tiendas acá"
            description="La cola de revisión está en preparación. Mientras tanto, las tiendas nuevas quedan activas sin verificar."
          />
        </PageContainer>
      </AdminShell>
    </div>
  )
}
