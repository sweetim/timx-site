import type { ComputePhase } from "./types"

export const COMPUTE_STEPS: { phase: ComputePhase; label: string }[] = [
  { phase: "decoding", label: "Preparing" },
  { phase: "computing-inference", label: "Analyzing" },
  { phase: "computing-mask", label: "Masking" },
  { phase: "encoding", label: "Saving" },
]

export const PROGRESS_RING_SIZE = 80
export const PROGRESS_RING_STROKE = 4
export const PROGRESS_RING_RADIUS =
  (PROGRESS_RING_SIZE - PROGRESS_RING_STROKE) / 2
export const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS

export const CHECKERBOARD_SIZE = 16

export const DEFAULT_STATIC_COLOR_REMOVAL_COLOR = "#ffffff"
export const DEFAULT_STATIC_COLOR_REMOVAL_TOLERANCE = 24
export const STATIC_COLOR_REMOVAL_MAXIMUM_TOLERANCE = 100
