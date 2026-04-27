"use client"

import classNames from "classnames"
import {
  ArrowDown,
  ArrowRight,
  Download,
  Images,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

type ImageItem = {
  id: string
  file: File
  originalUrl: string
  element: HTMLImageElement
  naturalWidth: number
  naturalHeight: number
}

type StackDirection = "horizontal" | "vertical"

type ContentAlignment = "start" | "center" | "end"

type StitchedImage = {
  url: string
  fileName: string
  width: number
  height: number
}

type ScreenshotStitcherProps = {
  variant?: "page" | "panel"
}

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage: `repeating-conic-gradient(#373e47 0% 25%, #2d333b 0% 50%)`,
  backgroundSize: "8px 8px",
}

const ALIGNMENT_OPTIONS: { value: ContentAlignment; label: string }[] = [
  { value: "start", label: "Top" },
  { value: "center", label: "Center" },
  { value: "end", label: "Bottom" },
]

function loadImageFile(file: File, index: number): Promise<ImageItem | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      resolve({
        id: `${file.name}-${file.lastModified}-${index}-${Date.now()}`,
        file,
        originalUrl: url,
        element: image,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    image.src = url
  })
}

function getDrawParams(
  image: HTMLImageElement,
  frameWidth: number,
  frameHeight: number,
  alignment: ContentAlignment,
) {
  const scale = Math.min(
    frameWidth / image.naturalWidth,
    frameHeight / image.naturalHeight,
  )
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  const x = (frameWidth - width) / 2
  const y =
    alignment === "start"
      ? 0
      : alignment === "end"
        ? frameHeight - height
        : (frameHeight - height) / 2

  return { x, y, width, height }
}

function stitchImages({
  images,
  frameWidth,
  frameHeight,
  imageSpacing,
  direction,
  alignment,
  backgroundColor,
}: {
  images: ImageItem[]
  frameWidth: number
  frameHeight: number
  imageSpacing: number
  direction: StackDirection
  alignment: ContentAlignment
  backgroundColor: string | null
}): Promise<Blob | null> {
  return new Promise((resolve) => {
    const totalSpacing = Math.max(0, images.length - 1) * imageSpacing
    const canvas = document.createElement("canvas")
    canvas.width =
      direction === "horizontal"
        ? frameWidth * images.length + totalSpacing
        : frameWidth
    canvas.height =
      direction === "horizontal"
        ? frameHeight
        : frameHeight * images.length + totalSpacing
    const context = canvas.getContext("2d")

    if (!context) {
      resolve(null)
      return
    }

    if (backgroundColor !== null) {
      context.fillStyle = backgroundColor
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    for (let index = 0; index < images.length; index++) {
      const item = images[index]
      const frameX =
        direction === "horizontal" ? index * (frameWidth + imageSpacing) : 0
      const frameY =
        direction === "horizontal" ? 0 : index * (frameHeight + imageSpacing)
      const params = getDrawParams(
        item.element,
        frameWidth,
        frameHeight,
        alignment,
      )

      context.drawImage(
        item.element,
        frameX + params.x,
        frameY + params.y,
        params.width,
        params.height,
      )
    }

    canvas.toBlob(resolve, "image/png")
  })
}

function ScreenshotStitcher({ variant = "page" }: ScreenshotStitcherProps) {
  const isPanel = variant === "panel"
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [frameWidth, setFrameWidth] = useState(390)
  const [frameHeight, setFrameHeight] = useState(844)
  const [imageSpacing, setImageSpacing] = useState(0)
  const [direction, setDirection] = useState<StackDirection>("horizontal")
  const [alignment, setAlignment] = useState<ContentAlignment>("start")
  const [backgroundColor, setBackgroundColor] = useState("#000000")
  const [transparentBackground, setTransparentBackground] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stitched, setStitched] = useState<StitchedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef(images)
  const stitchedRef = useRef(stitched)

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    stitchedRef.current = stitched
  }, [stitched])

  useEffect(() => {
    return () => {
      for (const item of imagesRef.current)
        URL.revokeObjectURL(item.originalUrl)
      if (stitchedRef.current) URL.revokeObjectURL(stitchedRef.current.url)
    }
  }, [])

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    )
    if (imageFiles.length === 0) return

    const loadedImages = (
      await Promise.all(imageFiles.map(loadImageFile))
    ).filter((item): item is ImageItem => item !== null)

    if (loadedImages.length === 0) return

    setImages((previousImages) => {
      const nextImages = [...previousImages, ...loadedImages]
      if (previousImages.length === 0) {
        setFrameWidth(
          Math.max(...nextImages.map((image) => image.naturalWidth)),
        )
        setFrameHeight(
          Math.max(...nextImages.map((image) => image.naturalHeight)),
        )
      }
      return nextImages
    })
    setStitched((previousStitched) => {
      if (previousStitched) URL.revokeObjectURL(previousStitched.url)
      return null
    })
  }, [])

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const files = event.clipboardData?.files
      if (files && files.length > 0) {
        event.preventDefault()
        void addFiles(files)
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [addFiles])

  const removeImage = useCallback((id: string) => {
    setImages((previousImages) => {
      const item = previousImages.find((image) => image.id === id)
      if (item) URL.revokeObjectURL(item.originalUrl)
      return previousImages.filter((image) => image.id !== id)
    })
    setStitched((previousStitched) => {
      if (previousStitched) URL.revokeObjectURL(previousStitched.url)
      return null
    })
  }, [])

  const handleStitch = useCallback(async () => {
    if (images.length === 0 || frameWidth < 1 || frameHeight < 1) return

    setIsProcessing(true)
    const blob = await stitchImages({
      images,
      frameWidth,
      frameHeight,
      imageSpacing,
      direction,
      alignment,
      backgroundColor: transparentBackground ? null : backgroundColor,
    })

    if (blob) {
      const outputWidth =
        direction === "horizontal"
          ? frameWidth * images.length
            + Math.max(0, images.length - 1) * imageSpacing
          : frameWidth
      const outputHeight =
        direction === "horizontal"
          ? frameHeight
          : frameHeight * images.length
            + Math.max(0, images.length - 1) * imageSpacing
      const output = {
        url: URL.createObjectURL(blob),
        fileName: `stitched-screenshots-${direction}.png`,
        width: outputWidth,
        height: outputHeight,
      }

      setStitched((previousStitched) => {
        if (previousStitched) URL.revokeObjectURL(previousStitched.url)
        return output
      })
    }

    setIsProcessing(false)
  }, [
    images,
    frameWidth,
    frameHeight,
    imageSpacing,
    direction,
    alignment,
    backgroundColor,
    transparentBackground,
  ])

  const downloadFile = useCallback((item: StitchedImage) => {
    const link = document.createElement("a")
    link.href = item.url
    link.download = item.fileName
    link.click()
  }, [])

  const handleReset = useCallback(() => {
    for (const image of images) URL.revokeObjectURL(image.originalUrl)
    if (stitched) URL.revokeObjectURL(stitched.url)
    setImages([])
    setStitched(null)
    setFrameWidth(390)
    setFrameHeight(844)
    setImageSpacing(0)
    setDirection("horizontal")
    setAlignment("start")
    setTransparentBackground(true)
  }, [images, stitched])

  if (isPanel) {
    const outputWidth =
      direction === "horizontal"
        ? frameWidth * images.length
          + Math.max(0, images.length - 1) * imageSpacing
        : frameWidth
    const outputHeight =
      direction === "horizontal"
        ? frameHeight
        : frameHeight * images.length
          + Math.max(0, images.length - 1) * imageSpacing
    const objectPosition =
      alignment === "start"
        ? "top center"
        : alignment === "end"
          ? "bottom center"
          : "center"

    return (
      <div className="grid h-full min-h-[620px] bg-dev-canvas lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div
          className="min-h-[520px] overflow-auto bg-dev-inset p-4 sm:p-6"
          style={{
            backgroundImage:
              "linear-gradient(#373e47 1px, transparent 1px), linear-gradient(90deg, #373e47 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          {images.length === 0 ? (
            <div className="flex min-h-full items-center justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(event) => {
                  event.preventDefault()
                  setIsDragOver(false)
                  void addFiles(event.dataTransfer.files)
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                className={classNames(
                  "flex min-h-80 w-full max-w-xl flex-col items-center justify-center rounded-xl border-2 border-dashed bg-dev-canvas/90 p-8 text-center shadow-2xl shadow-black/30 transition-colors hover:border-dev-border-muted hover:bg-dev-canvas",
                  isDragOver ? "border-dev-accent-blue" : "border-dev-border",
                )}
              >
                <Upload className="size-12 text-dev-text-secondary" />
                <p className="mt-4 text-sm font-semibold text-dev-text">
                  Drop screenshots onto the canvas
                </p>
                <p className="mt-2 text-sm text-dev-text-secondary">
                  Paste from clipboard or browse for PNG, JPEG, or WebP files.
                </p>
              </button>
            </div>
          ) : (
            <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-4">
              <div className="rounded-lg border border-dev-border bg-dev-canvas/95 shadow-2xl shadow-black/30 backdrop-blur">
                <div className="flex items-center justify-between gap-3 border-b border-dev-border px-4 py-2">
                  <div>
                    <h2 className="text-sm font-semibold text-dev-text">
                      Canvas Preview
                    </h2>
                    <p className="text-xs text-dev-text-secondary">
                      {images.length} frame{images.length === 1 ? "" : "s"} -{" "}
                      {outputWidth}×{outputHeight}px output
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded bg-dev-button px-2.5 py-1.5 text-xs font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
                  >
                    <Plus className="size-3.5" />
                    Add
                  </button>
                </div>
                <div
                  className={classNames(
                    "flex overflow-auto p-5",
                    direction === "horizontal"
                      ? "items-start"
                      : "flex-col items-center",
                  )}
                  style={{
                    ...(transparentBackground ? CHECKERBOARD_STYLE : {}),
                    gap: imageSpacing,
                  }}
                >
                  {images.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative shrink-0 rounded-md border border-dev-border bg-dev-inset p-2 shadow-lg shadow-black/20"
                    >
                      <button
                        type="button"
                        onClick={() => removeImage(item.id)}
                        className="absolute right-1 top-1 z-10 flex size-6 items-center justify-center rounded-full bg-dev-accent-red text-white opacity-0 shadow transition-opacity hover:bg-dev-accent-red/90 group-hover:opacity-100"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                      <div
                        className="relative overflow-hidden rounded bg-black/20"
                        style={{
                          aspectRatio: `${frameWidth} / ${frameHeight}`,
                          width:
                            direction === "horizontal"
                              ? "clamp(8rem, 14vw, 11rem)"
                              : "clamp(10rem, 24vw, 15rem)",
                        }}
                      >
                        {/* biome-ignore lint/performance/noImgElement: blob URL */}
                        <img
                          src={item.originalUrl}
                          alt={item.file.name}
                          className="size-full object-contain"
                          style={{ objectPosition }}
                        />
                      </div>
                      <p className="mt-2 truncate text-center text-[11px] text-dev-text-secondary">
                        {index + 1}. {item.naturalWidth}×{item.naturalHeight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-dev-border bg-dev-canvas/95 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between gap-3 border-b border-dev-border px-4 py-2">
                  <div>
                    <h2 className="text-sm font-semibold text-dev-text">
                      Export Preview
                    </h2>
                    <p className="text-xs text-dev-text-secondary">
                      Generated PNG appears here after stitching.
                    </p>
                  </div>
                  {stitched && (
                    <button
                      type="button"
                      onClick={() => downloadFile(stitched)}
                      className="flex items-center gap-1.5 rounded bg-dev-accent-green px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-dev-accent-green/90"
                    >
                      <Download className="size-3.5" />
                      Download
                    </button>
                  )}
                </div>
                <div
                  className="min-h-52 overflow-auto p-5"
                  style={transparentBackground ? CHECKERBOARD_STYLE : undefined}
                >
                  {stitched ? (
                    /* biome-ignore lint/performance/noImgElement: blob URL */
                    <img
                      src={stitched.url}
                      alt="Stitched screenshots"
                      className="mx-auto block max-h-[28rem] max-w-full rounded border border-dev-border"
                    />
                  ) : (
                    <div className="flex min-h-42 items-center justify-center rounded border border-dashed border-dev-border bg-dev-inset/80 text-sm text-dev-text-secondary">
                      Configure the frames, then stitch to preview the final
                      PNG.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="overflow-auto border-t border-dev-border bg-dev-inset p-4 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
              Properties
            </p>
            <h2 className="mt-1 text-base font-semibold text-dev-text">
              Screenshot Stitcher
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-dev-text-secondary">
              Stack screenshots into equal frames without cropping or stretching
              the content.
            </p>
          </div>

          <div className="mt-4 rounded-md border border-dev-border bg-dev-surface p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
              Document
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-xs text-dev-text-secondary">
                Frame W
                <input
                  type="number"
                  value={frameWidth}
                  onChange={(event) =>
                    setFrameWidth(Math.max(1, Number(event.target.value)))
                  }
                  className="rounded border border-dev-border bg-dev-inset px-2 py-1.5 text-sm text-dev-text"
                  min={1}
                />
              </label>
              <label className="grid gap-1 text-xs text-dev-text-secondary">
                Frame H
                <input
                  type="number"
                  value={frameHeight}
                  onChange={(event) =>
                    setFrameHeight(Math.max(1, Number(event.target.value)))
                  }
                  className="rounded border border-dev-border bg-dev-inset px-2 py-1.5 text-sm text-dev-text"
                  min={1}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                if (images.length === 0) return
                setFrameWidth(
                  Math.max(...images.map((image) => image.naturalWidth)),
                )
                setFrameHeight(
                  Math.max(...images.map((image) => image.naturalHeight)),
                )
              }}
              disabled={images.length === 0}
              className="mt-2 w-full rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text transition-colors hover:bg-dev-button-hover disabled:opacity-50"
            >
              Match Largest Screenshot
            </button>
            <p className="mt-2 text-xs text-dev-text-secondary">
              Output:{" "}
              {images.length > 0
                ? `${outputWidth}×${outputHeight}px`
                : "add images"}
            </p>
            <label className="mt-3 grid gap-1 text-xs text-dev-text-secondary">
              Spacing
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={imageSpacing}
                  onChange={(event) =>
                    setImageSpacing(Math.max(0, Number(event.target.value)))
                  }
                  className="min-w-0 flex-1 rounded border border-dev-border bg-dev-inset px-2 py-1.5 text-sm text-dev-text"
                  min={0}
                />
                <span>px</span>
              </div>
            </label>
          </div>

          <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
              Layout
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection("horizontal")}
                className={classNames(
                  "flex items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors",
                  direction === "horizontal"
                    ? "bg-dev-accent-blue text-white"
                    : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                )}
              >
                <ArrowRight className="size-4" />
                Row
              </button>
              <button
                type="button"
                onClick={() => setDirection("vertical")}
                className={classNames(
                  "flex items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors",
                  direction === "vertical"
                    ? "bg-dev-accent-blue text-white"
                    : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                )}
              >
                <ArrowDown className="size-4" />
                Column
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1">
              {ALIGNMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAlignment(option.value)}
                  className={classNames(
                    "rounded px-2 py-1.5 text-xs font-medium transition-colors",
                    alignment === option.value
                      ? "bg-dev-accent-blue text-white"
                      : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-dev-text-secondary">
              Top alignment keeps repeated mobile nav bars in the same position.
            </p>
          </div>

          <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
              Background
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTransparentBackground(!transparentBackground)}
                className={classNames(
                  "flex-1 rounded px-3 py-2 text-sm font-medium transition-colors",
                  transparentBackground
                    ? "bg-dev-accent-blue text-white"
                    : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                )}
              >
                Transparent
              </button>
              {!transparentBackground && (
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(event) => setBackgroundColor(event.target.value)}
                  className="h-9 w-10 cursor-pointer rounded border border-dev-border"
                />
              )}
            </div>
          </div>

          <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
                Layers
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded bg-dev-button px-2 py-1 text-xs font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
              >
                Add
              </button>
            </div>
            <div className="mt-3 grid max-h-52 gap-2 overflow-auto">
              {images.length === 0 ? (
                <p className="text-xs text-dev-text-secondary">
                  No screenshots yet.
                </p>
              ) : (
                images.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded border border-dev-border bg-dev-inset p-2"
                  >
                    {/* biome-ignore lint/performance/noImgElement: blob URL */}
                    <img
                      src={item.originalUrl}
                      alt={item.file.name}
                      className="h-10 w-7 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-dev-text">
                        {item.file.name}
                      </p>
                      <p className="text-[11px] text-dev-text-secondary">
                        {item.naturalWidth}×{item.naturalHeight}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="rounded p-1 text-dev-text-secondary transition-colors hover:bg-dev-button-hover hover:text-dev-accent-red"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={handleStitch}
              disabled={images.length === 0 || isProcessing}
              className="flex items-center justify-center gap-1.5 rounded bg-dev-accent-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-blue/90 disabled:opacity-50"
            >
              <Images className="size-4" />
              {isProcessing ? "Stitching..." : "Stitch Screenshots"}
            </button>
            {stitched && (
              <button
                type="button"
                onClick={() => downloadFile(stitched)}
                className="flex items-center justify-center gap-1.5 rounded bg-dev-accent-green px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-green/90"
              >
                <Download className="size-4" />
                Download PNG
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
          </div>
        </aside>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) void addFiles(event.target.files)
            event.target.value = ""
          }}
        />
      </div>
    )
  }

  return (
    <div className={isPanel ? "h-full" : "flex flex-col h-full bg-dev-canvas"}>
      <div className={isPanel ? "" : "flex-1 overflow-auto"}>
        <div className={isPanel ? "p-4 sm:p-6" : "max-w-5xl mx-auto px-6 py-8"}>
          {!isPanel && (
            <>
              <h1 className="text-2xl font-semibold text-dev-text mb-1">
                Screenshot Stitcher
              </h1>
              <p className="text-sm text-dev-text-secondary mb-6">
                Stack mobile screenshots horizontally or vertically in matching
                frames while preserving their content.
              </p>
            </>
          )}

          {images.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragOver(false)
                void addFiles(event.dataTransfer.files)
              }}
              onDragOver={(event) => {
                event.preventDefault()
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
                Drop screenshots here, paste from clipboard, or click to browse
              </p>
              <p className="mt-1 text-xs text-dev-text-secondary">
                PNG, JPEG, or WebP — select multiple files
              </p>
            </button>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-medium text-dev-text mb-2">
                  Screenshots ({images.length})
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
                        className="h-24 w-16 object-cover rounded border border-dev-border"
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
                    className="h-24 w-16 border-2 border-dashed border-dev-border rounded flex items-center justify-center hover:border-dev-border-muted transition-colors"
                  >
                    <Plus className="w-5 h-5 text-dev-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dev-text-secondary">
                    Frame W
                  </span>
                  <input
                    type="number"
                    value={frameWidth}
                    onChange={(event) =>
                      setFrameWidth(Math.max(1, Number(event.target.value)))
                    }
                    className="w-24 px-2 py-1 rounded text-sm bg-dev-inset border border-dev-border text-dev-text"
                    min={1}
                  />
                  <span className="text-xs text-dev-text-secondary">px</span>
                </div>
                <span className="text-dev-text-secondary">×</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dev-text-secondary">
                    Frame H
                  </span>
                  <input
                    type="number"
                    value={frameHeight}
                    onChange={(event) =>
                      setFrameHeight(Math.max(1, Number(event.target.value)))
                    }
                    className="w-24 px-2 py-1 rounded text-sm bg-dev-inset border border-dev-border text-dev-text"
                    min={1}
                  />
                  <span className="text-xs text-dev-text-secondary">px</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFrameWidth(
                      Math.max(...images.map((image) => image.naturalWidth)),
                    )
                    setFrameHeight(
                      Math.max(...images.map((image) => image.naturalHeight)),
                    )
                  }}
                  className="px-2.5 py-1 rounded text-xs font-medium bg-dev-button text-dev-text hover:bg-dev-button-hover transition-colors"
                >
                  Match largest
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDirection("horizontal")}
                    className={classNames(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                      direction === "horizontal"
                        ? "bg-dev-accent-blue text-white"
                        : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                    )}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("vertical")}
                    className={classNames(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                      direction === "vertical"
                        ? "bg-dev-accent-blue text-white"
                        : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                    )}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    Vertical
                  </button>
                </div>
                <div className="flex items-center gap-1 border-l border-dev-border pl-4">
                  {ALIGNMENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAlignment(option.value)}
                      className={classNames(
                        "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                        alignment === option.value
                          ? "bg-dev-accent-blue text-white"
                          : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-l border-dev-border pl-4">
                  <button
                    type="button"
                    onClick={() =>
                      setTransparentBackground(!transparentBackground)
                    }
                    className={classNames(
                      "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                      transparentBackground
                        ? "bg-dev-accent-blue text-white"
                        : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                    )}
                  >
                    Transparent
                  </button>
                  {!transparentBackground && (
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(event) =>
                        setBackgroundColor(event.target.value)
                      }
                      className="w-7 h-7 rounded cursor-pointer border border-dev-border"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleStitch}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-blue text-white hover:bg-dev-accent-blue/90 transition-colors disabled:opacity-50"
                >
                  <Images className="w-4 h-4" />
                  {isProcessing ? "Stitching..." : "Stitch Screenshots"}
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

              {stitched && (
                <div>
                  <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                    <h3 className="text-sm font-medium text-dev-text">
                      Output — {stitched.width}×{stitched.height}
                    </h3>
                    <button
                      type="button"
                      onClick={() => downloadFile(stitched)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-green text-white hover:bg-dev-accent-green/90 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download PNG
                    </button>
                  </div>
                  <div
                    className="bg-dev-inset rounded-md p-3 overflow-auto border border-dev-border"
                    style={
                      transparentBackground ? CHECKERBOARD_STYLE : undefined
                    }
                  >
                    {/* biome-ignore lint/performance/noImgElement: blob URL */}
                    <img
                      src={stitched.url}
                      alt="Stitched screenshots"
                      className="block max-w-full rounded"
                    />
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
        onChange={(event) => {
          if (event.target.files) void addFiles(event.target.files)
          event.target.value = ""
        }}
      />
    </div>
  )
}

export default ScreenshotStitcher
