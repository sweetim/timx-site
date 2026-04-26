"use client"

import classNames from "classnames"
import {
  Crop,
  Crosshair,
  Download,
  Maximize2,
  RotateCcw,
  Upload,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"

type CropRect = {
  x: number
  y: number
  width: number
  height: number
}

type DragState = {
  type: "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"
  startX: number
  startY: number
  startCrop: CropRect
}

type Status =
  | { phase: "idle" }
  | {
      phase: "editing"
      imageUrl: string
      imageWidth: number
      imageHeight: number
    }
  | { phase: "cropped"; originalUrl: string; croppedUrl: string }

type AnchorMode = "center" | "edge"

type AspectRatioPreset = "free" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16"

type AspectRatioOption = {
  label: string
  preset: AspectRatioPreset
  ratio: number | null
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: "Free", preset: "free", ratio: null },
  { label: "1:1", preset: "1:1", ratio: 1 },
  { label: "4:3", preset: "4:3", ratio: 4 / 3 },
  { label: "3:4", preset: "3:4", ratio: 3 / 4 },
  { label: "16:9", preset: "16:9", ratio: 16 / 9 },
  { label: "9:16", preset: "9:16", ratio: 9 / 16 },
]

const DEFAULT_ASPECT_RATIO: AspectRatioPreset = "1:1"

const HANDLE_SIZE = 10
const MIN_CROP = 20

function getImageDisplayDimensions(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
) {
  const scale = Math.min(
    containerWidth / imageWidth,
    containerHeight / imageHeight,
  )
  return {
    displayWidth: Math.floor(imageWidth * scale),
    displayHeight: Math.floor(imageHeight * scale),
    scale,
  }
}

function getInitialCrop(
  displayWidth: number,
  displayHeight: number,
  aspectRatio: number | null,
): CropRect {
  const maxW = displayWidth * 0.6
  const maxH = displayHeight * 0.6

  let width: number
  let height: number

  if (aspectRatio === null) {
    width = maxW
    height = maxH
  } else {
    if (maxW / maxH > aspectRatio) {
      height = maxH
      width = height * aspectRatio
    } else {
      width = maxW
      height = width / aspectRatio
    }
  }

  return {
    x: (displayWidth - width) / 2,
    y: (displayHeight - height) / 2,
    width,
    height,
  }
}

function clampCrop(
  crop: CropRect,
  maxX: number,
  maxY: number,
  ratio: number | null,
): CropRect {
  let { x, y, width, height } = crop

  if (ratio !== null) {
    if (width / ratio > maxY) {
      height = maxY
      width = height * ratio
    } else {
      height = width / ratio
    }
    if (height * ratio > maxX) {
      width = maxX
      height = width / ratio
    }
  }

  width = Math.max(MIN_CROP, Math.min(width, maxX))
  height = Math.max(MIN_CROP, Math.min(height, maxY))
  x = Math.max(0, Math.min(x, maxX - width))
  y = Math.max(0, Math.min(y, maxY - height))
  return { x, y, width, height }
}

function applyAspectRatio(crop: CropRect, ratio: number | null): CropRect {
  if (ratio === null) return crop
  const cx = crop.x + crop.width / 2
  const cy = crop.y + crop.height / 2
  const currentRatio = crop.width / crop.height
  if (currentRatio > ratio) {
    const newWidth = crop.height * ratio
    return {
      x: cx - newWidth / 2,
      y: crop.y,
      width: newWidth,
      height: crop.height,
    }
  }
  const newHeight = crop.width / ratio
  return {
    x: crop.x,
    y: cy - newHeight / 2,
    width: crop.width,
    height: newHeight,
  }
}

function computeEdgeResize(
  dragType: DragState["type"],
  dx: number,
  dy: number,
  sc: CropRect,
  ratio: number | null,
): CropRect {
  let { x, y, width, height } = sc

  match(dragType)
    .with("se", () => {
      width += dx
      height += dy
    })
    .with("sw", () => {
      x += dx
      width -= dx
      height += dy
    })
    .with("ne", () => {
      width += dx
      y += dy
      height -= dy
    })
    .with("nw", () => {
      x += dx
      y += dy
      width -= dx
      height -= dy
    })
    .with("e", () => {
      width += dx
    })
    .with("w", () => {
      x += dx
      width -= dx
    })
    .with("s", () => {
      height += dy
    })
    .with("n", () => {
      y += dy
      height -= dy
    })
    .with("move", () => {})
    .exhaustive()

  if (ratio !== null) {
    const newH = width / ratio
    if (dragType === "n" || dragType === "nw" || dragType === "ne") {
      y = y + height - newH
    }
    height = newH
  }

  return { x, y, width, height }
}

function computeCenterResize(
  dragType: DragState["type"],
  dx: number,
  dy: number,
  sc: CropRect,
  ratio: number | null,
): CropRect {
  const cx = sc.x + sc.width / 2
  const cy = sc.y + sc.height / 2

  const isLeft = dragType === "nw" || dragType === "w" || dragType === "sw"
  const isTop = dragType === "nw" || dragType === "n" || dragType === "ne"

  const expandX = isLeft ? -dx : dx
  const expandY = isTop ? -dy : dy

  if (ratio === null) {
    const newW = Math.max(MIN_CROP, sc.width + expandX * 2)
    const newH = Math.max(MIN_CROP, sc.height + expandY * 2)
    return { x: cx - newW / 2, y: cy - newH / 2, width: newW, height: newH }
  }

  const signedDist =
    Math.abs(expandX) > Math.abs(expandY) ? expandX : expandY * ratio
  const newW = Math.max(MIN_CROP, sc.width + signedDist * 2)
  const newH = Math.max(MIN_CROP, newW / ratio)
  return { x: cx - newW / 2, y: cy - newH / 2, width: newW, height: newH }
}

function getCursorForHandle(type: DragState["type"]) {
  return match(type)
    .with("move", () => "move" as const)
    .with("nw", () => "nw-resize" as const)
    .with("ne", () => "ne-resize" as const)
    .with("sw", () => "sw-resize" as const)
    .with("se", () => "se-resize" as const)
    .with("n", () => "n-resize" as const)
    .with("s", () => "s-resize" as const)
    .with("e", () => "e-resize" as const)
    .with("w", () => "w-resize" as const)
    .exhaustive()
}

function UploadZone({
  isDragOver,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
}: {
  isDragOver: boolean
  onClick: () => void
  onDrop: (event: React.DragEvent) => void
  onDragOver: (event: React.DragEvent) => void
  onDragLeave: (event: React.DragEvent) => void
}) {
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
        Drop an image here, paste from clipboard, or click to browse
      </p>
      <p className="mt-1 text-xs text-dev-text-secondary">PNG, JPEG, or WebP</p>
    </button>
  )
}

function CropOverlay({
  crop,
  anchorMode,
  onDragStart,
}: {
  crop: CropRect
  anchorMode: AnchorMode
  onDragStart: (drag: DragState) => void
}) {
  const handleHalf = HANDLE_SIZE / 2
  const handles: { type: DragState["type"]; style: React.CSSProperties }[] = [
    {
      type: "nw",
      style: { left: crop.x - handleHalf, top: crop.y - handleHalf },
    },
    {
      type: "ne",
      style: {
        left: crop.x + crop.width - handleHalf,
        top: crop.y - handleHalf,
      },
    },
    {
      type: "sw",
      style: {
        left: crop.x - handleHalf,
        top: crop.y + crop.height - handleHalf,
      },
    },
    {
      type: "se",
      style: {
        left: crop.x + crop.width - handleHalf,
        top: crop.y + crop.height - handleHalf,
      },
    },
    {
      type: "n",
      style: {
        left: crop.x + crop.width / 2 - handleHalf,
        top: crop.y - handleHalf,
      },
    },
    {
      type: "s",
      style: {
        left: crop.x + crop.width / 2 - handleHalf,
        top: crop.y + crop.height - handleHalf,
      },
    },
    {
      type: "e",
      style: {
        left: crop.x + crop.width - handleHalf,
        top: crop.y + crop.height / 2 - handleHalf,
      },
    },
    {
      type: "w",
      style: {
        left: crop.x - handleHalf,
        top: crop.y + crop.height / 2 - handleHalf,
      },
    },
  ]

  return (
    <div
      className="absolute inset-0"
      role="application"
      aria-label="Image crop area"
    >
      <div
        className="absolute inset-0 bg-black/70"
        style={{
          clipPath: `polygon(
            evenodd,
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% 0%,
            ${crop.x}px ${crop.y}px,
            ${crop.x + crop.width}px ${crop.y}px,
            ${crop.x + crop.width}px ${crop.y + crop.height}px,
            ${crop.x}px ${crop.y + crop.height}px,
            ${crop.x}px ${crop.y}px
          )`,
        }}
      />
      <div
        className="absolute pointer-events-none border-2 border-white/70"
        style={{
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.3)",
        }}
      />
      <button
        type="button"
        aria-label="Move crop area"
        className="absolute border-2 border-white/70 bg-transparent"
        style={{
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
          cursor: anchorMode === "edge" ? "move" : "default",
          pointerEvents: anchorMode === "edge" ? "auto" : "none",
        }}
        onMouseDown={(e) => {
          if (anchorMode !== "edge") return
          e.preventDefault()
          onDragStart({
            type: "move",
            startX: e.clientX,
            startY: e.clientY,
            startCrop: { ...crop },
          })
        }}
      />
      {handles.map(({ type, style }) => (
        <button
          key={type}
          type="button"
          aria-label={`Resize ${type}`}
          className="absolute bg-white border border-dev-border rounded-sm"
          style={{
            ...style,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            cursor: getCursorForHandle(type),
            zIndex: 10,
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDragStart({
              type,
              startX: e.clientX,
              startY: e.clientY,
              startCrop: { ...crop },
            })
          }}
        />
      ))}
    </div>
  )
}

function ImageCropper() {
  const [status, setStatus] = useState<Status>({ phase: "idle" })
  const [isDragOver, setIsDragOver] = useState(false)
  const [crop, setCrop] = useState<CropRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
    scale: 1,
  })
  const [anchorMode, setAnchorMode] = useState<AnchorMode>("center")
  const [aspectPreset, setAspectPreset] =
    useState<AspectRatioPreset>(DEFAULT_ASPECT_RATIO)

  const _currentRatio =
    ASPECT_RATIOS.find((r) => r.preset === aspectPreset)?.ratio ?? null

  const fileInputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const anchorModeRef = useRef(anchorMode)
  anchorModeRef.current = anchorMode
  const displayDimensionsRef = useRef(displayDimensions)
  displayDimensionsRef.current = displayDimensions
  const imageRef = useRef<HTMLImageElement | null>(null)

  const loadImage = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const containerWidth = wrapper.clientWidth
      const containerHeight = Math.max(wrapper.clientHeight, 400)
      const { displayWidth, displayHeight, scale } = getImageDisplayDimensions(
        img.naturalWidth,
        img.naturalHeight,
        containerWidth,
        containerHeight,
      )
      const ratio =
        ASPECT_RATIOS.find((r) => r.preset === DEFAULT_ASPECT_RATIO)?.ratio
        ?? null
      setDisplayDimensions({
        width: displayWidth,
        height: displayHeight,
        scale,
      })
      setCrop(getInitialCrop(displayWidth, displayHeight, ratio))
      setAspectPreset(DEFAULT_ASPECT_RATIO)
      setStatus({
        phase: "editing",
        imageUrl: url,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
      })
    }
    img.src = url
  }, [])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0]
      if (file?.type.startsWith("image/")) {
        e.preventDefault()
        loadImage(file)
      }
    }
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [loadImage])

  const handleAspectRatioChange = useCallback(
    (preset: AspectRatioPreset) => {
      setAspectPreset(preset)
      const ratio =
        ASPECT_RATIOS.find((r) => r.preset === preset)?.ratio ?? null
      setCrop((prev) => {
        const withRatio = applyAspectRatio(prev, ratio)
        return clampCrop(
          withRatio,
          displayDimensions.width,
          displayDimensions.height,
          ratio,
        )
      })
    },
    [displayDimensions],
  )

  const handleDragStart = useCallback(
    (newDrag: DragState) => {
      const ratio =
        ASPECT_RATIOS.find((r) => r.preset === aspectPreset)?.ratio ?? null
      const handleMove = (e: MouseEvent) => {
        const dx = e.clientX - newDrag.startX
        const dy = e.clientY - newDrag.startY
        const sc = newDrag.startCrop
        const maxX = displayDimensions.width
        const maxY = displayDimensions.height

        const next = match(newDrag.type)
          .with("move", () => ({
            x: sc.x + dx,
            y: sc.y + dy,
            width: sc.width,
            height: sc.height,
          }))
          .otherwise(() =>
            match(anchorMode)
              .with("edge", () =>
                computeEdgeResize(newDrag.type, dx, dy, sc, ratio),
              )
              .with("center", () =>
                computeCenterResize(newDrag.type, dx, dy, sc, ratio),
              )
              .exhaustive(),
          )

        setCrop(clampCrop(next, maxX, maxY, ratio))
      }
      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove)
        window.removeEventListener("mouseup", handleUp)
        if (anchorModeRef.current === "center") {
          const dims = displayDimensionsRef.current
          const r =
            ASPECT_RATIOS.find((ar) => ar.preset === aspectPreset)?.ratio
            ?? null
          setCrop((prev) => {
            const imageCx = dims.width / 2
            const imageCy = dims.height / 2
            return clampCrop(
              {
                x: imageCx - prev.width / 2,
                y: imageCy - prev.height / 2,
                width: prev.width,
                height: prev.height,
              },
              dims.width,
              dims.height,
              r,
            )
          })
        }
      }
      window.addEventListener("mousemove", handleMove)
      window.addEventListener("mouseup", handleUp)
    },
    [displayDimensions, anchorMode, aspectPreset],
  )

  const handleCrop = useCallback(() => {
    if (status.phase !== "editing") return
    const img = imageRef.current
    if (!img) return

    const { scale } = displayDimensions
    const sourceX = crop.x / scale
    const sourceY = crop.y / scale
    const sourceWidth = crop.width / scale
    const sourceHeight = crop.height / scale

    const canvas = document.createElement("canvas")
    canvas.width = Math.round(sourceWidth)
    canvas.height = Math.round(sourceHeight)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    canvas.toBlob((blob) => {
      if (!blob) return
      const croppedUrl = URL.createObjectURL(blob)
      setStatus({ phase: "cropped", originalUrl: status.imageUrl, croppedUrl })
    }, "image/png")
  }, [status, crop, displayDimensions])

  const handleDownload = useCallback(() => {
    if (status.phase !== "cropped") return
    const a = document.createElement("a")
    a.href = status.croppedUrl
    a.download = "cropped-image.png"
    a.click()
  }, [status])

  const handleReset = useCallback(() => {
    match(status)
      .with({ phase: "idle" }, () => {})
      .with({ phase: "editing" }, ({ imageUrl }) => {
        URL.revokeObjectURL(imageUrl)
      })
      .with({ phase: "cropped" }, ({ originalUrl, croppedUrl }) => {
        URL.revokeObjectURL(originalUrl)
        URL.revokeObjectURL(croppedUrl)
      })
      .exhaustive()
    setStatus({ phase: "idle" })
    setCrop({ x: 0, y: 0, width: 0, height: 0 })
    imageRef.current = null
  }, [status])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file?.type.startsWith("image/")) loadImage(file)
    },
    [loadImage],
  )

  return (
    <div className="flex flex-col h-full bg-dev-canvas">
      <div className="flex-1 overflow-auto">
        <div
          className="max-w-4xl mx-auto px-6 py-8"
          ref={wrapperRef}
        >
          <h1 className="text-2xl font-semibold text-dev-text mb-1">
            Image Cropper
          </h1>
          <p className="text-sm text-dev-text-secondary mb-6">
            Upload an image, choose an aspect ratio and anchor mode, then crop
            and download. Everything runs locally in your browser.
          </p>

          {match(status)
            .with({ phase: "idle" }, () => (
              <UploadZone
                isDragOver={isDragOver}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
              />
            ))
            .with({ phase: "editing" }, ({ imageUrl }) => (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    {ASPECT_RATIOS.map(({ label, preset }) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAspectRatioChange(preset)}
                        className={classNames(
                          "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                          aspectPreset === preset
                            ? "bg-dev-accent-blue text-white"
                            : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 border-l border-dev-border pl-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAnchorMode("center")
                        if (status.phase === "editing") {
                          setCrop((prev) => {
                            const imageCx = displayDimensions.width / 2
                            const imageCy = displayDimensions.height / 2
                            const r =
                              ASPECT_RATIOS.find(
                                (ar) => ar.preset === aspectPreset,
                              )?.ratio ?? null
                            return clampCrop(
                              {
                                x: imageCx - prev.width / 2,
                                y: imageCy - prev.height / 2,
                                width: prev.width,
                                height: prev.height,
                              },
                              displayDimensions.width,
                              displayDimensions.height,
                              r,
                            )
                          })
                        }
                      }}
                      title="Expand from center"
                      className={classNames(
                        "p-1.5 rounded transition-colors",
                        anchorMode === "center"
                          ? "bg-dev-accent-blue text-white"
                          : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                      )}
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnchorMode("edge")}
                      title="Fixed opposite edge"
                      className={classNames(
                        "p-1.5 rounded transition-colors",
                        anchorMode === "edge"
                          ? "bg-dev-accent-blue text-white"
                          : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                      )}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div
                  className="relative bg-dev-inset rounded-md overflow-hidden select-none"
                  style={{
                    width: displayDimensions.width,
                    height: displayDimensions.height,
                  }}
                >
                  {/* biome-ignore lint/performance/noImgElement: blob URL from URL.createObjectURL is incompatible with next/image */}
                  <img
                    src={imageUrl}
                    alt="Source"
                    className="block"
                    draggable={false}
                    style={{
                      width: displayDimensions.width,
                      height: displayDimensions.height,
                    }}
                  />
                  <CropOverlay
                    crop={crop}
                    anchorMode={anchorMode}
                    onDragStart={handleDragStart}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCrop}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-blue text-white hover:bg-dev-accent-blue/90 transition-colors"
                  >
                    <Crop className="w-4 h-4" />
                    Crop
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
              </div>
            ))
            .with({ phase: "cropped" }, ({ croppedUrl }) => (
              <div className="flex flex-col gap-4">
                <div className="bg-dev-inset rounded-md p-4 inline-block">
                  {/* biome-ignore lint/performance/noImgElement: blob URL from canvas.toBlob is incompatible with next/image */}
                  <img
                    src={croppedUrl}
                    alt="Cropped result"
                    className="block max-w-full rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-green text-white hover:bg-dev-accent-green/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-button text-dev-text hover:bg-dev-button-hover transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New Image
                  </button>
                </div>
              </div>
            ))
            .exhaustive()}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) loadImage(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}

export default ImageCropper
