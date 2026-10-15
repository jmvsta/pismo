export interface PreparedImage {
  mimeType: string
  imageBase64: string
}

interface PrepareImageOptions {
  /** Longest side, in pixels, the uploaded image is scaled down to. */
  maxSide: number
  quality?: number
}

// Small files are sent exactly as picked. Above this a phone photo is resized and re-encoded,
// because the raw file plus base64's ~33% overhead can exceed the server's request-size limit.
const SEND_AS_IS_BYTES = 1_000_000

function readAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function asIs(file: File): Promise<PreparedImage> {
  return { mimeType: file.type, imageBase64: await readAsBase64(file) }
}

/**
 * Turns a picked photo into something that uploads reliably: scaled so its longest side is at
 * most `maxSide`, with the phone's rotation (EXIF) applied, and re-encoded smaller. JPEGs stay
 * JPEG; PNG/WebP are re-encoded as WebP so transparency survives. GIFs (which may be animated)
 * and already-small files are left alone, and if the image can't be decoded in the browser the
 * original is sent unchanged so the server can accept or reject it as before.
 */
export async function prepareImageForUpload(file: File, { maxSide, quality = 0.85 }: PrepareImageOptions): Promise<PreparedImage> {
  if (file.type === 'image/gif' || file.size <= SEND_AS_IS_BYTES) return asIs(file)
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) return asIs(file)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const outputType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp'
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, quality))
    if (!blob || (scale === 1 && blob.size >= file.size)) return asIs(file)
    return { mimeType: blob.type, imageBase64: await readAsBase64(blob) }
  } catch {
    return asIs(file)
  }
}
