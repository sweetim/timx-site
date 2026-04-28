import { Download, Trash2 } from "lucide-react"
import type { DownloadFormat } from "../../download-format-selector"
import { DownloadFormatSelector } from "../../download-format-selector"
import ImageComparisonSlider from "../image-comparison-slider"

type ResultViewProps = {
  originalUrl: string
  resultUrl: string
  downloadFormat: DownloadFormat
  onDownload: () => void
  onFormatChange: (format: DownloadFormat) => void
  onReset: () => void
  hideActions?: boolean
}

function ResultView({
  originalUrl,
  resultUrl,
  downloadFormat,
  onDownload,
  onFormatChange,
  onReset,
  hideActions = false,
}: ResultViewProps) {
  return (
    <div className="space-y-4">
      <ImageComparisonSlider
        originalUrl={originalUrl}
        resultUrl={resultUrl}
      />
      {!hideActions && (
        <div className="max-w-sm mx-auto space-y-3">
          <DownloadFormatSelector
            value={downloadFormat}
            onChange={onFormatChange}
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-accent-blue hover:brightness-110 text-white transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-button hover:bg-dev-button-hover text-dev-text transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultView
