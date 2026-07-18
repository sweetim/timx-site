"use client"

import clsx from "clsx"
import { Columns3, Download, Images, Plus, Rows3, Trash2 } from "lucide-react"
import { memo, useCallback, useRef, useState } from "react"
import StepperInput from "../../../_components/stepper-input"
import type { DownloadFormat } from "../download-format-selector"
import {
  DownloadFormatSelector,
  downloadBlob,
} from "../download-format-selector"
import type { SourceImage } from "../image-editor"
import SidebarActions from "../shared/sidebar-actions"
import SourceImagePanel from "../shared/source-image-panel"
import ToolPanelLayout from "../shared/tool-panel-layout"
import type { EditorToolProps } from "../shared/types"

const EMPTY_SOURCE_IMAGES: SourceImage[] = []

import useClipboardPaste from "../shared/use-clipboard-paste"
import useDroppedFiles from "../shared/use-dropped-files"
import useWorkspaceReset from "../shared/use-workspace-reset"
import UploadZone from "../upload-zone"
import useScreenshotStitcher from "./_hooks/use-screenshot-stitcher"
import { CHECKERBOARD_STYLE } from "./constants"

function ScreenshotStitcher({
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
  sourceImages = EMPTY_SOURCE_IMAGES,
  onRemoveSourceImage,
  onAddSourceImages,
}: EditorToolProps) {
  const isPanel = variant === "panel"
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("png")
  const sourceFileInputRef = useRef<HTMLInputElement>(null)
  const {
    images,
    isDragOver,
    frameWidth,
    frameHeight,
    imageSpacing,
    direction,
    backgroundColor,
    transparentBackground,
    isProcessing,
    stitched,
    stitchError,
    fileInputRef,
    setFrameWidth,
    setFrameHeight,
    setImageSpacing,
    setDirection,
    setBackgroundColor,
    setTransparentBackground,
    setIsDragOver,
    addFiles,
    removeImage,
    handleStitch,
    resetLocal,
  } = useScreenshotStitcher({
    isActive,
    onResult,
    onSourceImage,
    onAddSourceImages,
  })

  useDroppedFiles({
    isActive,
    droppedFiles,
    droppedFilesKey,
    onLoad: (files) => {
      void addFiles(files)
    },
  })

  useClipboardPaste({
    isActive,
    onFiles: (files) => {
      void addFiles(files)
    },
  })

  useWorkspaceReset({ workspaceResetKey, onReset: resetLocal })

  const handleClear = useCallback(() => {
    resetLocal()
    onClearWorkspace?.()
  }, [resetLocal, onClearWorkspace])

  const handleAddToSource = useCallback(async () => {
    if (!stitched?.blob) return
    const file = new File([stitched.blob], stitched.fileName, {
      type: stitched.blob.type || "image/png",
    })
    await onAddSourceImages?.([file])
  }, [stitched, onAddSourceImages])

  const handleSelectSource = useCallback(
    (id: string) => {
      const source = sourceImages.find((img) => img.id === id)
      if (!source) return
      const file = new File([source.blob], source.name, {
        type: source.blob.type || "image/png",
      })
      void addFiles([file], false)
    },
    [sourceImages, addFiles],
  )

  const handleSourceFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files ? Array.from(event.target.files) : []
      if (files.length > 0) void addFiles(files)
      event.target.value = ""
    },
    [addFiles],
  )

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) void addFiles(event.target.files)
      event.target.value = ""
    },
    [addFiles],
  )

  const handleUploadDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragOver(false)
      void addFiles(event.dataTransfer.files)
    },
    [addFiles, setIsDragOver],
  )

  const handleDownload = useCallback(
    async (url: string) => {
      try {
        await downloadBlob(
          url,
          `stitched-screenshots-${direction}`,
          downloadFormat,
        )
      } catch {}
    },
    [direction, downloadFormat],
  )

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
  const uploadZone = (
    <UploadZone
      isDragOver={isDragOver}
      multiple
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleUploadDrop}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
    />
  )

  if (isPanel) {
    return (
      <ToolPanelLayout
        canvasDropProps={canvasDropProps}
        canvasContent={
          images.length === 0 && sourceImages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center">
              <div className="w-full max-w-xl rounded-xl border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30">
                {uploadZone}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-4">
              <div className="rounded-lg border border-dev-border bg-dev-canvas/95 shadow-2xl shadow-black/30 backdrop-blur">
                <div className="flex items-center justify-between gap-3 border-b border-dev-border px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-dev-text">
                        Canvas Input
                      </h2>
                      {images.length > 0 ? (
                        <p className="text-xs text-dev-text-secondary">
                          {images.length} frame{images.length === 1 ? "" : "s"}{" "}
                          - {outputWidth}×{outputHeight}px output
                        </p>
                      ) : (
                        <p className="text-xs text-dev-text-secondary">
                          No frames added
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {images.length > 0 ? (
                  <div
                    className={clsx(
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
                          className="absolute right-1 top-1 z-10 flex size-6 items-center justify-center rounded-full bg-dev-accent-red text-white opacity-0 shadow cursor-pointer transition-opacity hover:bg-dev-accent-red/90 group-hover:opacity-100"
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
                                ? "clamp(6rem, 12vw, 9rem)"
                                : "clamp(8rem, 20vw, 13rem)",
                          }}
                        >
                          {/* biome-ignore lint/performance/noImgElement: blob URL */}
                          <img
                            src={item.originalUrl}
                            alt={item.file.name}
                            className="size-full object-contain"
                          />
                        </div>
                        <p className="mt-2 truncate text-center text-[11px] text-dev-text-secondary">
                          {index + 1}. {item.naturalWidth}×{item.naturalHeight}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-32 items-center justify-center p-5 text-sm text-dev-text-secondary">
                    Click images from the Source panel to add frames
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-dev-border bg-dev-canvas/95 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between gap-3 border-b border-dev-border px-4 py-2">
                  <div>
                    <h2 className="text-sm font-semibold text-dev-text">
                      Export Preview
                    </h2>
                    <p className="text-xs text-dev-text-secondary">
                      Generated image appears here after stitching.
                    </p>
                  </div>
                  {stitched ? (
                    <span className="rounded bg-dev-inset px-2 py-1 text-xs font-medium text-dev-text-secondary">
                      {stitched.width}×{stitched.height}
                    </span>
                  ) : null}
                </div>
                <div className="min-h-52 overflow-auto p-5">
                  {stitched ? (
                    <div
                      className="mx-auto inline-block rounded border border-dev-border"
                      style={
                        transparentBackground ? CHECKERBOARD_STYLE : undefined
                      }
                    >
                      {/* biome-ignore lint/performance/noImgElement: blob URL */}
                      <img
                        src={stitched.url}
                        alt="Stitched screenshots"
                        className="block max-h-[28rem] max-w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-42 items-center justify-center rounded border border-dashed border-dev-border bg-dev-inset/80 text-sm text-dev-text-secondary">
                      Configure the frames, then stitch to preview the final
                      PNG.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }
        sidebarContent={
          <>
            <div>
              <h2 className="text-base font-semibold text-dev-text">
                Stitcher
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-dev-text-secondary">
                Stack images into equal frames without cropping or stretching
                the content.
              </p>
            </div>

            <SourceImagePanel
              sourceImages={sourceImages}
              activeSourceId={null}
              onSelectSource={handleSelectSource}
              onRemoveSourceImage={onRemoveSourceImage}
              onAddSourceImages={onAddSourceImages}
              sourceFileInputRef={sourceFileInputRef}
            />

            <DocumentSettings
              imagesLength={images.length}
              outputWidth={outputWidth}
              outputHeight={outputHeight}
              frameWidth={frameWidth}
              frameHeight={frameHeight}
              imageSpacing={imageSpacing}
              onFrameWidthChange={setFrameWidth}
              onFrameHeightChange={setFrameHeight}
              onImageSpacingChange={setImageSpacing}
              onMatchLargest={() => {
                if (images.length === 0) return
                setFrameWidth(
                  Math.max(...images.map((image) => image.naturalWidth)),
                )
                setFrameHeight(
                  Math.max(...images.map((image) => image.naturalHeight)),
                )
              }}
            />

            <LayoutSettings
              direction={direction}
              onDirectionChange={setDirection}
            />

            <BackgroundSettings
              backgroundColor={backgroundColor}
              transparentBackground={transparentBackground}
              onBackgroundColorChange={setBackgroundColor}
              onTransparentBackgroundChange={setTransparentBackground}
            />

            {stitchError ? (
              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <p className="text-xs text-dev-accent-red">{stitchError}</p>
              </div>
            ) : null}

            <SidebarActions
              primaryAction={{
                label: isProcessing ? "Stitching..." : "Stitch Screenshots",
                icon: <Images className="size-4" />,
                onClick: handleStitch,
                disabled: images.length === 0 || isProcessing,
              }}
              download={
                stitched
                  ? {
                      url: stitched.url,
                      baseName: `stitched-screenshots-${direction}`,
                      format: downloadFormat,
                      onFormatChange: setDownloadFormat,
                    }
                  : undefined
              }
              showAddToSource={!!stitched}
              onAddToSource={handleAddToSource}
              showCopy={stitched != null && hasClipboard}
              onCopyToClipboard={onCopyToClipboard}
              showClear={images.length > 0}
              onClear={handleClear}
            />
          </>
        }
        hiddenInputs={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
            <input
              ref={sourceFileInputRef}
              type="file"
              accept="image/*"
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
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-dev-text mb-1">
            Screenshot Stitcher
          </h1>
          <p className="text-sm text-dev-text-secondary mb-6">
            Stack mobile screenshots horizontally or vertically in matching
            frames while preserving their content.
          </p>

          {images.length === 0 ? (
            uploadZone
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
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-dev-accent-red text-white rounded-full flex items-center justify-center opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity"
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
                    aria-label="Add images"
                    className="h-24 w-16 border-2 border-dashed border-dev-border rounded flex items-center justify-center cursor-pointer hover:border-dev-border-muted transition-colors"
                  >
                    <Plus className="w-5 h-5 text-dev-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-dev-text-secondary">
                  <label htmlFor="stitch-frame-w">Frame W</label>
                  <StepperInput
                    id="stitch-frame-w"
                    value={frameWidth}
                    onChange={(event) =>
                      setFrameWidth(Math.max(1, Number(event.target.value)))
                    }
                    onIncrement={() => setFrameWidth(frameWidth + 1)}
                    onDecrement={() =>
                      setFrameWidth(Math.max(1, frameWidth - 1))
                    }
                    min={1}
                    className="w-28"
                  />
                  px
                </div>
                <span className="text-dev-text-secondary">×</span>
                <div className="flex items-center gap-2 text-xs text-dev-text-secondary">
                  <label htmlFor="stitch-frame-h">Frame H</label>
                  <StepperInput
                    id="stitch-frame-h"
                    value={frameHeight}
                    onChange={(event) =>
                      setFrameHeight(Math.max(1, Number(event.target.value)))
                    }
                    onIncrement={() => setFrameHeight(frameHeight + 1)}
                    onDecrement={() =>
                      setFrameHeight(Math.max(1, frameHeight - 1))
                    }
                    min={1}
                    className="w-28"
                  />
                  px
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
                  className="px-2.5 py-1 rounded text-xs font-medium bg-dev-button text-dev-text cursor-pointer hover:bg-dev-button-hover transition-colors"
                >
                  Match largest
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDirection("horizontal")}
                    className={clsx(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors",
                      direction === "horizontal"
                        ? "bg-dev-accent-blue text-white"
                        : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                    )}
                  >
                    <Columns3 className="w-3.5 h-3.5" />
                    Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("vertical")}
                    className={clsx(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors",
                      direction === "vertical"
                        ? "bg-dev-accent-blue text-white"
                        : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                    )}
                  >
                    <Rows3 className="w-3.5 h-3.5" />
                    Vertical
                  </button>
                </div>
                <div className="flex items-center gap-2 border-l border-dev-border pl-4">
                  <button
                    type="button"
                    onClick={() =>
                      setTransparentBackground(!transparentBackground)
                    }
                    className={clsx(
                      "px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors",
                      transparentBackground
                        ? "bg-dev-accent-blue text-white"
                        : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                    )}
                  >
                    Transparent
                  </button>
                  {!transparentBackground ? (
                    <input
                      type="color"
                      aria-label="Background color"
                      value={backgroundColor}
                      onChange={(event) =>
                        setBackgroundColor(event.target.value)
                      }
                      className="h-9 w-10 cursor-pointer rounded border border-dev-border"
                    />
                  ) : null}
                </div>
              </div>

              {stitchError ? (
                <p className="text-xs text-dev-accent-red">{stitchError}</p>
              ) : null}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleStitch}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-blue text-white cursor-pointer hover:bg-dev-accent-blue/90 transition-colors disabled:opacity-50"
                >
                  <Images className="w-4 h-4" />
                  {isProcessing ? "Stitching..." : "Stitch Screenshots"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-button text-dev-text cursor-pointer hover:bg-dev-button-hover transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>

              {stitched ? (
                <div>
                  <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                    <h3 className="text-sm font-medium text-dev-text">
                      Output - {stitched.width}×{stitched.height}
                    </h3>
                    <div className="flex items-center gap-2">
                      <DownloadFormatSelector
                        value={downloadFormat}
                        onChange={setDownloadFormat}
                      />
                      <button
                        type="button"
                        onClick={() => void handleDownload(stitched.url)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-green text-white cursor-pointer hover:bg-dev-accent-green/90 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
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
              ) : null}
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  )
}

type DocumentSettingsProps = {
  imagesLength: number
  outputWidth: number
  outputHeight: number
  frameWidth: number
  frameHeight: number
  imageSpacing: number
  onFrameWidthChange: (value: number) => void
  onFrameHeightChange: (value: number) => void
  onImageSpacingChange: (value: number) => void
  onMatchLargest: () => void
}

function DocumentSettings({
  imagesLength,
  outputWidth,
  outputHeight,
  frameWidth,
  frameHeight,
  imageSpacing,
  onFrameWidthChange,
  onFrameHeightChange,
  onImageSpacingChange,
  onMatchLargest,
}: DocumentSettingsProps) {
  return (
    <div className="mt-4 rounded-md border border-dev-border bg-dev-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
        Document
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="grid min-w-0 gap-1 text-xs text-dev-text-secondary">
          <label htmlFor="doc-frame-w">Frame W</label>
          <StepperInput
            id="doc-frame-w"
            value={frameWidth}
            onChange={(event) =>
              onFrameWidthChange(Math.max(1, Number(event.target.value)))
            }
            onIncrement={() => onFrameWidthChange(frameWidth + 1)}
            onDecrement={() => onFrameWidthChange(Math.max(1, frameWidth - 1))}
            min={1}
          />
        </div>
        <div className="grid min-w-0 gap-1 text-xs text-dev-text-secondary">
          <label htmlFor="doc-frame-h">Frame H</label>
          <StepperInput
            id="doc-frame-h"
            value={frameHeight}
            onChange={(event) =>
              onFrameHeightChange(Math.max(1, Number(event.target.value)))
            }
            onIncrement={() => onFrameHeightChange(frameHeight + 1)}
            onDecrement={() =>
              onFrameHeightChange(Math.max(1, frameHeight - 1))
            }
            min={1}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onMatchLargest}
        disabled={imagesLength === 0}
        className="mt-2 w-full rounded bg-dev-button px-3 py-2 text-sm font-medium text-dev-text cursor-pointer transition-colors hover:bg-dev-button-hover disabled:opacity-50"
      >
        Match Largest Screenshot
      </button>
      <p className="mt-2 text-xs text-dev-text-secondary">
        Output:{" "}
        {imagesLength > 0 ? `${outputWidth}×${outputHeight}px` : "add images"}
      </p>
      <div className="mt-3 grid gap-1 text-xs text-dev-text-secondary">
        <label htmlFor="doc-spacing">Spacing</label>
        <div className="flex items-center gap-2">
          <StepperInput
            id="doc-spacing"
            value={imageSpacing}
            onChange={(event) =>
              onImageSpacingChange(Math.max(0, Number(event.target.value)))
            }
            onIncrement={() => onImageSpacingChange(imageSpacing + 1)}
            onDecrement={() =>
              onImageSpacingChange(Math.max(0, imageSpacing - 1))
            }
            min={0}
            className="flex-1"
          />
          <span>px</span>
        </div>
      </div>
    </div>
  )
}

type LayoutSettingsProps = {
  direction: "horizontal" | "vertical"
  onDirectionChange: (direction: "horizontal" | "vertical") => void
}

function LayoutSettings({ direction, onDirectionChange }: LayoutSettingsProps) {
  return (
    <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
        Layout
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onDirectionChange("horizontal")}
          className={clsx(
            "flex items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium cursor-pointer transition-colors",
            direction === "horizontal"
              ? "bg-dev-accent-blue text-white"
              : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
          )}
        >
          <Columns3 className="size-4" />
          Row
        </button>
        <button
          type="button"
          onClick={() => onDirectionChange("vertical")}
          className={clsx(
            "flex items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium cursor-pointer transition-colors",
            direction === "vertical"
              ? "bg-dev-accent-blue text-white"
              : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
          )}
        >
          <Rows3 className="size-4" />
          Column
        </button>
      </div>
    </div>
  )
}

type BackgroundSettingsProps = {
  backgroundColor: string
  transparentBackground: boolean
  onBackgroundColorChange: (color: string) => void
  onTransparentBackgroundChange: (transparent: boolean) => void
}

function BackgroundSettings({
  backgroundColor,
  transparentBackground,
  onBackgroundColorChange,
  onTransparentBackgroundChange,
}: BackgroundSettingsProps) {
  return (
    <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
        Background
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onTransparentBackgroundChange(!transparentBackground)}
          className={clsx(
            "flex-1 rounded px-3 py-2 text-sm font-medium cursor-pointer transition-colors",
            transparentBackground
              ? "bg-dev-accent-blue text-white"
              : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
          )}
        >
          Transparent
        </button>
        {!transparentBackground ? (
          <input
            type="color"
            aria-label="Background color"
            value={backgroundColor}
            onChange={(event) => onBackgroundColorChange(event.target.value)}
            className="h-9 w-10 cursor-pointer rounded border border-dev-border"
          />
        ) : null}
      </div>
    </div>
  )
}

export default memo(ScreenshotStitcher)
