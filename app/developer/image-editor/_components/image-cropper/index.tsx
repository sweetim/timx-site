"use client"

import clsx from "clsx"
import {
  Copy,
  Crop,
  Crosshair,
  Download,
  Maximize2,
  Trash2,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"
import CanvasDropOverlay from "../canvas-drop-overlay"
import UploadZone from "../upload-zone"
import { CropOverlay } from "./crop-overlay"
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from "./constants"
import {
  applyAspectRatio,
  clampCrop,
  clampCropKeepCenter,
  computeCenterResize,
  computeEdgeResize,
  clampEdgeCrop,
  getInitialCrop,
  getImageDisplayDimensions,
} from "./_lib/crop-math"
import type {
  AnchorMode,
  AspectRatioPreset,
  DragState,
  ImageCropperProps,
  Status,
} from "./types"

function ImageCropper({
  variant = "page",
  isActive = true,
  initialImage,
  workspaceResetKey = 0,
  onResult,
  onSourceImage,
  onClearWorkspace,
  onCopyToClipboard,
  hasClipboard = false,
  droppedFiles,
  droppedFilesKey,
  canvasDropProps,
}: ImageCropperProps) {
  const isPanel = variant === "panel"
  const [status, setStatus] = useState<Status>({ phase: "idle" })
  const [isDragOver, setIsDragOver] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
    scale: 1,
  })
  const [anchorMode, setAnchorMode] = useState<AnchorMode>("center")
  const [aspectPreset, setAspectPreset] =
    useState<AspectRatioPreset>(DEFAULT_ASPECT_RATIO)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const anchorModeRef = useRef(anchorMode)
  const displayDimensionsRef = useRef(displayDimensions)
  const importedImageKeyRef = useRef<number | null>(null)
  const handledWorkspaceResetKeyRef = useRef(workspaceResetKey)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    anchorModeRef.current = anchorMode
  }, [anchorMode])

  useEffect(() => {
    displayDimensionsRef.current = displayDimensions
  }, [displayDimensions])

  const loadImage = useCallback(
    (file: File, notifySource = true) => {
      if (notifySource) onSourceImage?.(file, file.name)

      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        imageRef.current = img
        const wrapper = wrapperRef.current
        if (!wrapper) return
        const containerWidth = wrapper.clientWidth
        const containerHeight = Math.max(wrapper.clientHeight, 400)
        const { displayWidth, displayHeight, scale } =
          getImageDisplayDimensions(
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
    },
    [onSourceImage],
  )

  useEffect(() => {
    if (!isActive) return
    if (!droppedFiles || droppedFiles.length === 0) return
    loadImage(droppedFiles[0])
  }, [isActive, droppedFiles, droppedFilesKey, loadImage])

  useEffect(() => {
    if (!isActive || !initialImage) return
    if (initialImage.originTool === "crop") return
    if (importedImageKeyRef.current === initialImage.key) return
    importedImageKeyRef.current = initialImage.key
    const file = new File([initialImage.blob], initialImage.name, {
      type: initialImage.blob.type || "image/png",
    })
    loadImage(file, false)
  }, [isActive, initialImage, loadImage])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isActive) return
      const file = e.clipboardData?.files[0]
      if (file?.type.startsWith("image/")) {
        e.preventDefault()
        loadImage(file)
      }
    }
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [isActive, loadImage])

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

  const handleDimensionChange = useCallback(
    (dimension: "width" | "height", value: string) => {
      const parsed = parseInt(value, 10)
      if (isNaN(parsed) || parsed <= 0) return
      const ratio =
        ASPECT_RATIOS.find((r) => r.preset === aspectPreset)?.ratio ?? null
      const { scale } = displayDimensions
      const maxX = displayDimensions.width
      const maxY = displayDimensions.height
      let newDisplayW: number
      let newDisplayH: number
      if (dimension === "width") {
        newDisplayW = parsed * scale
        newDisplayH = ratio !== null ? newDisplayW / ratio : crop.height
      } else {
        newDisplayH = parsed * scale
        newDisplayW = ratio !== null ? newDisplayH * ratio : crop.width
      }
      newDisplayW = Math.max(20, Math.min(newDisplayW, maxX))
      newDisplayH = Math.max(20, Math.min(newDisplayH, maxY))
      const cx = crop.x + crop.width / 2
      const cy = crop.y + crop.height / 2
      const newCrop =
        anchorMode === "center"
          ? {
              x: cx - newDisplayW / 2,
              y: cy - newDisplayH / 2,
              width: newDisplayW,
              height: newDisplayH,
            }
          : { x: crop.x, y: crop.y, width: newDisplayW, height: newDisplayH }
      setCrop(clampCrop(newCrop, maxX, maxY, ratio))
    },
    [aspectPreset, displayDimensions, crop, anchorMode],
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

        if (anchorMode === "center" && newDrag.type !== "move") {
          const cx = sc.x + sc.width / 2
          const cy = sc.y + sc.height / 2
          setCrop(clampCropKeepCenter(next, cx, cy, maxX, maxY, ratio))
        } else if (anchorMode === "edge" && newDrag.type !== "move") {
          setCrop(clampEdgeCrop(next, newDrag.type, maxX, maxY, ratio))
        } else {
          setCrop(clampCrop(next, maxX, maxY, ratio))
        }
      }
      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove)
        window.removeEventListener("mouseup", handleUp)
        if (anchorModeRef.current === "center" && newDrag.type !== "move") {
          const dims = displayDimensionsRef.current
          const r =
            ASPECT_RATIOS.find((ar) => ar.preset === aspectPreset)?.ratio
            ?? null
          const centerX = newDrag.startCrop.x + newDrag.startCrop.width / 2
          const centerY = newDrag.startCrop.y + newDrag.startCrop.height / 2
          setCrop((prev) => {
            return clampCropKeepCenter(
              prev,
              centerX,
              centerY,
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
      onResult?.(blob)
    }, "image/png")
  }, [status, crop, displayDimensions, onResult])

  const handleDownload = useCallback(() => {
    if (status.phase !== "cropped") return
    const a = document.createElement("a")
    a.href = status.croppedUrl
    a.download = "cropped-image.png"
    a.click()
  }, [status])

  const resetLocal = useCallback(() => {
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

  useEffect(() => {
    if (handledWorkspaceResetKeyRef.current === workspaceResetKey) return
    handledWorkspaceResetKeyRef.current = workspaceResetKey
    importedImageKeyRef.current = null
    resetLocal()
  }, [workspaceResetKey, resetLocal])

  const handleClear = useCallback(() => {
    importedImageKeyRef.current = null
    resetLocal()
    onClearWorkspace?.()
  }, [resetLocal, onClearWorkspace])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file?.type.startsWith("image/")) loadImage(file)
    },
    [loadImage],
  )

  if (isPanel) {
    return (
      <div className="grid h-full min-h-[620px] bg-dev-canvas lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          ref={wrapperRef}
          className="relative min-h-[520px] overflow-auto bg-dev-inset p-4 sm:p-6"
          style={{
            backgroundImage:
              "linear-gradient(#373e47 1px, transparent 1px), linear-gradient(90deg, #373e47 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          onDragOver={canvasDropProps?.onDragOver}
          onDragEnter={canvasDropProps?.onDragEnter}
          onDragLeave={canvasDropProps?.onDragLeave}
          onDrop={canvasDropProps?.onDrop}
        >
          {canvasDropProps && (
            <CanvasDropOverlay
              isDragOver={canvasDropProps.isDragOver}
              overlayLabel={canvasDropProps.overlayLabel}
            />
          )}
          {match(status)
            .with({ phase: "idle" }, () => (
              <div className="flex min-h-full items-center justify-center">
                <div className="w-full max-w-xl rounded-xl border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30">
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
                </div>
              </div>
            ))
            .with({ phase: "editing" }, ({ imageUrl }) => (
              <div className="flex min-h-full items-center justify-center">
                <div className="rounded-lg border border-dev-border bg-dev-canvas/95 p-3 shadow-2xl shadow-black/30">
                  <div
                    className="relative overflow-hidden rounded bg-dev-inset select-none"
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
                </div>
              </div>
            ))
            .with({ phase: "cropped" }, ({ croppedUrl }) => (
              <div className="flex min-h-full items-center justify-center">
                <div className="rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30">
                  <p className="mb-3 text-sm font-semibold text-dev-text">
                    Export Preview
                  </p>
                  {/* biome-ignore lint/performance/noImgElement: blob URL from canvas.toBlob is incompatible with next/image */}
                  <img
                    src={croppedUrl}
                    alt="Cropped result"
                    className="block max-h-[34rem] max-w-full rounded border border-dev-border"
                  />
                </div>
              </div>
            ))
            .exhaustive()}
        </section>

        <aside className="overflow-auto border-t border-dev-border bg-dev-inset p-4 lg:border-l lg:border-t-0">
          <div>
            <h2 className="text-base font-semibold text-dev-text">Crop</h2>
            <p className="mt-1 text-xs leading-relaxed text-dev-text-secondary">
              Select an area from the canvas, then export the crop as PNG.
            </p>
          </div>

          {status.phase === "editing" && (
            <>
              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
                  Aspect Ratio
                </p>
                <div className="mt-3 grid grid-cols-3 gap-1">
                  {ASPECT_RATIOS.map(({ label, preset }) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAspectRatioChange(preset)}
                      className={clsx(
                        "rounded px-2 py-1.5 text-xs font-medium transition-colors",
                        aspectPreset === preset
                          ? "bg-dev-accent-blue text-white"
                          : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
                  Resize Anchor
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnchorMode("center")
                      setCrop((prev) => {
                        const imageCx = displayDimensions.width / 2
                        const imageCy = displayDimensions.height / 2
                        const ratio =
                          ASPECT_RATIOS.find((ar) => ar.preset === aspectPreset)
                            ?.ratio ?? null
                        return clampCrop(
                          {
                            x: imageCx - prev.width / 2,
                            y: imageCy - prev.height / 2,
                            width: prev.width,
                            height: prev.height,
                          },
                          displayDimensions.width,
                          displayDimensions.height,
                          ratio,
                        )
                      })
                    }}
                    className={clsx(
                      "flex items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors",
                      anchorMode === "center"
                        ? "bg-dev-accent-blue text-white"
                        : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                    )}
                  >
                    <Crosshair className="size-4" />
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnchorMode("edge")}
                    className={clsx(
                      "flex items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors",
                      anchorMode === "edge"
                        ? "bg-dev-accent-blue text-white"
                        : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                    )}
                  >
                    <Maximize2 className="size-4" />
                    Edge
                  </button>
                </div>
              </div>

              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
                  Output Size
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-dev-text-secondary">
                      Width
                    </label>
                    <input
                      type="number"
                      min={1}
                      key={`w-${Math.round(crop.width / displayDimensions.scale)}`}
                      defaultValue={Math.round(
                        crop.width / displayDimensions.scale,
                      )}
                      onBlur={(e) =>
                        handleDimensionChange("width", e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          (e.target as HTMLInputElement).blur()
                      }}
                      className="mt-1 w-full rounded border border-dev-border bg-dev-canvas px-2 py-1 text-xs text-dev-text"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-dev-text-secondary">
                      Height
                    </label>
                    <input
                      type="number"
                      min={1}
                      key={`h-${Math.round(crop.height / displayDimensions.scale)}`}
                      defaultValue={Math.round(
                        crop.height / displayDimensions.scale,
                      )}
                      onBlur={(e) =>
                        handleDimensionChange("height", e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          (e.target as HTMLInputElement).blur()
                      }}
                      className="mt-1 w-full rounded border border-dev-border bg-dev-canvas px-2 py-1 text-xs text-dev-text"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-3 grid gap-2">
            {status.phase === "editing" && (
              <button
                type="button"
                onClick={handleCrop}
                className="flex items-center justify-center gap-1.5 rounded bg-dev-accent-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-blue/90"
              >
                <Crop className="size-4" />
                Crop Image
              </button>
            )}
            {status.phase === "cropped" && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-1.5 rounded bg-dev-accent-green px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dev-accent-green/90"
                >
                  <Download className="size-4" />
                  Download PNG
                </button>
                {hasClipboard && (
                  <button
                    type="button"
                    onClick={onCopyToClipboard}
                    className="flex items-center justify-center gap-1.5 rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
                  >
                    <Copy className="size-4" />
                    Copy to Clipboard
                  </button>
                )}
              </>
            )}
            {status.phase !== "idle" && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center gap-1.5 rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text transition-colors hover:bg-dev-button-hover"
              >
                <Trash2 className="size-4" />
                Clear
              </button>
            )}
          </div>
        </aside>

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

  return (
    <div className={isPanel ? "h-full" : "flex flex-col h-full bg-dev-canvas"}>
      <div className={isPanel ? "" : "flex-1 overflow-auto"}>
        <div
          className={isPanel ? "p-4 sm:p-6" : "max-w-4xl mx-auto px-6 py-8"}
          ref={wrapperRef}
        >
          {!isPanel && (
            <>
              <h1 className="text-2xl font-semibold text-dev-text mb-1">
                Image Cropper
              </h1>
              <p className="text-sm text-dev-text-secondary mb-6">
                Upload an image, choose an aspect ratio and anchor mode, then
                crop and download. Everything runs locally in your browser.
              </p>
            </>
          )}

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
                        className={clsx(
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
                      className={clsx(
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
                      className={clsx(
                        "p-1.5 rounded transition-colors",
                        anchorMode === "edge"
                          ? "bg-dev-accent-blue text-white"
                          : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                      )}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 border-l border-dev-border pl-4">
                    <input
                      type="number"
                      min={1}
                      key={`pw-${Math.round(crop.width / displayDimensions.scale)}`}
                      defaultValue={Math.round(
                        crop.width / displayDimensions.scale,
                      )}
                      onBlur={(e) =>
                        handleDimensionChange("width", e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          (e.target as HTMLInputElement).blur()
                      }}
                      className="w-16 rounded border border-dev-border bg-dev-canvas px-1.5 py-1 text-xs text-dev-text text-center"
                      title="Output width"
                    />
                    <span className="text-xs text-dev-text-secondary">×</span>
                    <input
                      type="number"
                      min={1}
                      key={`ph-${Math.round(crop.height / displayDimensions.scale)}`}
                      defaultValue={Math.round(
                        crop.height / displayDimensions.scale,
                      )}
                      onBlur={(e) =>
                        handleDimensionChange("height", e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          (e.target as HTMLInputElement).blur()
                      }}
                      className="w-16 rounded border border-dev-border bg-dev-canvas px-1.5 py-1 text-xs text-dev-text text-center"
                      title="Output height"
                    />
                    <span className="text-xs text-dev-text-secondary">px</span>
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
                    onClick={handleClear}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-button text-dev-text hover:bg-dev-button-hover transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
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
                    onClick={handleClear}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-button text-dev-text hover:bg-dev-button-hover transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
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
