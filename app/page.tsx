import Link from "next/link"
import { PLATFORM_NAME } from "@/lib/catalog-config"

// Web de venta de la plataforma: pendiente de diseno. Por ahora, acceso a los comercios.
export default function PlatformHomePage() {
  return (
    <main style={{ maxWidth: 560, margin: "20vh auto", padding: "0 16px", textAlign: "center" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>{PLATFORM_NAME}</h1>
      <p style={{ marginTop: 12, color: "#64748b" }}>
        Creá el catálogo de tu comercio y compartilo por WhatsApp.
      </p>
      <p style={{ marginTop: 24, display: "flex", gap: 16, justifyContent: "center" }}>
        <Link href="/registro" style={{ textDecoration: "underline" }}>Registrar mi tienda</Link>
        <Link href="/login" style={{ textDecoration: "underline" }}>Ingresar</Link>
      </p>
    </main>
  )
}
