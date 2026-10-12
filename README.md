# Multi Store Catalog

Plataforma de catálogos multi-tienda: cada comercio se registra, carga sus productos y obtiene su catálogo público en `/{nombre-tienda}` con su marca y su WhatsApp.

## Stack

Todo en Cloudflare: Next.js 16 (App Router) sobre **vinext** en **Workers** · **D1** (SQLite) con Drizzle · Better Auth · **R2** + **Images** para las fotos · Resend · Tailwind 4 / shadcn. Se maneja con el CLI [`cf`](https://developers.cloudflare.com/cf/) (beta); Wrangler solo como respaldo (`wrangler tail`).

## Puesta en marcha

Requiere Node 22.18+ y `cf` (`npm i -g cf`, luego `cf auth login`).

1. `pnpm install`
2. Copiar `.dev.vars.example` a `.dev.vars` (secrets locales) y `.env.example` a `.env.local` (variables públicas).
3. Crear las tablas en la D1 local: `pnpm db:migrate:local` (y opcionalmente `pnpm db:seed:local` para dos tiendas demo).
4. `pnpm dev` → http://localhost:3000

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm preview` | Desarrollo, build y preview local del Worker |
| `pnpm deploy` | Deploy a Cloudflare Workers |
| `pnpm db:generate` | Genera una migración SQL desde `db/schema.ts` (drizzle-kit) |
| `pnpm db:migrate:local` / `db:migrate:remote` | Aplica las migraciones a la D1 local / de producción |
| `pnpm typecheck` | Genera los tipos de los bindings y corre `tsc` |

Recursos (en `cloudflare.config.ts`): D1 `katalo-db` (`env.DB`), R2 `katalo-media` (`env.MEDIA`), Images (`env.IMAGES`) y el cron diario (`0 9 * * *` → `worker/index.ts` → `/api/cron/daily`). El estado local (D1, R2, caché) vive en `.cloudflare/state`.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `/` | Landing de Katalo (marketing, estática) |
| `/terminos`, `/privacidad` | Páginas legales (contenido pendiente) |
| `/login`, `/registro` | Acceso de los comercios |
| `/panel/*` | Panel del comercio (`app/(admin)/panel`) |
| `/admin` | Panel de superadmin |
| `/{tienda}`, `/{tienda}/catalogo`, `/{tienda}/producto/{slug}` | Catálogo público (`app/[store]/(catalog)`) |

- `lib/data/store-db.ts`: capa única de acceso a datos del panel; agrega siempre el filtro por tienda.
- `lib/auth/`: Better Auth (`server.ts`, `client.ts`) y sesión/tienda del usuario (`session.ts`).
- `lib/reserved-slugs.ts`: nombres de tienda reservados y validación del slug.
- `lib/store-links.ts`: única función que genera links de tienda.
- `config/`: contenido editorial de la landing (planes, casos, preguntas, textos de plataforma) — ver `docs/katalo-brand.md`.
- `db/`: esquema Drizzle (`schema.ts`), migraciones (`migrations/`) y datos de demostración (`seeds/`).
- `lib/media.ts` / `lib/media-urls.ts` + `app/media/[...key]`: fotos en R2, servidas redimensionadas con Cloudflare Images.

## Estado de la etapa 1

- [x] 1. Base limpia, sin datos específicos de ningún comercio
- [x] 2. Better Auth: configuración, login, verificación y recuperación por email (falta pantalla de recuperación)
- [x] 3. Modelo multi-tienda y capa única de acceso a datos
- [ ] 4. Registro con elección del nombre de tienda
- [ ] 5. Panel de configuración de la tienda y checklist de verificación
- [x] 6. Catálogo público por tienda con metadatos propios
- [ ] 7. Panel de superadmin, emails de revisión y cron diario (`/api/cron/daily` es un stub)
- [ ] 8. Prueba de aislamiento con dos o tres tiendas
