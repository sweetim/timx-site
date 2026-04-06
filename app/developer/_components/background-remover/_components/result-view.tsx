import { Download, Upload } from "lucide-react"
import ImageComparisonSlider from "../image-comparison-slider"

type ResultViewProps = {
  originalUrl: string
  resultUrl: string
  onDownload: () => void
  onReset: () => void
}

function ResultView({
  originalUrl,
  resultUrl,
  onDownload,
  onReset,
}: ResultViewProps) {
  return (
    <div className="space-y-4">
      <ImageComparisonSlider
        originalUrl={originalUrl}
        resultUrl={resultUrl}
      />
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-accent-blue hover:brightness-110 text-white transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Download PNG
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm rounded-full bg-dev-button hover:bg-dev-button-hover text-dev-text transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload image
        </button>
      </div>
    </div>
  )
}

export default ResultView
