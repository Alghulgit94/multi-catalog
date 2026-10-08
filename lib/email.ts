/**
 * Envío de emails transaccionales (verificación, recuperación, avisos).
 * Usa Resend por HTTP. Sin RESEND_API_KEY (desarrollo) imprime el email en consola.
 * Para otro proveedor (Brevo, etc.) solo hay que cambiar esta función.
 */

import { PLATFORM_NAME } from "./catalog-config"

interface EmailInput {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? `${PLATFORM_NAME} <onboarding@resend.dev>`

  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY no configurada. Email a ${to}: ${subject}\n${html}`)
    return
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!res.ok) {
    throw new Error(`No se pudo enviar el email (${res.status}): ${await res.text().catch(() => "")}`)
  }
}
