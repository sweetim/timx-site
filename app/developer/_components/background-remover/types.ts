type ComputePhase =
  | "decoding"
  | "computing-inference"
  | "computing-mask"
  | "encoding"

type ProcessingStatus = { phase: "downloading-model" } | { phase: ComputePhase }

type Status =
  | { phase: "idle" }
  | { phase: "processing"; status: ProcessingStatus; progress: number }
  | { phase: "done"; originalUrl: string; resultUrl: string }
  | { phase: "error"; message: string }

export type { ComputePhase, ProcessingStatus, Status }
