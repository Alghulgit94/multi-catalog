/**
 * Entrypoint del Worker: el handler de vinext para HTTP y el cron diario.
 *
 * El cron reutiliza la ruta /api/cron/daily (misma lógica y mismo check de
 * CRON_SECRET) en vez de duplicarla acá.
 */
import handler from "vinext/server/fetch-handler"

export * from "vinext/server/fetch-handler"

interface CronEnv {
  CRON_SECRET?: string
}

export default {
  ...handler,

  async scheduled(_controller: ScheduledController, env: CronEnv, ctx: ExecutionContext) {
    const request = new Request("https://cron.internal/api/cron/daily", {
      headers: { authorization: `Bearer ${env.CRON_SECRET ?? ""}` },
    })
    ctx.waitUntil(
      Promise.resolve(handler.fetch!(request, env as never, ctx)).then(async (res) => {
        if (!res.ok) console.error("[cron] /api/cron/daily falló", res.status, await res.text().catch(() => ""))
      })
    )
  },
} satisfies ExportedHandler<CronEnv>
