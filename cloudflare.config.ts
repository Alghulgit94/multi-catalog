import { bindings, defineConfig, defineWorker, triggers } from "cf/config"

export default defineConfig({
  worker: defineWorker({
    name: "katalo",
    // vinext + handler `scheduled` para el cron diario.
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-10-11",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    triggers: [triggers.scheduled({ schedule: "0 9 * * *" })],
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      DB: bindings.d1({ id: "f463d823-2a35-4846-b579-a6b36f82dc20", name: "katalo-db" }),
      MEDIA: bindings.r2({ name: "katalo-media" }),

      // Secrets: local en .dev.vars, producción con `cf deploy --secrets-file`.
      // Todo secret declarado es obligatorio en el deploy. Los opcionales
      // (GOOGLE_CLIENT_ID/SECRET para el login con Google, RESEND_API_KEY para
      // enviar emails) se agregan acá cuando estén configurados.
      BETTER_AUTH_SECRET: bindings.secret(),
      BETTER_AUTH_URL: bindings.secret(),
      EMAIL_FROM: bindings.secret(),
      CRON_SECRET: bindings.secret(),
    },
  }),
})
