import { match, P } from "ts-pattern"
import { COMPUTE_STEPS } from "./constants"
import type { ComputePhase, ProcessingStatus, Status } from "./types"

type ProcessingState = Extract<Status, { phase: "processing" }>

export function resolveProgressUpdate(
  prev: ProcessingState,
  nextStatus: ProcessingStatus,
  progress: number,
): { immediate: ProcessingState } {
  return { immediate: { ...prev, status: nextStatus, progress } }
}

export function mapProgressKeyToPhase(key: string): ProcessingStatus {
  return match(key)
    .with(P.string.includes("compute:inference"), () => ({
      phase: "computing-inference" as const,
    }))
    .with(P.string.includes("compute:mask"), () => ({
      phase: "computing-mask" as const,
    }))
    .with(P.string.includes("compute:encode"), () => ({
      phase: "encoding" as const,
    }))
    .with(P.string.includes("compute:decode"), () => ({
      phase: "decoding" as const,
    }))
    .with(P.string.startsWith("fetch"), () => ({
      phase: "downloading-model" as const,
    }))
    .otherwise(() => ({
      phase: "decoding" as const,
    }))
}

export function getComputeStepIndex(phase: ComputePhase): number {
  return COMPUTE_STEPS.findIndex((step) => step.phase === phase)
}

export function formatProgressLabel(
  status: ProcessingStatus,
  progress: number,
): string {
  const percent = Math.round(progress * 100)
  return match(status)
    .with(
      { phase: "downloading-model" },
      () => `Downloading model… ${percent}%`,
    )
    .with({ phase: "decoding" }, () => `Preparing image… ${percent}%`)
    .with(
      { phase: "computing-inference" },
      () => `Analyzing image… ${percent}%`,
    )
    .with({ phase: "computing-mask" }, () => `Generating mask… ${percent}%`)
    .with({ phase: "encoding" }, () => `Encoding result… ${percent}%`)
    .exhaustive()
}

function parseHexColor(color: string): {
  red: number
  green: number
  blue: number
} {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color)
  if (!match) throw new Error("Choose a valid color to remove.")

  return {
    red: Number.parseInt(match[1], 16),
    green: Number.parseInt(match[2], 16),
    blue: Number.parseInt(match[3], 16),
  }
}

function loadImageFromObjectUrl(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve(image)
    }
    image.onerror = () => {
      reject(new Error("Failed to load the selected image."))
    }
    image.src = objectUrl
  })
}

export async function removeStaticColor(
  blob: Blob,
  color: string,
  tolerance: number,
): Promise<Blob> {
  const target = parseHexColor(color)
  const normalizedTolerance = Math.max(0, Math.min(255, Math.round(tolerance)))
  const objectUrl = URL.createObjectURL(blob)

  try {
    const image = await loadImageFromObjectUrl(objectUrl)
    const canvas = document.createElement("canvas")
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    const context = canvas.getContext("2d", { willReadFrequently: true })
    if (!context) throw new Error("Canvas context unavailable.")

    context.drawImage(image, 0, 0)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const { data } = imageData

    for (let index = 0; index < data.length; index += 4) {
      const redMatches =
        Math.abs(data[index] - target.red) <= normalizedTolerance
      const greenMatches =
        Math.abs(data[index + 1] - target.green) <= normalizedTolerance
      const blueMatches =
        Math.abs(data[index + 2] - target.blue) <= normalizedTolerance

      if (redMatches && greenMatches && blueMatches) data[index + 3] = 0
    }

    context.putImageData(imageData, 0, 0)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((resultBlob) => {
        if (resultBlob) resolve(resultBlob)
        else reject(new Error("Failed to encode the transparent image."))
      }, "image/png")
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
