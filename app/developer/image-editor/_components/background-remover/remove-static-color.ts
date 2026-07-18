import type { RgbColor } from "./utils"

function parseHexColor(color: string): RgbColor {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color)
  if (!match) throw new Error("Choose a valid color to remove.")

  return {
    red: Number.parseInt(match[1], 16),
    green: Number.parseInt(match[2], 16),
    blue: Number.parseInt(match[3], 16),
  }
}

export function removeStaticColor(
  blob: Blob,
  color: string,
  tolerance: number,
): Promise<Blob> {
  const target = parseHexColor(color)
  const normalizedTolerance = Math.max(0, Math.min(255, Math.round(tolerance)))

  return new Promise<Blob>((resolve, reject) => {
    const worker = new Worker(
      new URL("./static-color-removal.worker.ts", import.meta.url),
    )
    worker.onmessage = (
      event: MessageEvent<
        { type: "done"; blob: Blob } | { type: "error"; message: string }
      >,
    ) => {
      worker.terminate()
      if (event.data.type === "done") resolve(event.data.blob)
      else reject(new Error(event.data.message))
    }
    worker.onerror = () => {
      worker.terminate()
      reject(new Error("Failed to remove the selected color."))
    }
    worker.postMessage({ blob, target, tolerance: normalizedTolerance })
  })
}
