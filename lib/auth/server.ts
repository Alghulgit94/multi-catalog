import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { getDb, schema } from "../db"
import { sendEmail } from "../email"

/**
 * Better Auth: usuarios y sesiones en tablas propias de la misma base D1.
 * Las tablas están definidas en db/schema.ts (user, session, account, verification).
 */
export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "sqlite",
    schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  user: {
    additionalFields: {
      // Marca de superadmin. No se puede setear desde el cliente.
      isSuperadmin: { type: "boolean", defaultValue: false, input: false },
    },
  },

  emailAndPassword: {
    enabled: true,
    // El comercio entra al panel apenas se registra; el email verificado es un
    // paso del checklist de verificación de la tienda, no un bloqueo de login.
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Recuperá tu contraseña",
        html: `<p>Hacé clic para elegir una contraseña nueva:</p><p><a href="${url}">${url}</a></p>`,
      })
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verificá tu email",
        html: `<p>Confirmá tu email para continuar:</p><p><a href="${url}">${url}</a></p>`,
      })
    },
  },

  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},

  // Control de intentos contra fuerza bruta.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },

  plugins: [nextCookies()],
})
