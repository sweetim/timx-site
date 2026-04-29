"use client"

import clsx from "clsx"
import { Crop, Crosshair, Download, Maximize2, Trash2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"
import StepperInput from "../../../_components/stepper-input"
import type { DownloadFormat } from "../download-format-selector"
import { downloadBlob } from "../download-format-selector"
import SidebarActions from "../shared/sidebar-actions"
import SourceImagePanel from "../shared/source-image-panel"
import ToolPanelLayout from "../shared/tool-panel-layout"
import type { EditorToolProps } from "../shared/types"
import useClipboardPaste from "../shared/use-clipboard-paste"
import useDroppedFiles from "../shared/use-dropped-files"
import useSourceFileInput from "../shared/use-source-file-input"
import useWorkspaceReset from "../shared/use-workspace-reset"
import UploadZone from "../upload-zone"
import useImageCropper from "./_hooks/use-image-cropper"
import { clampCrop } from "./_lib/crop-math"
import { ASPECT_RATIOS } from "./constants"
import { CropOverlay } from "./crop-overlay"

function ImageCropper({
  variant = "page",
  isActive = true,
  workspaceResetKey = 0,
  onResult,
  onSourceImage,
  onClearWorkspace,
  onCopyToClipboard,
  hasClipboard = false,
  droppedFiles,
  droppedFilesKey,
  canvasDropProps,
  sourceImages = [],
  onRemoveSourceImage,
  onAddSourceImages,
}: EditorToolProps) {
  const isPanel = variant === "panel"
  const droppedFileRef = useRef<File | null>(null)
  const loadedSourceIdRef = useRef<string | null>(null)
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null)
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("png")
  const { sourceFileInputRef, handleSourceFileInput } = useSourceFileInput({
    onAddSourceImages,
  })

  const {
    status,
    crop,
    displayDimensions,
    anchorMode,
    aspectPreset,
    isDragOver,
    wrapperRef,
    fileInputRef,
    resultBlobRef,
    setCrop,
    setAnchorMode,
    setIsDragOver,
    loadImage,
    handleAspectRatioChange,
    handleDimensionChange,
    handleDragStart,
    handleCrop,
    handleDrop,
    resetLocal,
  } = useImageCropper({ isActive, onResult, onSourceImage })

  const handleFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))
      if (imageFiles.length === 0) return

      const addedSources = (await onAddSourceImages?.(imageFiles)) ?? []
      const firstSource =
        addedSources.find((source) => source.blob === imageFiles[0])
        ?? addedSources[0]

      if (firstSource) {
        loadedSourceIdRef.current = firstSource.id
        setActiveSourceId(firstSource.id)
        const file = new File([firstSource.blob], firstSource.name, {
          type: firstSource.blob.type || "image/png",
        })
        loadImage(file, false)
      }
    },
    [onAddSourceImages, loadImage],
  )

  useDroppedFiles({
    isActive,
    droppedFiles,
    droppedFilesKey,
    onLoad: (files) => {
      droppedFileRef.current = files[0]
      loadImage(files[0])
    },
  })

  useEffect(() => {
    if (!droppedFileRef.current || !isActive) return
    const match = sourceImages.find(
      (img) => img.blob === droppedFileRef.current,
    )
    if (match) {
      loadedSourceIdRef.current = match.id
      setActiveSourceId(match.id)
      droppedFileRef.current = null
    }
  }, [isActive, sourceImages])

  useClipboardPaste({
    isActive,
    onFiles: (files) => {
      void handleFiles(files)
    },
  })

  useWorkspaceReset({
    workspaceResetKey,
    onReset: () => {
      droppedFileRef.current = null
      loadedSourceIdRef.current = null
      setActiveSourceId(null)
      resetLocal()
    },
  })

  useEffect(() => {
    if (!isActive || !activeSourceId) return
    if (loadedSourceIdRef.current === activeSourceId && status.phase !== "idle") {
      return
    }
    const source = sourceImages.find((img) => img.id === activeSourceId)
    if (!source) return
    const file = new File([source.blob], source.name, {
      type: source.blob.type || "image/png",
    })
    loadedSourceIdRef.current = source.id
    loadImage(file, false)
  }, [isActive, activeSourceId, sourceImages, status.phase, loadImage])

  const handleSelectSource = (id: string) => {
    droppedFileRef.current = null
    setActiveSourceId(id)
  }

  const handleClear = useCallback(() => {
    droppedFileRef.current = null
    loadedSourceIdRef.current = null
    setActiveSourceId(null)
    resetLocal()
    onClearWorkspace?.()
  }, [resetLocal, onClearWorkspace])

  const handleDownload = useCallback(async () => {
    if (status.phase !== "cropped") return
    await downloadBlob(status.croppedUrl, "cropped-image", downloadFormat)
  }, [status, downloadFormat])

  const handleAddToSource = useCallback(async () => {
    const blob = resultBlobRef.current
    if (!blob || status.phase !== "cropped") return
    const file = new File([blob], "cropped-image.png", {
      type: blob.type || "image/png",
    })
    await onAddSourceImages?.([file])
  }, [status, onAddSourceImages])

  if (isPanel) {
    return (
      <ToolPanelLayout
        canvasDropProps={canvasDropProps}
        canvasContent={
          <div
            ref={wrapperRef}
            className="mx-auto flex min-h-full max-w-6xl flex-col items-center justify-center gap-4"
          >
            {match(status)
              .with({ phase: "idle" }, () => (
                <div className="flex min-h-full w-full items-center justify-center">
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
              ))
              .with({ phase: "cropped" }, ({ originalUrl, croppedUrl }) => (
                <>
                  <div className="rounded-lg border border-dev-border bg-dev-canvas/95 p-3 shadow-2xl shadow-black/30">
                    <div
                      className="relative overflow-hidden rounded bg-dev-inset select-none"
                      style={{
                        width: displayDimensions.width,
                        height: displayDimensions.height,
                      }}
                    >
                      {/* biome-ignore lint/performance/noImgElement: blob URL */}
                      <img
                        src={originalUrl}
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
                  <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 shadow-xl shadow-black/20">
                    <div className="flex items-center justify-between gap-3 border-b border-dev-border px-4 py-2">
                      <div>
                        <h2 className="text-sm font-semibold text-dev-text">
                          Export Preview
                        </h2>
                        <p className="text-xs text-dev-text-secondary">
                          Adjust the crop area and re-crop to update.
                        </p>
                      </div>
                    </div>
                    <div className="min-h-52 overflow-auto p-5">
                      {/* biome-ignore lint/performance/noImgElement: blob URL from canvas.toBlob is incompatible with next/image */}
                      <img
                        src={croppedUrl}
                        alt="Cropped result"
                        className="mx-auto block max-h-[28rem] max-w-full rounded border border-dev-border"
                      />
                    </div>
                  </div>
                </>
              ))
              .exhaustive()}
          </div>
        }
        sidebarContent={
          <>
            <div>
              <h2 className="text-base font-semibold text-dev-text">Crop</h2>
              <p className="mt-1 text-xs leading-relaxed text-dev-text-secondary">
                Select an area from the canvas, then export the crop as PNG.
              </p>
            </div>

            <SourceImagePanel
              sourceImages={sourceImages}
              activeSourceId={activeSourceId}
              onSelectSource={handleSelectSource}
              onRemoveSourceImage={onRemoveSourceImage}
              onRemoveActiveSource={() => setActiveSourceId(null)}
              onAddSourceImages={onAddSourceImages}
              sourceFileInputRef={sourceFileInputRef}
            />

            {(status.phase === "editing" || status.phase === "cropped") && (
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
                          "rounded px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer",
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
                            ratio,
                          )
                        })
                      }}
                      className={clsx(
                        "flex items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
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
                        "flex items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
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
                      <label
                        htmlFor="crop-output-width"
                        className="text-xs text-dev-text-secondary"
                      >
                        Width
                      </label>
                      <StepperInput
                        id="crop-output-width"
                        key={`w-${Math.round(crop.width / displayDimensions.scale)}`}
                        value={Math.round(crop.width / displayDimensions.scale)}
                        onChange={() => {}}
                        onIncrement={() =>
                          handleDimensionChange(
                            "width",
                            String(
                              Math.round(crop.width / displayDimensions.scale)
                                + 1,
                            ),
                          )
                        }
                        onDecrement={() =>
                          handleDimensionChange(
                            "width",
                            String(
                              Math.max(
                                1,
                                Math.round(crop.width / displayDimensions.scale)
                                  - 1,
                              ),
                            ),
                          )
                        }
                        min={1}
                        className="mt-1 w-full"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="crop-output-height"
                        className="text-xs text-dev-text-secondary"
                      >
                        Height
                      </label>
                      <StepperInput
                        id="crop-output-height"
                        key={`h-${Math.round(crop.height / displayDimensions.scale)}`}
                        value={Math.round(
                          crop.height / displayDimensions.scale,
                        )}
                        onChange={() => {}}
                        onIncrement={() =>
                          handleDimensionChange(
                            "height",
                            String(
                              Math.round(crop.height / displayDimensions.scale)
                                + 1,
                            ),
                          )
                        }
                        onDecrement={() =>
                          handleDimensionChange(
                            "height",
                            String(
                              Math.max(
                                1,
                                Math.round(
                                  crop.height / displayDimensions.scale,
                                ) - 1,
                              ),
                            ),
                          )
                        }
                        min={1}
                        className="mt-1 w-full"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <SidebarActions
              primaryAction={
                status.phase === "editing" || status.phase === "cropped"
                  ? {
                      label: "Crop Image",
                      icon: <Crop className="size-4" />,
                      onClick: handleCrop,
                    }
                  : undefined
              }
              download={
                status.phase === "cropped"
                  ? {
                      url: status.croppedUrl,
                      baseName: "cropped-image",
                      format: downloadFormat,
                      onFormatChange: setDownloadFormat,
                    }
                  : undefined
              }
              showAddToSource={status.phase === "cropped"}
              onAddToSource={handleAddToSource}
              showCopy={status.phase === "cropped" && hasClipboard}
              onCopyToClipboard={onCopyToClipboard}
              showClear={status.phase !== "idle"}
              onClear={handleClear}
            />
          </>
        }
        hiddenInputs={
          <>
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
            <input
              ref={sourceFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleSourceFileInput}
            />
          </>
        }
      />
    )
  }

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
                        className={clsx(
                          "px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
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
                      }}
                      title="Expand from center"
                      className={clsx(
                        "p-1.5 rounded transition-colors cursor-pointer",
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
                        "p-1.5 rounded transition-colors cursor-pointer",
                        anchorMode === "edge"
                          ? "bg-dev-accent-blue text-white"
                          : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                      )}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 border-l border-dev-border pl-4">
                    <StepperInput
                      key={`pw-${Math.round(crop.width / displayDimensions.scale)}`}
                      value={Math.round(crop.width / displayDimensions.scale)}
                      onChange={() => {}}
                      onIncrement={() =>
                        handleDimensionChange(
                          "width",
                          String(
                            Math.round(crop.width / displayDimensions.scale)
                              + 1,
                          ),
                        )
                      }
                      onDecrement={() =>
                        handleDimensionChange(
                          "width",
                          String(
                            Math.max(
                              1,
                              Math.round(crop.width / displayDimensions.scale)
                                - 1,
                            ),
                          ),
                        )
                      }
                      min={1}
                      className="w-24"
                    />
                    <span className="text-xs text-dev-text-secondary">×</span>
                    <StepperInput
                      key={`ph-${Math.round(crop.height / displayDimensions.scale)}`}
                      value={Math.round(crop.height / displayDimensions.scale)}
                      onChange={() => {}}
                      onIncrement={() =>
                        handleDimensionChange(
                          "height",
                          String(
                            Math.round(crop.height / displayDimensions.scale)
                              + 1,
                          ),
                        )
                      }
                      onDecrement={() =>
                        handleDimensionChange(
                          "height",
                          String(
                            Math.max(
                              1,
                              Math.round(crop.height / displayDimensions.scale)
                                - 1,
                            ),
                          ),
                        )
                      }
                      min={1}
                      className="w-24"
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-blue text-white hover:bg-dev-accent-blue/90 transition-colors cursor-pointer"
                  >
                    <Crop className="w-4 h-4" />
                    Crop
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-button text-dev-text hover:bg-dev-button-hover transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            ))
            .with({ phase: "cropped" }, ({ originalUrl, croppedUrl }) => (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    {ASPECT_RATIOS.map(({ label, preset }) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAspectRatioChange(preset)}
                        className={clsx(
                          "px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
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
                      }}
                      title="Expand from center"
                      className={clsx(
                        "p-1.5 rounded transition-colors cursor-pointer",
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
                        "p-1.5 rounded transition-colors cursor-pointer",
                        anchorMode === "edge"
                          ? "bg-dev-accent-blue text-white"
                          : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                      )}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 border-l border-dev-border pl-4">
                    <StepperInput
                      key={`pw-${Math.round(crop.width / displayDimensions.scale)}`}
                      value={Math.round(crop.width / displayDimensions.scale)}
                      onChange={() => {}}
                      onIncrement={() =>
                        handleDimensionChange(
                          "width",
                          String(
                            Math.round(crop.width / displayDimensions.scale)
                              + 1,
                          ),
                        )
                      }
                      onDecrement={() =>
                        handleDimensionChange(
                          "width",
                          String(
                            Math.max(
                              1,
                              Math.round(crop.width / displayDimensions.scale)
                                - 1,
                            ),
                          ),
                        )
                      }
                      min={1}
                      className="w-24"
                    />
                    <span className="text-xs text-dev-text-secondary">×</span>
                    <StepperInput
                      key={`ph-${Math.round(crop.height / displayDimensions.scale)}`}
                      value={Math.round(crop.height / displayDimensions.scale)}
                      onChange={() => {}}
                      onIncrement={() =>
                        handleDimensionChange(
                          "height",
                          String(
                            Math.round(crop.height / displayDimensions.scale)
                              + 1,
                          ),
                        )
                      }
                      onDecrement={() =>
                        handleDimensionChange(
                          "height",
                          String(
                            Math.max(
                              1,
                              Math.round(crop.height / displayDimensions.scale)
                                - 1,
                            ),
                          ),
                        )
                      }
                      min={1}
                      className="w-24"
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
                  {/* biome-ignore lint/performance/noImgElement: blob URL */}
                  <img
                    src={originalUrl}
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-blue text-white hover:bg-dev-accent-blue/90 transition-colors cursor-pointer"
                  >
                    <Crop className="w-4 h-4" />
                    Re-crop
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-button text-dev-text hover:bg-dev-button-hover transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                    <h3 className="text-sm font-medium text-dev-text">
                      Export Preview
                    </h3>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-green text-white hover:bg-dev-accent-green/90 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <div className="bg-dev-inset rounded-md p-4 overflow-auto border border-dev-border">
                    {/* biome-ignore lint/performance/noImgElement: blob URL from canvas.toBlob is incompatible with next/image */}
                    <img
                      src={croppedUrl}
                      alt="Cropped result"
                      className="block max-w-full rounded"
                    />
                  </div>
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
