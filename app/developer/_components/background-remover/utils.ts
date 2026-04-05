import { match } from "ts-pattern"
import { COMPUTE_STEPS } from "./constants"
import type { ComputePhase, ProcessingStatus } from "./types"

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
