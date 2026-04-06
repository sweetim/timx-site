import classNames from "classnames"
import { Upload } from "lucide-react"
import { match } from "ts-pattern"

type UploadZoneProps = {
  isDragOver: boolean
  onClick: () => void
  onDrop: (event: React.DragEvent) => void
  onDragOver: (event: React.DragEvent) => void
  onDragLeave: (event: React.DragEvent) => void
}

function UploadZone({
  isDragOver,
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
      className={classNames(
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
        Drop an image here, or click to browse
      </p>
      <p className="mt-1 text-xs text-dev-text-secondary">PNG, JPEG, or WebP</p>
    </button>
  )
}

export default UploadZone
