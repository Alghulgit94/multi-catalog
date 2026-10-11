# Marca Katalo — referencia para el resto de la plataforma

Este documento resume el manual de marca de Katalo (`katalo/design_handoff_katalo_landing/`) para que futuros cambios
en el resto de la plataforma (panel, login/registro, admin, catálogo de tienda) puedan adaptarse a esta identidad sin
tener que releer el paquete de diseño completo. La landing (`app/page.tsx`, `app/terminos`, `app/privacidad`) ya la
implementa; el resto de la plataforma **todavía no** — ver el checklist al final.

## 1. Identidad y voz

- Tagline: **"La vidriera de tu negocio en un link."**
- Katalo es un **catálogo con consulta por WhatsApp**. No tiene carrito, pagos, pedidos ni stock. Ningún texto, en
  ningún lugar de la plataforma, puede prometer esas funciones.
- Voz: voseo paraguayo, oraciones cortas, verbos concretos. El botón dice qué pasa ("Crear mi catálogo gratis", no
  "Comenzar ahora →"). Nunca mayúsculas sostenidas.
- Glosario (usar / evitar):
  - Catálogo — no "tienda online" / "e-commerce"
  - Link — no "enlace" / "URL"
  - Consultar, consulta — no "comprar" / "pedido" / "carrito"
  - Comercio, negocio — no "merchant" / "seller"
  - Precios en formato `Gs. 89.000` (punto como separador de miles) — no "PYG 89000" ni "₲89k"
  - "Fotos con IA" — no "inteligencia artificial generativa"
- Nunca inventar estadísticas ("+3.500 tiendas", "la #1") ni testimonios. Un testimonio solo se publica si el dueño
  del comercio lo escribió y aprobó explícitamente.

## 2. Tokens de diseño

Viven en `app/globals.css`, en un bloque `:root` + `@theme inline` separado y comentado como "Tokens de marca
Katalo — SOLO para la landing...". Son **aditivos**: no reemplazan ni los `--background`/`--primary`/`--font-sans`
que usa el resto de la plataforma (panel, login, catálogo de tienda siguen con el tema genérico slate-blue/Inter).

| Token | Valor | Clase Tailwind | Uso |
| --- | --- | --- | --- |
| `--tinta` | `#13203B` | `bg-tinta` / `text-tinta` | Títulos, texto principal, fondo del footer |
| `--texto-secundario` | `#556079` | `text-texto-secundario` | Subtítulos, descripciones |
| `--fondo-alterno` | `#F3F5F9` | `bg-fondo-alterno` | Secciones alternas (Cómo funciona, Casos, Preguntas) |
| `--linea` | `#DCE1EA` | `border-linea` | Bordes, divisores |
| `--primario` / `--primario-hover` | `#1F4FD8` / `#183FB0` | `bg-primario`, `hover:bg-primario-hover` | Botones principales, links, plan destacado |
| `--nanduti-fucsia` | `#E0457B` | `bg-nanduti-fucsia`, `text-nanduti-fucsia` | Hilos, acentos — nunca como color de botón |
| `--nanduti-amarillo` | `#F5B82E` | `bg-nanduti-amarillo` | Hilos, insignia "Más elegido" — siempre con texto tinta |
| `--nanduti-verde` | `#2E9E6A` | `bg-nanduti-verde`, `text-nanduti-verde` | Hilos, checks de "incluido" |
| `--whatsapp` | `#25D366` | `bg-whatsapp` | SOLO en botones que abren WhatsApp, texto tinta |
| `--tinte-amarillo/verde/fucsia` | `#FEF3D9` / `#E2F2EA` / `#FCE6EE` | `bg-tinte-*` | Fondo "escenario" detrás de imágenes de beneficios |
| `--texto-sobre-tinta` | `#C9D0DD` | `text-texto-sobre-tinta` | Texto/links secundarios sobre el footer tinta |
| Radios | 12/12/28/8/24px | `rounded-boton/plan/celular/foto/escenario` | Botón, plan, marco de celular, fotos, escenario |
| Sombra | ver CSS | `shadow-celular`, `shadow-whatsapp` | Única sombra "real" del sistema es la del marco de celular |
| Ancho máximo | 1200px | `max-w-contenido` | Contenido de cada sección |
| Tipografía | Bricolage Grotesque / Figtree | `font-titulos`, `font-cuerpo` | Títulos / cuerpo y UI |
| Escala fluida | `.t-hero`, `.t-seccion`, `.t-bloque`, `.t-cuerpo`, `.t-chico`, `.t-boton` | clases en `@layer components`, scopeadas bajo `.katalo` | H1/H2/H3/cuerpo/chico/botón |

Reglas de color: texto blanco solo sobre primario o tinta; sobre amarillo, siempre texto tinta; los botones son
siempre primario (azul lleno) o secundario (borde tinta) — los hilos nunca son color de botón; el verde WhatsApp solo
en botones que abren WhatsApp.

## 3. Convenciones de componentes

- Toda la landing vive en `components/landing/` (secciones) y `components/landing/ui/` (primitivas: `Boton`, `Hilo`,
  `LogoKatalo`, `Nanduti`, `MarcoCelular`, `BurbujaWhatsApp`, `PlaceholderFoto`, `TrackedLink`).
- El contenido editorial (nombre de la plataforma, planes, casos, preguntas, imágenes) vive en `config/*.ts` — nunca
  hardcodeado dentro de un componente. `config/planes.ts` tiene un comentario explícito: en la etapa 2 se reemplaza
  por una tabla de base de datos sin tocar el componente.
- Las fuentes (Bricolage Grotesque, Figtree) se cargan con `next/font/google` en `components/landing/fonts.ts` y se
  aplican como `className` en el `<div className="katalo">` raíz de cada página que usa esta marca — nunca en
  `app/layout.tsx`. Así el resto del sitio sigue con Inter sin cambios.
- Componentes cliente (`"use client"`), solo donde hace falta interactividad: `Encabezado` (scroll + menú),
  `BurbujaWhatsApp`, `Planes` (selector de período), `Preguntas` (acordeón), `WhatsAppFlotante`, `Boton` (centraliza
  el tracking), `TrackedLink`. Todo lo demás es Server Component estático.
- Acordeón de preguntas y selector de período usan los primitivos **sin estilos** `@radix-ui/react-accordion` y
  `@radix-ui/react-radio-group` (ya instalados) en vez de `components/ui/accordion.tsx` / `radio-group.tsx` del panel,
  que tienen su propio estilo shadcn. Esto da teclado/ARIA gratis sin pelear con esas clases.
- Los componentes de servidor/cliente que usan `config/plataforma.ts` o `config/planes.ts` los importan
  **directamente** (no los reciben como prop desde un Server Component), porque esos módulos incluyen funciones
  (`mensajeWhatsapp`, `caracteristicas`) que no se pueden serializar a través del límite servidor→cliente de RSC.

## 4. Uso del logo y el ñandutí

Assets en `public/brand/` (y espejo en `katalo/design_handoff_katalo_landing/public/brand/`).

- `katalo-sello.svg` / `katalo-sello-invertido.svg` / `katalo-sello-tinta.svg`: el sello solo (ícono/favicon/avatar),
  mínimo 16px. `katalo-horizontal.svg` / `katalo-horizontal-blanco.svg`: logo completo, mínimo 96px de ancho.
  `katalo-rosa-sola.svg`: la rosa ñandutí sin el círculo del sello.
- `motivo/nanduti-completo.svg`: una sola vez por pieza, detrás del celular del hero. `motivo/nanduti-cierre.svg`: al
  40% de opacidad, con halo blanco detrás del texto, en el cierre.
- Nunca deformar, rotar, recortar en círculo, agregar sombra, ni cambiar el azul del sello. Nunca sobre fondo verde
  WhatsApp. Espacio de protección: ¼ del diámetro del sello.
- Todo motivo decorativo (sello usado como fondo, ñandutí, hilos) lleva `aria-hidden="true"`.

## 5. Eventos de analítica

Helper: `lib/analytics/track.ts` → `track(event, data)` hace `window.dataLayer.push({ event, ...data })`.

| Evento | Payload | Dónde se dispara |
| --- | --- | --- |
| `clic_crear_catalogo` | `{ seccion }` (encabezado, hero, como_funciona, beneficio_link, beneficio_whatsapp, beneficio_ia, cierre) | Cada CTA de registro |
| `clic_plan` | `{ plan, periodo }` | CTA de cada tarjeta de plan |
| `cambio_periodo` | `{ periodo }` | Selector Mensual/Anual |
| `clic_whatsapp` | `{ origen }` (`flotante`, `preguntas`, `footer`) | Botones que abren WhatsApp |
| `clic_caso` | `{ tienda }` | Logo en "Tiendas" o botón "Ver su catálogo" |
| `onboarding_iniciado` | `{ paso }` | Al abrir `/registro` |
| `onboarding_paso` | `{ paso, numero }` (tienda, logo, whatsapp, plan, cuenta) | Cada vez que se muestra un paso |
| `onboarding_plan_elegido` | `{ plan }` | Botón de cada plan en el onboarding |
| `onboarding_cuenta_enviada` | `{ metodo, plan }` (`email`, `google`) | Último paso, al crear la cuenta |

Nota: el handoff original solo definía `origen: flotante|preguntas`. El link de WhatsApp del footer usa
`origen: 'footer'` como extensión razonable (documentado acá y en el código).

## 6. Pendientes — no inventar

Estos datos están marcados como pendientes en el paquete de diseño original. Si aparecen vacíos o con un placeholder
punteado en la UI, es intencional — no reemplazar con contenido inventado:

- Número real de WhatsApp de atención (`config/plataforma.ts`, hoy `595000000000`).
- Ipora Termos: link al catálogo, logo y 4–6 fotos (`config/casos.ts`).
- Testimonios de comercios: solo se publican si el dueño los escribió y aprobó.
- Foto "en ambiente" generada con IA para el beneficio 3 (hoy un marcador punteado).
- Dominio final (`katalo.com.py` a confirmar) y redes sociales (Instagram/Facebook, hoy vacíos).
- Imagen Open Graph 1200×630 para compartir en redes/WhatsApp.
- Texto legal real de `/terminos` y `/privacidad` (hoy solo un aviso de "contenido en preparación").

## 7. Checklist de rebranding pendiente en el resto de la plataforma

Fuera de alcance de esta tarea — queda para un trabajo futuro:

- [ ] `app/globals.css`: decidir si el tema general (`--primary` `#537688`, `--secondary` `#B8AA92`, `Inter`) migra a
      los tokens de Katalo, o si el panel/login se mantienen con una identidad "de producto" separada.
- [ ] `/login`, `/registro`, `/panel/*`, `/admin`: hoy siguen con el tema genérico shadcn. Si se decide
      remarcarlos, reusar los tokens de §2 y los componentes de `components/landing/ui/` como base.
- [ ] Catálogo público por tienda (`app/[store]/(catalog)/*`): **no** debería adoptar la marca Katalo — cada tienda
      tiene su propia identidad (`store.primaryColor`, logo propio). Katalo es la plataforma, no la vidriera de cada
      comercio.
- [ ] Emails transaccionales (Resend) y cualquier plantilla fuera de Next.js: revisar si usan el nombre/branding
      anterior ("Multi Store Catalog").
