import { match, P } from "ts-pattern"
import { COMPUTE_STEPS } from "./constants"
import type { ComputePhase, ProcessingStatus, Status } from "./types"

type ProcessingState = Extract<Status, { phase: "processing" }>

type TransitionResult = {
  immediate: ProcessingState
  delayed: { status: ProcessingStatus; progress: number } | null
}

export function resolveProgressUpdate(
  prev: ProcessingState,
  nextStatus: ProcessingStatus,
  progress: number,
): TransitionResult {
  const isTransitioningFromFetch =
    prev.status.phase === "downloading-model"
    && nextStatus.phase !== "downloading-model"

  if (isTransitioningFromFetch) {
    return {
      immediate: { ...prev, progress: 1 },
      delayed: { status: nextStatus, progress: 0 },
    }
  }

  return {
    immediate: { ...prev, status: nextStatus, progress },
    delayed: null,
  }
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
