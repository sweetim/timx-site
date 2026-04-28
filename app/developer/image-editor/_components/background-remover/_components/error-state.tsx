import { CircleX } from "lucide-react"

type ErrorStateProps = {
  message: string
  onReset: () => void
}

function ErrorState({ message, onReset }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dev-accent-red/30 bg-dev-inset min-h-[300px] p-8">
      <CircleX className="w-8 h-8 text-dev-accent-red" />
      <p className="mt-3 text-sm text-dev-accent-red">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 px-4 py-1.5 text-sm rounded bg-dev-button hover:bg-dev-button-hover text-dev-text transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  )
}

export default ErrorState
