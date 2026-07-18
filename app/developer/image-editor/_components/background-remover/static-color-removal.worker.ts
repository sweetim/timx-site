import type { RgbColor } from "./utils"
import { applyStaticColorRemoval } from "./utils"

export type StaticColorWorkerRequest = {
  blob: Blob
  target: RgbColor
  tolerance: number
}

export type StaticColorWorkerEvent =
  | { type: "done"; blob: Blob }
  | { type: "error"; message: string }

self.onmessage = async (event: MessageEvent<StaticColorWorkerRequest>) => {
  const { blob, target, tolerance } = event.data

  try {
    const bitmap = await createImageBitmap(blob)
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const context = canvas.getContext("2d", { willReadFrequently: true })
    if (!context) throw new Error("Canvas context unavailable.")

    context.drawImage(bitmap, 0, 0)
    bitmap.close()

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    applyStaticColorRemoval(imageData.data, target, tolerance)
    context.putImageData(imageData, 0, 0)

    const resultBlob = await canvas.convertToBlob({ type: "image/png" })
    self.postMessage({ type: "done", blob: resultBlob })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to remove the selected color."
    self.postMessage({ type: "error", message })
  }
}
