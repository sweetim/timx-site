import clsx from "clsx"
import { AlertTriangle, Info, X } from "lucide-react"
import type { Suggestion } from "./types"

function SuggestionItem({ suggestion }: { suggestion: Suggestion }) {
  const config = {
    error: {
      icon: X,
      color: "text-dev-accent-red",
      bg: "bg-dev-accent-red/10",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-dev-accent-orange",
      bg: "bg-dev-accent-orange/10",
    },
    info: {
      icon: Info,
      color: "text-dev-accent-blue",
      bg: "bg-dev-accent-blue/10",
    },
  }[suggestion.severity]

  const Icon = config.icon
  return (
    <div
      className={clsx("flex items-start gap-2 p-2 rounded text-sm", config.bg)}
    >
      <Icon className={clsx("size-4 shrink-0 mt-0.5", config.color)} />
      <div className="min-w-0">
        <span className={clsx("font-medium capitalize text-xs", config.color)}>
          {suggestion.severity}
        </span>
        <p className="text-dev-text">{suggestion.message}</p>
        {suggestion.path && (
          <p className="text-xs text-dev-text-secondary font-mono">
            {suggestion.path}
          </p>
        )}
      </div>
    </div>
  )
}

export { SuggestionItem }
