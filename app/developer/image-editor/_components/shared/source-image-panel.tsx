import { Check, CircleX, LoaderCircle, Plus, Trash2 } from "lucide-react"
import type { SourceImage } from "../image-editor"

type ImageStatus = "processing" | "done" | "error"

type SourceImagePanelProps = {
  sourceImages: SourceImage[]
  activeSourceId: string | null
  onSelectSource: (id: string) => void
  onRemoveSourceImage?: ((id: string) => void) | undefined
  onRemoveActiveSource?: (() => void) | undefined
  onAddSourceImages?: ((files: File[]) => Promise<SourceImage[]>) | undefined
  sourceFileInputRef: React.RefObject<HTMLInputElement | null>
  imageStatuses?: Record<string, ImageStatus>
}

function SourceImagePanel({
  sourceImages,
  activeSourceId,
  onSelectSource,
  onRemoveSourceImage,
  onRemoveActiveSource,
  onAddSourceImages,
  sourceFileInputRef,
  imageStatuses,
}: SourceImagePanelProps) {
  if (sourceImages.length === 0) return null

  return (
    <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
          Source
        </p>
        {onAddSourceImages && (
          <button
            type="button"
            onClick={() => sourceFileInputRef.current?.click()}
            aria-label="Add source images"
            className="rounded bg-dev-button px-2 py-1 text-xs font-medium text-dev-text cursor-pointer transition-colors hover:bg-dev-button-hover"
          >
            <Plus className="size-3" />
          </button>
        )}
      </div>
      <div className="mt-3 grid max-h-52 gap-2 overflow-y-auto">
        {sourceImages.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => onSelectSource(img.id)}
            className={`no-bounce flex min-w-0 items-center gap-2 overflow-hidden rounded border p-2 text-left cursor-pointer transition-colors ${
              activeSourceId === img.id
                ? "border-dev-accent-blue bg-dev-accent-blue/10"
                : "border-dev-border bg-dev-inset hover:bg-dev-button-hover/50"
            }`}
          >
            {/* biome-ignore lint/performance/noImgElement: blob URL preview in source picker */}
            <img
              src={img.url}
              alt={img.name}
              className="h-10 w-7 shrink-0 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-dev-text">
                {img.name}
              </p>
              <p className="text-[11px] text-dev-text-secondary">
                {img.naturalWidth}×{img.naturalHeight}
              </p>
            </div>
            {imageStatuses?.[img.id] && (
              <span className="shrink-0">
                {imageStatuses[img.id] === "processing" && (
                  <LoaderCircle className="size-3.5 text-dev-accent-blue animate-spin" />
                )}
                {imageStatuses[img.id] === "done" && (
                  <Check className="size-3.5 text-dev-accent-green" />
                )}
                {imageStatuses[img.id] === "error" && (
                  <CircleX className="size-3.5 text-dev-accent-red" />
                )}
              </span>
            )}
            {onRemoveSourceImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (activeSourceId === img.id) onRemoveActiveSource?.()
                  onRemoveSourceImage(img.id)
                }}
                aria-label="Remove source image"
                className="shrink-0 rounded p-1 text-dev-text-secondary cursor-pointer transition-colors hover:bg-dev-button-hover hover:text-dev-accent-red"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SourceImagePanel
