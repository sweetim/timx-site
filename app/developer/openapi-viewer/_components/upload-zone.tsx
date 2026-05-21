import { Clipboard, FileText, FileUp, Trash2 } from "lucide-react"
import type { ChangeEvent, DragEvent, RefObject } from "react"
import type { RecentFileWithLabel } from "../_lib/recent-files"

function UploadZone({
  recentFiles,
  fileInputRef,
  onDrop,
  onDragOver,
  onInputChange,
  onOpenFilePicker,
  onLoadRecent,
  onRemoveRecent,
}: {
  recentFiles: RecentFileWithLabel[]
  fileInputRef: RefObject<HTMLInputElement | null>
  onDrop: (e: DragEvent) => void
  onDragOver: (e: DragEvent) => void
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  onOpenFilePicker: () => void
  onLoadRecent: (fileName: string, source: "file" | "paste") => void
  onRemoveRecent: (e: React.MouseEvent, fileName: string) => void
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <button
        type="button"
        className="w-full border-2 border-dashed border-dev-border-muted rounded-lg p-12 text-center hover:border-dev-link transition-colors cursor-pointer bg-transparent"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={onOpenFilePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpenFilePicker()
        }}
      >
        <FileUp className="size-12 text-dev-text-secondary mx-auto mb-4" />
        <p className="text-dev-text mb-2">
          Drop your OpenAPI JSON or YAML file here
        </p>
        <p className="text-sm text-dev-text-secondary mb-1">
          or click to browse
        </p>
        <p className="text-sm text-dev-text-secondary mb-4">
          or paste directly on this page
        </p>
        <p className="text-xs text-dev-text-secondary">
          Supports OpenAPI 3.x JSON and YAML
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.yaml,.yml"
          className="hidden"
          onChange={onInputChange}
        />
      </button>
      {recentFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-medium text-dev-text-secondary uppercase tracking-wider mb-2">
            Recent Files
          </h3>
          <div className="space-y-1">
            {recentFiles.map((file) => (
              <button
                key={file.fileName}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-dev-inset transition-colors cursor-pointer text-left group"
                onClick={() => onLoadRecent(file.fileName, file.source)}
              >
                {file.source === "paste" ? (
                  <Clipboard className="size-4 text-dev-text-secondary shrink-0" />
                ) : (
                  <FileText className="size-4 text-dev-text-secondary shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-dev-text truncate">
                    {file.fileName}
                  </div>
                  <div className="text-xs text-dev-text-secondary truncate">
                    {file.title} v{file.version}
                  </div>
                </div>
                <span className="text-xs text-dev-text-secondary shrink-0">
                  {file.relativeTime}
                </span>
                <Trash2
                  className="size-3.5 text-dev-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:text-dev-accent-red"
                  onClick={(e) => onRemoveRecent(e, file.fileName)}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { UploadZone }
