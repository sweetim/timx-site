type ComputePhase =
  | "decoding"
  | "computing-inference"
  | "computing-mask"
  | "encoding"

type ProcessingStatus = { phase: "downloading-model" } | { phase: ComputePhase }

type Status =
  | { phase: "idle" }
  | { phase: "ready"; originalUrl: string }
  | {
      phase: "processing"
      status: ProcessingStatus
      progress: number
      originalUrl: string
    }
  | { phase: "done"; originalUrl: string; resultUrl: string }
  | { phase: "error"; message: string }

type PerImageStatus =
  | { phase: "processing"; status: ProcessingStatus; progress: number }
  | { phase: "done"; resultUrl: string }
  | { phase: "error"; message: string }

export type { ComputePhase, PerImageStatus, ProcessingStatus, Status }
