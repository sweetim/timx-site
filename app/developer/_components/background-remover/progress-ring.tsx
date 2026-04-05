import {
  PROGRESS_RING_CIRCUMFERENCE,
  PROGRESS_RING_RADIUS,
  PROGRESS_RING_SIZE,
  PROGRESS_RING_STROKE,
} from "./constants"

function ProgressRing({ progress }: { progress: number }) {
  const offset = PROGRESS_RING_CIRCUMFERENCE * (1 - progress)
  return (
    <svg
      aria-hidden="true"
      width={PROGRESS_RING_SIZE}
      height={PROGRESS_RING_SIZE}
      className="transform -rotate-90"
    >
      <circle
        cx={PROGRESS_RING_SIZE / 2}
        cy={PROGRESS_RING_SIZE / 2}
        r={PROGRESS_RING_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={PROGRESS_RING_STROKE}
        className="text-dev-border"
      />
      <circle
        cx={PROGRESS_RING_SIZE / 2}
        cy={PROGRESS_RING_SIZE / 2}
        r={PROGRESS_RING_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={PROGRESS_RING_STROKE}
        strokeLinecap="round"
        className="text-dev-accent-blue"
        strokeDasharray={PROGRESS_RING_CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 0.3s ease",
          animation: "spinner-rotate 2s linear infinite",
        }}
      />
    </svg>
  )
}

export default ProgressRing
