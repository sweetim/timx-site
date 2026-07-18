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
