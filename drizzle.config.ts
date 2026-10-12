import { defineConfig } from "drizzle-kit"

/** Solo genera el SQL de las migraciones; se aplican con `cf d1 migrations apply`. */
export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schema.ts",
  out: "./db/migrations",
})
