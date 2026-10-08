import { requireSuperadmin } from "@/lib/auth/session"

// Paso 7 de la etapa 1: panel de superadmin (cola de revision, tiendas, historial).
export default async function AdminPage() {
  await requireSuperadmin()
  return (
    <main style={{ maxWidth: 720, margin: "10vh auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Superadmin</h1>
      <p style={{ marginTop: 12 }}>La cola de revision de tiendas estara disponible proximamente.</p>
    </main>
  )
}
