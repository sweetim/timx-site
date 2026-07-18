"use client"

import clsx from "clsx"
import { encodeIco } from "./image-exporter/encode-ico"

type DownloadFormat = "png" | "jpeg" | "webp" | "ico"

type DownloadFormatOption = {
  label: string
  value: DownloadFormat
  mimeType: string
  extension: string
}

const DOWNLOAD_FORMATS: DownloadFormatOption[] = [
  { label: "PNG", value: "png", mimeType: "image/png", extension: "png" },
  { label: "JPEG", value: "jpeg", mimeType: "image/jpeg", extension: "jpg" },
  { label: "WebP", value: "webp", mimeType: "image/webp", extension: "webp" },
  { label: "ICO", value: "ico", mimeType: "image/x-icon", extension: "ico" },
]

function getFormatOption(format: DownloadFormat): DownloadFormatOption {
  const option = DOWNLOAD_FORMATS.find((f) => f.value === format)
  if (!option) throw new Error(`Unknown format: ${format}`)
  return option
}

async function downloadBlob(
  blobUrl: string,
  baseName: string,
  format: DownloadFormat,
): Promise<void> {
  const response = await fetch(blobUrl)
  const original = await response.blob()
  const option = getFormatOption(format)

  let finalBlob: Blob
  if (original.type === option.mimeType) {
    finalBlob = original
  } else if (format === "ico") {
    finalBlob = await encodeIco(blobUrl, [16, 32, 48])
  } else {
    finalBlob = await new Promise<Blob>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(original)
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const context = canvas.getContext("2d")
        if (!context) {
          URL.revokeObjectURL(objectUrl)
          reject(new Error("Canvas context unavailable"))
          return
        }
        if (format === "jpeg") {
          context.fillStyle = "#ffffff"
          context.fillRect(0, 0, canvas.width, canvas.height)
        }
        context.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl)
            if (blob) resolve(blob)
            else reject(new Error("Conversion failed"))
          },
          option.mimeType,
          0.92,
        )
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("Failed to load image"))
      }
      img.src = objectUrl
    })
  }

  const url = URL.createObjectURL(finalBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${baseName}.${option.extension}`
  link.click()
  URL.revokeObjectURL(url)
}

type DownloadFormatSelectorProps = {
  value: DownloadFormat
  onChange: (format: DownloadFormat) => void
}

function DownloadFormatSelector({
  value,
  onChange,
}: DownloadFormatSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {DOWNLOAD_FORMATS.map((format) => (
        <button
          key={format.value}
          type="button"
          onClick={() => onChange(format.value)}
          className={clsx(
            "rounded px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer",
            value === format.value
              ? "bg-dev-accent-blue text-white"
              : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
          )}
        >
          {format.label}
        </button>
      ))}
    </div>
  )
}

export type { DownloadFormat }
export {
  DOWNLOAD_FORMATS,
  DownloadFormatSelector,
  downloadBlob,
  getFormatOption,
}
export default DownloadFormatSelector
