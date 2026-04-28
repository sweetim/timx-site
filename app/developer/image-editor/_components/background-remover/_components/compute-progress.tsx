import clsx from "clsx"
import { Check, LoaderCircle } from "lucide-react"
import { match } from "ts-pattern"
import { COMPUTE_STEPS } from "../constants"
import type { ComputePhase } from "../types"
import { getComputeStepIndex } from "../utils"

type ComputeProgressProps = {
  phase: ComputePhase
  compact?: boolean
}

function ComputeProgress({ phase, compact }: ComputeProgressProps) {
  const currentStepIndex = getComputeStepIndex(phase)

  if (compact) {
    return (
      <div className="mt-2">
        <ol className="flex flex-col gap-2">
          {COMPUTE_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            return (
              <li key={step.phase} className="flex items-center gap-2">
                <div
                  className={clsx(
                    "flex items-center justify-center size-5 rounded-full border-2 shrink-0 transition-colors",
                    match({ isCompleted, isCurrent })
                      .with(
                        { isCurrent: true },
                        () => "border-dev-accent-blue bg-dev-accent-blue/10",
                      )
                      .with(
                        { isCompleted: true },
                        () => "border-dev-accent-blue bg-dev-accent-blue",
                      )
                      .with(
                        { isCompleted: false, isCurrent: false },
                        () => "border-dev-text-secondary/30",
                      )
                      .exhaustive(),
                  )}
                >
                  {match({ isCompleted, isCurrent })
                    .with({ isCompleted: true }, () => (
                      <Check className="size-3 text-dev-canvas" />
                    ))
                    .with({ isCurrent: true }, () => (
                      <LoaderCircle className="size-3 text-dev-accent-blue animate-spin" />
                    ))
                    .with({ isCompleted: false, isCurrent: false }, () => null)
                    .exhaustive()}
                </div>
                <span
                  className={clsx(
                    "text-xs",
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
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dev-border bg-dev-inset min-h-[300px] p-8">
      <p className="text-base font-semibold text-dev-text">
        Removing background…
      </p>
      <ol className="mt-6 flex items-center w-full max-w-md">
        {COMPUTE_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          return (
            <li
              key={step.phase}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={clsx(
                    "flex items-center justify-center w-7 h-7 rounded-full border-2 shrink-0 transition-colors",
                    match({ isCompleted, isCurrent })
                      .with(
                        { isCurrent: true },
                        () => "border-dev-accent-blue bg-dev-accent-blue/10",
                      )
                      .with(
                        { isCompleted: true },
                        () => "border-dev-accent-blue bg-dev-accent-blue",
                      )
                      .with(
                        { isCompleted: false, isCurrent: false },
                        () => "border-dev-text-secondary/30",
                      )
                      .exhaustive(),
                  )}
                >
                  {match({ isCompleted, isCurrent })
                    .with({ isCompleted: true }, () => (
                      <Check className="w-3.5 h-3.5 text-dev-canvas" />
                    ))
                    .with({ isCurrent: true }, () => (
                      <LoaderCircle className="w-4 h-4 text-dev-accent-blue animate-spin" />
                    ))
                    .with({ isCompleted: false, isCurrent: false }, () => null)
                    .exhaustive()}
                </div>
                <span
                  className={clsx(
                    "text-xs whitespace-nowrap",
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
                  className={clsx(
                    "flex-1 h-px mx-2 mb-5 transition-colors",
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
