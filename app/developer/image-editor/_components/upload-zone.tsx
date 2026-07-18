import clsx from "clsx"
import { Upload } from "lucide-react"
import { match } from "ts-pattern"

type UploadZoneProps = {
  isDragOver: boolean
  multiple?: boolean
  onClick: () => void
  onDrop: (event: React.DragEvent) => void
  onDragOver: (event: React.DragEvent) => void
  onDragLeave: (event: React.DragEvent) => void
}

function UploadZone({
  isDragOver,
  multiple = false,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
}: UploadZoneProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={clsx(
        "flex flex-col items-center justify-center rounded-md border-2 border-dashed cursor-pointer transition-colors w-full text-left",
        "min-h-75 p-8",
        match(isDragOver)
          .with(true, () => "border-dev-accent-blue bg-dev-inset")
          .with(
            false,
            () =>
              "border-dev-border hover:border-dev-border-muted hover:bg-dev-inset",
          )
          .exhaustive(),
      )}
    >
      <Upload className="w-12 h-12 text-dev-text-secondary" />
      <p className="mt-3 text-sm font-medium text-dev-text">
        Drop {multiple ? "images" : "an image"} here, paste from clipboard, or
        click to browse
      </p>
      <p className="mt-1 text-xs text-dev-text-secondary">
        PNG, JPEG, WebP, and other image formats
      </p>
    </button>
  )
}

export default UploadZone
