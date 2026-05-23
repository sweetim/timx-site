import { useId } from "react"
import { STATIC_COLOR_REMOVAL_MAXIMUM_TOLERANCE } from "../constants"

type StaticColorRemovalControlsProps = {
  color: string
  tolerance: number
  disabled?: boolean
  error?: string | null
  onColorChange: (color: string) => void
  onToleranceChange: (tolerance: number) => void
  onRemoveColor: () => void
}

function StaticColorRemovalControls({
  color,
  tolerance,
  disabled = false,
  error,
  onColorChange,
  onToleranceChange,
  onRemoveColor,
}: StaticColorRemovalControlsProps) {
  const colorInputId = useId()
  const toleranceInputId = useId()

  return (
    <div className="rounded-md border border-dev-border bg-dev-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
        Static Color
      </p>
      <p className="mt-1 text-xs leading-relaxed text-dev-text-secondary">
        Make pixels matching this color transparent. Increase tolerance for
        compressed edges.
      </p>

      <div className="mt-3 grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={colorInputId}
            className="text-xs font-medium text-dev-text-secondary"
          >
            Color to remove
          </label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase text-dev-text-secondary">
              {color}
            </span>
            <input
              id={colorInputId}
              type="color"
              aria-label="Color to remove"
              value={color}
              disabled={disabled}
              onChange={(event) => onColorChange(event.target.value)}
              className="h-9 w-10 cursor-pointer rounded border border-dev-border disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-center justify-between gap-3 text-xs text-dev-text-secondary">
            <label
              htmlFor={toleranceInputId}
              className="font-medium"
            >
              Tolerance
            </label>
            <span>+/- {tolerance}</span>
          </div>
          <input
            id={toleranceInputId}
            type="range"
            min={0}
            max={STATIC_COLOR_REMOVAL_MAXIMUM_TOLERANCE}
            step={1}
            value={tolerance}
            disabled={disabled}
            onChange={(event) => onToleranceChange(Number(event.target.value))}
            className="w-full cursor-pointer accent-dev-accent-blue disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={onRemoveColor}
          disabled={disabled}
          className="w-full rounded bg-dev-accent-blue px-3 py-2 text-sm font-medium text-white cursor-pointer transition-colors hover:bg-dev-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Remove Selected Color
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs text-dev-accent-red">{error}</p>
      ) : null}
    </div>
  )
}

export default StaticColorRemovalControls
