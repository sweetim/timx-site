import classNames from "classnames"
import { LoaderCircle } from "lucide-react"
import { match } from "ts-pattern"
import { COMPUTE_STEPS } from "../constants"
import ProgressRing from "../progress-ring"
import type { ComputePhase } from "../types"
import { getComputeStepIndex } from "../utils"

type ComputeProgressProps = {
  phase: ComputePhase
}

function ComputeProgress({ phase }: ComputeProgressProps) {
  const currentStepIndex = getComputeStepIndex(phase)
  const progress = (currentStepIndex + 1) / COMPUTE_STEPS.length

  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dev-border bg-dev-inset min-h-[300px] p-8">
      <div className="relative flex items-center justify-center">
        <ProgressRing progress={progress} />
        <span className="absolute text-sm font-semibold text-dev-text">
          {Math.round(progress * 100)}%
        </span>
      </div>
      <p className="mt-4 text-base font-semibold text-dev-text">
        Removing background…
      </p>
      <ol className="mt-5 flex items-center w-full max-w-xs">
        {COMPUTE_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          return (
            <li
              key={step.phase}
              className="flex items-center flex-1"
            >
              <div className="flex flex-col items-center gap-1.5">
                {match({ isCompleted, isCurrent })
                  .with({ isCompleted: true }, () => (
                    <span className="w-2 h-2 rounded-full bg-dev-accent-blue" />
                  ))
                  .with({ isCurrent: true }, () => (
                    <span className="w-2 h-2">
                      <LoaderCircle className="w-2 h-2 text-dev-accent-blue animate-spin" />
                    </span>
                  ))
                  .with({ isCompleted: false, isCurrent: false }, () => (
                    <span className="w-2 h-2 rounded-full bg-dev-text-secondary/30" />
                  ))
                  .exhaustive()}
                <span
                  className={classNames(
                    "text-xs transition-colors whitespace-nowrap",
                    match({ isCompleted, isCurrent })
                      .with(
                        { isCurrent: true },
                        () => "font-semibold text-dev-text",
                      )
                      .with({ isCompleted: true }, () => "text-dev-accent-blue")
                      .with(
                        { isCompleted: false, isCurrent: false },
                        () => "text-dev-text-secondary/50",
                      )
                      .exhaustive(),
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < COMPUTE_STEPS.length - 1 && (
                <div
                  className={classNames(
                    "flex-1 h-px mx-2 mb-4 transition-colors",
                    match(index < currentStepIndex)
                      .with(true, () => "bg-dev-accent-blue")
                      .with(false, () => "bg-dev-border")
                      .exhaustive(),
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default ComputeProgress
