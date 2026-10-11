# Multi Store Catalog

Plataforma de catálogos multi-tienda: cada comercio se registra, carga sus productos y obtiene su catálogo público en `/{nombre-tienda}` con su marca y su WhatsApp.

## Stack

Next.js 16 (App Router) · PostgreSQL en Supabase (solo como base de datos) · Better Auth · Cloudinary · Resend · Tailwind 4 / shadcn.

## Puesta en marcha

1. `pnpm install`
2. Crear un proyecto nuevo de Supabase y copiar `.env.local.example` a `.env.local` con sus valores.
3. Crear las tablas de Better Auth: `pnpm auth:migrate`.
4. Ejecutar `db/schema.sql` en el SQL Editor de Supabase (y opcionalmente `db/seed.sql` para dos tiendas demo).
5. `pnpm dev`

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
- `db/`: esquema y datos de demostración.

## Estado de la etapa 1

- [x] 1. Base limpia, sin datos específicos de ningún comercio
- [x] 2. Better Auth: configuración, login, verificación y recuperación por email (falta pantalla de recuperación)
- [x] 3. Modelo multi-tienda y capa única de acceso a datos
- [ ] 4. Registro con elección del nombre de tienda
- [ ] 5. Panel de configuración de la tienda y checklist de verificación
- [x] 6. Catálogo público por tienda con metadatos propios
- [ ] 7. Panel de superadmin, emails de revisión y cron diario (`/api/cron/daily` es un stub)
- [ ] 8. Prueba de aislamiento con dos o tres tiendas
