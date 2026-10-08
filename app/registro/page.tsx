import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Registro", robots: { index: false, follow: false } }

// Paso 4 de la etapa 1: formulario de registro con elección del nombre de
// tienda (validateStoreSlug en lib/reserved-slugs.ts) y creación de la tienda.
export default function RegistroPage() {
  return (
    <main style={{ maxWidth: 480, margin: "15vh auto", padding: "0 16px", textAlign: "center" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Registro</h1>
      <p style={{ marginTop: 12, color: "#64748b" }}>El registro de nuevas tiendas estará disponible próximamente.</p>
      <p style={{ marginTop: 24 }}>
        <Link href="/login" style={{ textDecoration: "underline" }}>Ir a ingresar</Link>
      </p>
    </main>
  )
}
