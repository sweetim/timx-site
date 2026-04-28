import { Upload } from "lucide-react"
import type { CanvasDropProps } from "./image-editor"

function CanvasDropOverlay({
  isDragOver,
  overlayLabel,
}: Pick<CanvasDropProps, "isDragOver" | "overlayLabel">) {
  if (!isDragOver) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-dev-canvas/80 backdrop-blur-sm">
      <div className="rounded-xl border-2 border-dashed border-dev-accent-blue p-8">
        <Upload className="mx-auto size-10 text-dev-accent-blue" />
        <p className="mt-3 text-sm font-medium text-dev-text">
          {overlayLabel}
        </p>
      </div>
    </div>
  )
}

export default CanvasDropOverlay
