const ICO_AVAILABLE_SIZES = [16, 24, 32, 48, 64, 128, 256] as const

type IcoSize = (typeof ICO_AVAILABLE_SIZES)[number]

function resizeToCanvas(
  img: HTMLImageElement,
  size: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas context unavailable")
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = "high"
  context.drawImage(img, 0, 0, size, size)
  return canvas
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("PNG encoding failed"))
      },
      "image/png",
    )
  })
}

async function encodeIco(sourceUrl: string, sizes: IcoSize[]): Promise<Blob> {
  if (sizes.length === 0) throw new Error("At least one size is required")

  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = sourceUrl
  })

  const entries: { size: number; blob: Blob }[] = []
  for (const size of sizes) {
    const canvas = resizeToCanvas(img, size)
    const blob = await canvasToPngBlob(canvas)
    entries.push({ size, blob })
  }

  const headerSize = 6
  const dirEntrySize = 16
  const dirSize = dirEntrySize * entries.length
  let dataOffset = headerSize + dirSize

  const buffers: Uint8Array[] = []

  const header = new ArrayBuffer(headerSize)
  const headerView = new DataView(header)
  headerView.setUint16(0, 0, true)
  headerView.setUint16(2, 1, true)
  headerView.setUint16(4, entries.length, true)
  buffers.push(new Uint8Array(header))

  for (const { size, blob } of entries) {
    const arrayBuffer = await blob.arrayBuffer()
    const entry = new ArrayBuffer(dirEntrySize)
    const view = new DataView(entry)
    view.setUint8(0, size >= 256 ? 0 : size)
    view.setUint8(1, size >= 256 ? 0 : size)
    view.setUint8(2, 0)
    view.setUint8(3, 0)
    view.setUint16(4, 1, true)
    view.setUint16(6, 32, true)
    view.setUint32(8, arrayBuffer.byteLength, true)
    view.setUint32(12, dataOffset, true)
    buffers.push(new Uint8Array(entry))
    dataOffset += arrayBuffer.byteLength
  }

  for (const { blob } of entries) {
    const arrayBuffer = await blob.arrayBuffer()
    buffers.push(new Uint8Array(arrayBuffer))
  }

  const totalSize = buffers.reduce((sum, buf) => sum + buf.length, 0)
  const result = new Uint8Array(totalSize)
  let offset = 0
  for (const buf of buffers) {
    result.set(buf, offset)
    offset += buf.length
  }

  return new Blob([result], { type: "image/x-icon" })
}

export { encodeIco, ICO_AVAILABLE_SIZES }
export type { IcoSize }
