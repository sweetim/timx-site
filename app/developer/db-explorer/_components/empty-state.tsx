"use client"

import { Database, Trash2, Upload } from "lucide-react"
import type { FC, ReactNode } from "react"
import type { RecentFile } from "./types"

type EmptyStateProps = {
  landingContent: ReactNode
  recentFiles: RecentFile[]
  onRemoveRecent: (name: string) => void
  onOpenRecent: (name: string) => void
  onOpenFilePicker: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const EmptyState: FC<EmptyStateProps> = ({
  landingContent,
  recentFiles,
  onRemoveRecent,
  onOpenRecent,
  onOpenFilePicker,
}) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="w-full max-w-2xl">
      {landingContent}
      {recentFiles.length > 0 && (
        <div className="mb-4 text-left max-w-lg mx-auto">
          <div className="text-xs text-dev-text-secondary uppercase tracking-wider mb-2 px-1">
            Recent files
          </div>
          <div className="flex flex-col gap-0.5">
            {recentFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between gap-2 px-2 py-1.5 rounded text-sm hover:bg-dev-surface group"
              >
                <button
                  type="button"
                  className="flex items-center gap-2 min-w-0 cursor-pointer text-left flex-1"
                  onClick={() => onOpenRecent(file.name)}
                >
                  <Database
                    size={14}
                    className="shrink-0 text-dev-text-secondary"
                  />
                  <span className="truncate text-dev-text">{file.name}</span>
                  <span className="shrink-0 text-dev-text-secondary text-xs">
                    {formatFileSize(file.size)}
                  </span>
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-dev-text-secondary">
                    {new Date(file.lastOpened).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    className="p-0.5 rounded hover:bg-dev-button transition-colors cursor-pointer text-dev-text-secondary opacity-0 group-hover:opacity-100"
                    onClick={() => onRemoveRecent(file.name)}
                    title="Remove"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-center mt-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer text-dev-text"
          onClick={onOpenFilePicker}
        >
          <Upload size={16} />
          Select .db file
        </button>
      </div>
    </div>
  </div>
)

export default EmptyState
