"use client"

import classNames from "classnames"
import { Download, Images, Plus, RotateCcw, Trash2, Upload } from "lucide-react"
import { useCallback, useRef, useState } from "react"

type ImageItem = {
  id: string
  file: File
  originalUrl: string
  element: HTMLImageElement
  naturalWidth: number
  naturalHeight: number
}

type ResizeMode = "cover" | "contain" | "stretch"

type ResizedItem = {
  id: string
  url: string
  fileName: string
}

const RESIZE_MODES: { value: ResizeMode; label: string }[] = [
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
  { value: "stretch", label: "Stretch" },
]

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage: `repeating-conic-gradient(#373e47 0% 25%, #2d333b 0% 50%)`,
  backgroundSize: "8px 8px",
}

function computeDrawParams(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
  mode: ResizeMode,
) {
  if (mode === "stretch") {
    return {
      sx: 0,
      sy: 0,
      sw: srcW,
      sh: srcH,
      dx: 0,
      dy: 0,
      dw: dstW,
      dh: dstH,
    }
  }

  const srcRatio = srcW / srcH
  const dstRatio = dstW / dstH

  if (mode === "cover") {
    if (srcRatio > dstRatio) {
      const sw = srcH * dstRatio
      return {
        sx: (srcW - sw) / 2,
        sy: 0,
        sw,
        sh: srcH,
        dx: 0,
        dy: 0,
        dw: dstW,
        dh: dstH,
      }
    }
    const sh = srcW / dstRatio
    return {
      sx: 0,
      sy: (srcH - sh) / 2,
      sw: srcW,
      sh,
      dx: 0,
      dy: 0,
      dw: dstW,
      dh: dstH,
    }
  }

  if (srcRatio > dstRatio) {
    const dh = dstW / srcRatio
    return {
      sx: 0,
      sy: 0,
      sw: srcW,
      sh: srcH,
      dx: 0,
      dy: (dstH - dh) / 2,
      dw: dstW,
      dh,
    }
  }
  const dw = dstH * srcRatio
  return {
    sx: 0,
    sy: 0,
    sw: srcW,
    sh: srcH,
    dx: (dstW - dw) / 2,
    dy: 0,
    dw,
    dh: dstH,
  }
}

function resizeImage(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  mode: ResizeMode,
  bgColor: string | null,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      resolve(null)
      return
    }

    if (mode === "contain" && bgColor !== null) {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, targetWidth, targetHeight)
    }

    const params = computeDrawParams(
      img.naturalWidth,
      img.naturalHeight,
      targetWidth,
      targetHeight,
      mode,
    )
    ctx.drawImage(
      img,
      params.sx,
      params.sy,
      params.sw,
      params.sh,
      params.dx,
      params.dy,
      params.dw,
      params.dh,
    )

    canvas.toBlob(resolve, "image/png")
  })
}

function ImageResizer() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [targetWidth, setTargetWidth] = useState(256)
  const [targetHeight, setTargetHeight] = useState(256)
  const [mode, setMode] = useState<ResizeMode>("cover")
  const [bgColor, setBgColor] = useState("#000000")
  const [transparentBg, setTransparentBg] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resized, setResized] = useState<ResizedItem[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    )
    if (imageFiles.length === 0) return

    const newItems: ImageItem[] = []
    let loaded = 0

    for (const file of imageFiles) {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        newItems.push({
          id: `${file.name}-${loaded}-${Date.now()}`,
          file,
          originalUrl: url,
          element: img,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        })
        loaded++
        if (loaded === imageFiles.length) {
          setImages((prev) => {
            const all = [...prev, ...newItems]
            if (prev.length === 0) {
              setTargetWidth(Math.min(...all.map((i) => i.naturalWidth)))
              setTargetHeight(Math.min(...all.map((i) => i.naturalHeight)))
            }
            return all
          })
        }
      }
      img.src = url
    }
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.originalUrl)
      return prev.filter((i) => i.id !== id)
    })
    setResized(null)
  }, [])

  const handleResize = useCallback(async () => {
    if (images.length === 0 || targetWidth < 1 || targetHeight < 1) return
    setIsProcessing(true)
    const results: ResizedItem[] = []
    for (const item of images) {
      const blob = await resizeImage(
        item.element,
        targetWidth,
        targetHeight,
        mode,
        transparentBg ? null : bgColor,
      )
      if (blob) {
        results.push({
          id: item.id,
          url: URL.createObjectURL(blob),
          fileName: `resized-${item.file.name.replace(/\.[^.]+$/, "")}.png`,
        })
      }
    }
    setResized(results)
    setIsProcessing(false)
  }, [images, targetWidth, targetHeight, mode, bgColor, transparentBg])

  const downloadFile = useCallback((item: ResizedItem) => {
    const a = document.createElement("a")
    a.href = item.url
    a.download = item.fileName
    a.click()
  }, [])

  const downloadAll = useCallback(() => {
    if (!resized) return
    for (let i = 0; i < resized.length; i++) {
      setTimeout(() => downloadFile(resized[i]), i * 150)
    }
  }, [resized, downloadFile])

  const handleReset = useCallback(() => {
    for (const img of images) URL.revokeObjectURL(img.originalUrl)
    if (resized) for (const r of resized) URL.revokeObjectURL(r.url)
    setImages([])
    setResized(null)
    setTargetWidth(256)
    setTargetHeight(256)
    setMode("cover")
    setTransparentBg(true)
  }, [images, resized])

  return (
    <div className="flex flex-col h-full bg-dev-canvas">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-dev-text mb-1">
            Image Resizer
          </h1>
          <p className="text-sm text-dev-text-secondary mb-6">
            Upload multiple images and resize them to the same dimensions.
            Everything runs locally in your browser.
          </p>

          {images.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                addFiles(e.dataTransfer.files)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              className={classNames(
                "flex flex-col items-center justify-center rounded-md border-2 border-dashed cursor-pointer transition-colors w-full min-h-75 p-8",
                isDragOver
                  ? "border-dev-accent-blue bg-dev-inset"
                  : "border-dev-border hover:border-dev-border-muted hover:bg-dev-inset",
              )}
            >
              <Upload className="w-12 h-12 text-dev-text-secondary" />
              <p className="mt-3 text-sm font-medium text-dev-text">
                Drop images here, or click to browse
              </p>
              <p className="mt-1 text-xs text-dev-text-secondary">
                PNG, JPEG, or WebP — select multiple files
              </p>
            </button>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-medium text-dev-text mb-2">
                  Uploaded Images ({images.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {images.map((item) => (
                    <div
                      key={item.id}
                      className="relative group"
                    >
                      {/* biome-ignore lint/performance/noImgElement: blob URL */}
                      <img
                        src={item.originalUrl}
                        alt={item.file.name}
                        className="h-20 w-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(item.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-dev-accent-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <p className="text-[10px] text-dev-text-secondary mt-1 text-center">
                        {item.naturalWidth}×{item.naturalHeight}
                      </p>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 w-20 border-2 border-dashed border-dev-border rounded flex items-center justify-center hover:border-dev-border-muted transition-colors"
                  >
                    <Plus className="w-5 h-5 text-dev-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dev-text-secondary">Width</span>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) =>
                      setTargetWidth(Math.max(1, Number(e.target.value)))
                    }
                    className="w-20 px-2 py-1 rounded text-sm bg-dev-inset border border-dev-border text-dev-text"
                    min={1}
                  />
                  <span className="text-xs text-dev-text-secondary">px</span>
                </div>
                <span className="text-dev-text-secondary">×</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dev-text-secondary">
                    Height
                  </span>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) =>
                      setTargetHeight(Math.max(1, Number(e.target.value)))
                    }
                    className="w-20 px-2 py-1 rounded text-sm bg-dev-inset border border-dev-border text-dev-text"
                    min={1}
                  />
                  <span className="text-xs text-dev-text-secondary">px</span>
                </div>
                <div className="w-px h-6 bg-dev-border" />
                <div className="flex items-center gap-1">
                  {RESIZE_MODES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMode(value)}
                      className={classNames(
                        "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                        mode === value
                          ? "bg-dev-accent-blue text-white"
                          : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {mode === "contain" && (
                  <>
                    <div className="w-px h-6 bg-dev-border" />
                    <button
                      type="button"
                      onClick={() => setTransparentBg(!transparentBg)}
                      className={classNames(
                        "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                        transparentBg
                          ? "bg-dev-accent-blue text-white"
                          : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                      )}
                    >
                      Transparent
                    </button>
                    {!transparentBg && (
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border border-dev-border"
                      />
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResize}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-blue text-white hover:bg-dev-accent-blue/90 transition-colors disabled:opacity-50"
                >
                  <Images className="w-4 h-4" />
                  {isProcessing ? "Processing\u2026" : "Resize"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-button text-dev-text hover:bg-dev-button-hover transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              {resized && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-dev-text">
                      Preview — {targetWidth}×{targetHeight}
                    </h3>
                    <button
                      type="button"
                      onClick={downloadAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-green text-white hover:bg-dev-accent-green/90 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {resized.map((item) => (
                      <div
                        key={item.id}
                        className="bg-dev-inset rounded-md p-3 flex flex-col items-center gap-2"
                        style={
                          mode === "contain" && transparentBg
                            ? CHECKERBOARD_STYLE
                            : undefined
                        }
                      >
                        {/* biome-ignore lint/performance/noImgElement: blob URL */}
                        <img
                          src={item.url}
                          alt={item.fileName}
                          className="max-w-full rounded"
                        />
                        <p className="text-xs text-dev-text-secondary truncate w-full text-center">
                          {item.fileName}
                        </p>
                        <button
                          type="button"
                          onClick={() => downloadFile(item)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-dev-button text-dev-text hover:bg-dev-button-hover transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files)
          e.target.value = ""
        }}
      />
    </div>
  )
}

export default ImageResizer
