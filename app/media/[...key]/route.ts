import { env } from "cloudflare:workers"
import { MEDIA_WIDTHS } from "@/lib/media-urls"

/**
 * Sirve imágenes de R2 redimensionadas con Cloudflare Images.
 *
 *   /media/<key>?w=800            ancho (redondeado hacia arriba a MEDIA_WIDTHS)
 *   /media/<key>?w=1200&h=630&bg=ffffff&f=jpeg   encajada sin recortar (Open Graph)
 *   &v=<n>                        versión para romper caché (no cambia la imagen)
 *
 * Las respuestas se guardan en el caché del edge: cada combinación se transforma
 * una sola vez por ubicación.
 */

const PUBLIC_PREFIXES = ["stores/", "drafts/"]
const ONE_YEAR = 60 * 60 * 24 * 365

type Bindings = { MEDIA: R2Bucket; IMAGES: ImagesBinding }

function pickWidth(raw: string | null): number | undefined {
  const n = Number(raw)
  if (!raw || !Number.isFinite(n) || n <= 0) return undefined
  return MEDIA_WIDTHS.find((w) => w >= n) ?? MEDIA_WIDTHS[MEDIA_WIDTHS.length - 1]
}

function pickFormat(request: Request, forced: string | null): "image/avif" | "image/webp" | "image/jpeg" {
  if (forced === "jpeg") return "image/jpeg"
  const accept = request.headers.get("accept") ?? ""
  if (accept.includes("image/avif")) return "image/avif"
  if (accept.includes("image/webp")) return "image/webp"
  return "image/jpeg"
}

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await params
  const key = parts.map(decodeURIComponent).join("/")
  if (!PUBLIC_PREFIXES.some((p) => key.startsWith(p)) || key.includes("..")) {
    return new Response("Not found", { status: 404 })
  }

  const url = new URL(request.url)
  const width = pickWidth(url.searchParams.get("w"))
  // El alto solo se usa para el pad de Open Graph: se acepta exacto, con tope.
  const h = Number(url.searchParams.get("h"))
  const height = width && Number.isInteger(h) && h > 0 && h <= 2000 ? h : undefined
  const bg = url.searchParams.get("bg")
  const background = bg && /^[0-9a-f]{6}$/i.test(bg) ? `#${bg}` : undefined
  const format = pickFormat(request, url.searchParams.get("f"))
  const versioned = url.searchParams.has("v")

  // Clave de caché normalizada: el formato depende del Accept, no de la URL.
  const cacheKeyUrl = new URL(url.origin + url.pathname)
  if (width) cacheKeyUrl.searchParams.set("w", String(width))
  if (height) cacheKeyUrl.searchParams.set("h", String(height))
  if (background) cacheKeyUrl.searchParams.set("bg", bg!)
  if (url.searchParams.get("v")) cacheKeyUrl.searchParams.set("v", url.searchParams.get("v")!)
  cacheKeyUrl.searchParams.set("fmt", format)
  const cacheKey = new Request(cacheKeyUrl.toString())

  const cache = (caches as unknown as { default: Cache }).default
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  const { MEDIA, IMAGES } = env as unknown as Bindings
  const object = await MEDIA.get(key)
  if (!object) return new Response("Not found", { status: 404 })

  const headers = new Headers({
    "Cache-Control": versioned ? `public, max-age=${ONE_YEAR}, immutable` : "public, max-age=86400",
    Vary: "Accept",
  })

  const original = object.httpMetadata?.contentType ?? "application/octet-stream"
  let response: Response
  // SVG y GIF se sirven tal cual: Images no los redimensiona bien.
  if (original === "image/svg+xml" || original === "image/gif" || !width) {
    headers.set("Content-Type", original)
    response = new Response(object.body, { headers })
  } else {
    try {
      const result = await IMAGES.input(object.body)
        .transform(
          height
            ? { width, height, fit: "pad", background: background ?? "#ffffff" }
            : { width, fit: "scale-down" }
        )
        .output({ format, quality: 85 })
      headers.set("Content-Type", result.contentType())
      response = new Response(result.image(), { headers })
    } catch (e) {
      console.error("[media] no se pudo transformar", key, e)
      const fallback = await MEDIA.get(key)
      if (!fallback) return new Response("Not found", { status: 404 })
      headers.set("Content-Type", original)
      headers.set("Cache-Control", "public, max-age=300")
      return new Response(fallback.body, { headers })
    }
  }

  await cache.put(cacheKey, response.clone())
  return response
}
