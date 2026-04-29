import { Copy, Download, Plus, Trash2 } from "lucide-react"
import type { DownloadFormat } from "../download-format-selector"
import {
  DownloadFormatSelector,
  downloadBlob,
} from "../download-format-selector"

type SidebarActionsProps = {
  primaryAction?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
    disabled?: boolean
  }
  download?: {
    url: string
    baseName: string
    format: DownloadFormat
    onFormatChange: (format: DownloadFormat) => void
  }
  showAddToSource?: boolean
  onAddToSource?: () => void
  showCopy?: boolean
  onCopyToClipboard?: () => void
  showClear?: boolean
  onClear?: () => void
}

function SidebarActions({
  primaryAction,
  download,
  showAddToSource,
  onAddToSource,
  showCopy,
  onCopyToClipboard,
  showClear,
  onClear,
}: SidebarActionsProps) {
  return (
    <div className="mt-3 grid gap-2">
      {primaryAction && (
        <button
          type="button"
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className="flex items-center justify-center gap-1.5 rounded bg-dev-accent-blue px-3 py-2 text-sm font-medium text-white cursor-pointer transition-colors hover:bg-dev-accent-blue/90 disabled:opacity-50"
        >
          {primaryAction.icon}
          {primaryAction.label}
        </button>
      )}
      {download && (
        <>
          <div className="rounded-md border border-dev-border bg-dev-surface p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
              Format
            </p>
            <div className="mt-2">
              <DownloadFormatSelector
                value={download.format}
                onChange={download.onFormatChange}
              />
            </div>
          </div>
          <DownloadButton
            url={download.url}
            baseName={download.baseName}
            format={download.format}
          />
        </>
      )}
      {showAddToSource && onAddToSource && (
        <button
          type="button"
          onClick={onAddToSource}
          className="flex items-center justify-center gap-1.5 rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text cursor-pointer transition-colors hover:bg-dev-button-hover"
        >
          <Plus className="size-4" />
          Add to Source
        </button>
      )}
      {showCopy && onCopyToClipboard && (
        <button
          type="button"
          onClick={onCopyToClipboard}
          className="flex items-center justify-center gap-1.5 rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text cursor-pointer transition-colors hover:bg-dev-button-hover"
        >
          <Copy className="size-4" />
          Copy to Clipboard
        </button>
      )}
      {showClear && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center justify-center gap-1.5 rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text cursor-pointer transition-colors hover:bg-dev-button-hover"
        >
          <Trash2 className="size-4" />
          Clear
        </button>
      )}
    </div>
  )
}

function DownloadButton({
  url,
  baseName,
  format,
}: {
  url: string
  baseName: string
  format: DownloadFormat
}) {
  return (
    <button
      type="button"
      onClick={() => void downloadBlob(url, baseName, format)}
      className="flex items-center justify-center gap-1.5 rounded bg-dev-accent-green px-3 py-2 text-sm font-medium text-white cursor-pointer transition-colors hover:bg-dev-accent-green/90"
    >
      <Download className="size-4" />
      Download
    </button>
  )
}

export default SidebarActions
