import { match } from "ts-pattern"
import { formatProgressLabel } from "../utils"

type DownloadProgressProps = {
  progress: number
  compact?: boolean
}

function DownloadProgress({ progress, compact }: DownloadProgressProps) {
  if (compact) {
    return (
      <div className="mt-2">
        <p className="text-xs text-dev-text">
          {formatProgressLabel({ phase: "downloading-model" }, progress)}
        </p>
        <div className="mt-2 h-1.5 w-full bg-dev-border rounded-full overflow-hidden">
          {match(progress > 0)
            .with(true, () => (
              <div
                className="h-full bg-dev-accent-blue rounded-full transition-all duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            ))
            .with(false, () => (
              <div
                className="h-full w-1/4 bg-dev-accent-blue/60 rounded-full"
                style={{
                  animation: "progress-indeterminate 1.5s ease-in-out infinite",
                }}
              />
            ))
            .exhaustive()}
        </div>
        <p className="mt-1.5 text-xs text-dev-text-secondary">
          First-use model download.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dev-border bg-dev-inset min-h-75 p-8">
      <p className="mt-4 text-sm text-dev-text">
        {formatProgressLabel({ phase: "downloading-model" }, progress)}
      </p>
      <div className="mt-3 w-64 h-1.5 bg-dev-border rounded-full overflow-hidden">
        {match(progress > 0)
          .with(true, () => (
            <div
              className="h-full bg-dev-accent-blue rounded-full transition-all duration-200"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          ))
          .with(false, () => (
            <div
              className="h-full w-1/4 bg-dev-accent-blue/60 rounded-full"
              style={{
                animation: "progress-indeterminate 1.5s ease-in-out infinite",
              }}
            />
          ))
          .exhaustive()}
      </div>
      <p className="mt-2 text-xs text-dev-text-secondary">
        The AI model will be downloaded on first use. Subsequent runs will be
        faster.
      </p>
    </div>
  )
}

export default DownloadProgress
