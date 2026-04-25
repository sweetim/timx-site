"use client"

import classNames from "classnames"
import { Crop, Download, RotateCcw, Upload } from "lucide-react"
import { match } from "ts-pattern"
import { useCallback, useRef, useState } from "react"

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
  | { phase: "editing"; imageUrl: string; imageWidth: number; imageHeight: number }
  | { phase: "cropped"; originalUrl: string; croppedUrl: string }

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

function getInitialCrop(displayWidth: number, displayHeight: number): CropRect {
  const size = Math.min(displayWidth, displayHeight) * 0.6
  return {
    x: (displayWidth - size) / 2,
    y: (displayHeight - size) / 2,
    width: size,
    height: size,
  }
}

function clampCrop(crop: CropRect, maxX: number, maxY: number): CropRect {
  let { x, y, width, height } = crop
  width = Math.max(MIN_CROP, Math.min(width, maxX))
  height = Math.max(MIN_CROP, Math.min(height, maxY))
  x = Math.max(0, Math.min(x, maxX - width))
  y = Math.max(0, Math.min(y, maxY - height))
  return { x, y, width, height }
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
        Drop an image here, or click to browse
      </p>
      <p className="mt-1 text-xs text-dev-text-secondary">PNG, JPEG, or WebP</p>
    </button>
  )
}

function CropOverlay({
  crop,
  onDragStart,
}: {
  crop: CropRect
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
      style: { left: crop.x + crop.width - handleHalf, top: crop.y - handleHalf },
    },
    {
      type: "sw",
      style: { left: crop.x - handleHalf, top: crop.y + crop.height - handleHalf },
    },
    {
      type: "se",
      style: { left: crop.x + crop.width - handleHalf, top: crop.y + crop.height - handleHalf },
    },
    {
      type: "n",
      style: { left: crop.x + crop.width / 2 - handleHalf, top: crop.y - handleHalf },
    },
    {
      type: "s",
      style: { left: crop.x + crop.width / 2 - handleHalf, top: crop.y + crop.height - handleHalf },
    },
    {
      type: "e",
      style: { left: crop.x + crop.width - handleHalf, top: crop.y + crop.height / 2 - handleHalf },
    },
    {
      type: "w",
      style: { left: crop.x - handleHalf, top: crop.y + crop.height / 2 - handleHalf },
    },
  ]

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `
            0 0 0 9999px rgba(0, 0, 0, 0.5),
            inset 0 0 0 1px rgba(255, 255, 255, 0.3)
          `,
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
        className="absolute border-2 border-white/70"
        style={{
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
          cursor: "move",
        }}
        onMouseDown={(e) => {
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
        <div
          key={type}
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
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 })
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0, scale: 1 })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
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
      setDisplayDimensions({ width: displayWidth, height: displayHeight, scale })
      setCrop(getInitialCrop(displayWidth, displayHeight))
      setStatus({
        phase: "editing",
        imageUrl: url,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
      })
    }
    img.src = url
  }, [])

  const handleDragStart = useCallback(
    (newDrag: DragState) => {
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
          .with("nw", () => ({
            x: sc.x + dx,
            y: sc.y + dy,
            width: sc.width - dx,
            height: sc.height - dy,
          }))
          .with("ne", () => ({
            x: sc.x,
            y: sc.y + dy,
            width: sc.width + dx,
            height: sc.height - dy,
          }))
          .with("sw", () => ({
            x: sc.x + dx,
            y: sc.y,
            width: sc.width - dx,
            height: sc.height + dy,
          }))
          .with("se", () => ({
            x: sc.x,
            y: sc.y,
            width: sc.width + dx,
            height: sc.height + dy,
          }))
          .with("n", () => ({
            x: sc.x,
            y: sc.y + dy,
            width: sc.width,
            height: sc.height - dy,
          }))
          .with("s", () => ({
            x: sc.x,
            y: sc.y,
            width: sc.width,
            height: sc.height + dy,
          }))
          .with("e", () => ({
            x: sc.x,
            y: sc.y,
            width: sc.width + dx,
            height: sc.height,
          }))
          .with("w", () => ({
            x: sc.x + dx,
            y: sc.y,
            width: sc.width - dx,
            height: sc.height,
          }))
          .exhaustive()

        setCrop(clampCrop(next, maxX, maxY))
      }
      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove)
        window.removeEventListener("mouseup", handleUp)
      }
      window.addEventListener("mousemove", handleMove)
      window.addEventListener("mouseup", handleUp)
    },
    [displayDimensions],
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
    if (status.phase !== "idle") {
      const urls =
        status.phase === "editing"
          ? [status.imageUrl]
          : [status.originalUrl, status.croppedUrl]
      for (const url of urls) URL.revokeObjectURL(url)
    }
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
        <div className="max-w-4xl mx-auto px-6 py-8" ref={wrapperRef}>
          <h1 className="text-2xl font-semibold text-dev-text mb-1">
            Image Cropper
          </h1>
          <p className="text-sm text-dev-text-secondary mb-6">
            Upload an image, drag the crop area to adjust, then crop and
            download. Everything runs locally in your browser.
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
                <div
                  className="relative bg-dev-inset rounded-md overflow-hidden select-none"
                  style={{
                    width: displayDimensions.width,
                    height: displayDimensions.height,
                  }}
                >
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
                  <CropOverlay crop={crop} onDragStart={handleDragStart} />
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
