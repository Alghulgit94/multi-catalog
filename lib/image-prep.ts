/**
 * Achica las fotos en el navegador antes de subirlas.
 *
 * Una foto de celular pesa 3–10 MB y 4000 px: subirla así por datos móviles
 * tarda mucho (y el registro rechaza logos de más de 3 MB). Para el catálogo
 * alcanzan 1600 px: se re-codifica a WebP (o JPEG si el navegador no puede) y
 * queda en unos cientos de KB. Solo cliente.
 */

const MAX_LADO = 1600
const CALIDAD = 0.85
/** Por debajo de esto y de MAX_LADO, la foto se sube tal cual. */
const LIVIANA = 1.5 * 1024 * 1024

/** Devuelve una versión liviana de `file`, o el original si no hace falta o no se puede. */
export async function prepararImagen(file: File, maxLado = MAX_LADO): Promise<File> {
  // SVG y GIF (logos, animaciones) no se re-codifican.
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file

  let imagen: ImageBitmap | HTMLImageElement
  try {
    imagen = await decodificar(file)
  } catch {
    return file // formato que el navegador no sabe abrir: que decida el servidor
  }

  const { width, height } = imagen
  if (width <= maxLado && height <= maxLado && file.size <= LIVIANA) {
    if ("close" in imagen) imagen.close()
    return file
  }

  const escala = Math.min(1, maxLado / Math.max(width, height))
  const w = Math.max(1, Math.round(width * escala))
  const h = Math.max(1, Math.round(height * escala))

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) return file
  ctx.drawImage(imagen, 0, 0, w, h)
  if ("close" in imagen) imagen.close()

  const blob = (await aBlob(canvas, "image/webp")) ?? (await aBlob(canvas, "image/jpeg"))
  // Si por algún motivo quedó más pesada, se usa la original.
  if (!blob || blob.size >= file.size) return file

  const ext = blob.type === "image/webp" ? "webp" : "jpg"
  const nombre = file.name.replace(/\.[^.]+$/, "") || "foto"
  return new File([blob], `${nombre}.${ext}`, { type: blob.type, lastModified: Date.now() })
}

async function decodificar(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      // Respeta la orientación EXIF de las fotos de celular.
      return await createImageBitmap(file, { imageOrientation: "from-image" })
    } catch {
      // Safari viejo: cae al <img>.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = "async"
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function aBlob(canvas: HTMLCanvasElement, tipo: string): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b && b.type === tipo ? b : null), tipo, CALIDAD)
  )
}
