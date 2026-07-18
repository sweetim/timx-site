import { match, P } from "ts-pattern"
import { COMPUTE_STEPS } from "./constants"
import type { ComputePhase, ProcessingStatus } from "./types"

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

export type RgbColor = {
  red: number
  green: number
  blue: number
}

function parseHexColor(color: string): RgbColor {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color)
  if (!match) throw new Error("Choose a valid color to remove.")

  return {
    red: Number.parseInt(match[1], 16),
    green: Number.parseInt(match[2], 16),
    blue: Number.parseInt(match[3], 16),
  }
}

export function applyStaticColorRemoval(
  data: Uint8ClampedArray,
  target: RgbColor,
  tolerance: number,
): void {
  const feather = Math.round(tolerance * 0.5)

  for (let index = 0; index < data.length; index += 4) {
    const maxDiff = Math.max(
      Math.abs(data[index] - target.red),
      Math.abs(data[index + 1] - target.green),
      Math.abs(data[index + 2] - target.blue),
    )

    if (maxDiff <= tolerance) {
      data[index + 3] = 0
    } else if (feather > 0 && maxDiff <= tolerance + feather) {
      data[index + 3] = Math.round(
        (data[index + 3] * (maxDiff - tolerance)) / feather,
      )
    }
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
