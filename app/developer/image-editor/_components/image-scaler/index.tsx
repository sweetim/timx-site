"use client"

import clsx from "clsx"
import { Download, Lock, MoveHorizontal, MoveVertical, Scaling, Trash2, Unlock } from "lucide-react"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"
import StepperInput from "../../../_components/stepper-input"
import type { DownloadFormat } from "../download-format-selector"
import { downloadBlob } from "../download-format-selector"
import type { SourceImage } from "../image-editor"
import SidebarActions from "../shared/sidebar-actions"
import SourceImagePanel from "../shared/source-image-panel"
import ToolPanelLayout from "../shared/tool-panel-layout"
import type { EditorToolProps } from "../shared/types"
import useClipboardPaste from "../shared/use-clipboard-paste"
import useDroppedFiles from "../shared/use-dropped-files"
import useSourceFileInput from "../shared/use-source-file-input"
import useWorkspaceReset from "../shared/use-workspace-reset"
import UploadZone from "../upload-zone"
import useImageScaler from "./_hooks/use-image-scaler"

const EMPTY_SOURCE_IMAGES: SourceImage[] = []

function ImageScaler({
  variant = "page",
  isActive = true,
  workspaceResetKey = 0,
  activeSourceId: activeSourceIdProp,
  onActiveSourceChange,
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
  const droppedFileRef = useRef<File | null>(null)
  const loadedSourceIdRef = useRef<string | null>(null)
  const sourceImagesRef = useRef(sourceImages)
  useEffect(() => { sourceImagesRef.current = sourceImages }, [sourceImages])
  const activeSourceId = activeSourceIdProp ?? null
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("png")
  const { sourceFileInputRef, handleSourceFileInput } = useSourceFileInput({ onAddSourceImages })

  const {
    status,
    percentage,
    targetWidth,
    targetHeight,
    lockAspectRatio,
    isDragOver,
    fileInputRef,
    resultBlobRef,
    setLockAspectRatio,
    setIsDragOver,
    loadImage,
    handlePercentageChange,
    handleWidthChange,
    handleHeightChange,
    handleScale,
    handleDrop,
    resetLocal,
  } = useImageScaler({ onResult, onSourceImage })

  const handleFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))
      if (imageFiles.length === 0) return

      const addedSources = (await onAddSourceImages?.(imageFiles)) ?? []
      const firstSource = addedSources.find((source) => source.blob === imageFiles[0]) ?? addedSources[0]

      if (firstSource) {
        loadedSourceIdRef.current = firstSource.id
        onActiveSourceChange?.(firstSource.id)
        const file = new File([firstSource.blob], firstSource.name, { type: firstSource.blob.type || "image/png" })
        loadImage(file, false)
      }
    },
    [onAddSourceImages, loadImage, onActiveSourceChange],
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
    const match = sourceImagesRef.current.find((img) => img.blob === droppedFileRef.current)
    if (match) {
      loadedSourceIdRef.current = match.id
      onActiveSourceChange?.(match.id)
      droppedFileRef.current = null
    }
  }, [isActive, onActiveSourceChange])

  useClipboardPaste({ isActive, onFiles: (files) => { void handleFiles(files) } })

  useWorkspaceReset({
    workspaceResetKey,
    onReset: () => {
      droppedFileRef.current = null
      loadedSourceIdRef.current = null
      onActiveSourceChange?.(null)
      resetLocal()
    },
  })

  useEffect(() => {
    if (!isActive || !activeSourceId) return
    if (loadedSourceIdRef.current === activeSourceId && status.phase !== "idle") return
    const source = sourceImagesRef.current.find((img) => img.id === activeSourceId)
    if (!source) return
    const file = new File([source.blob], source.name, { type: source.blob.type || "image/png" })
    loadedSourceIdRef.current = source.id
    loadImage(file, false)
  }, [isActive, activeSourceId, status.phase, loadImage])

  const handleSelectSource = (id: string) => {
    droppedFileRef.current = null
    onActiveSourceChange?.(id)
  }

  const handleClear = useCallback(() => {
    droppedFileRef.current = null
    loadedSourceIdRef.current = null
    onActiveSourceChange?.(null)
    resetLocal()
    onClearWorkspace?.()
  }, [resetLocal, onClearWorkspace, onActiveSourceChange])

  const handleDownload = useCallback(async () => {
    if (status.phase !== "scaled") return
    try { await downloadBlob(status.scaledUrl, "scaled-image", downloadFormat) } catch {}
  }, [status, downloadFormat])

  const handleAddToSource = useCallback(async () => {
    const blob = resultBlobRef.current
    if (!blob || status.phase !== "scaled") return
    const file = new File([blob], "scaled-image.png", { type: blob.type || "image/png" })
    await onAddSourceImages?.([file])
  }, [status, onAddSourceImages])

  const handleUploadClick = useCallback(() => { fileInputRef.current?.click() }, [])

  const handleUploadDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }, [])
  const handleUploadDragLeave = useCallback(() => { setIsDragOver(false) }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) loadImage(file)
      e.target.value = ""
    },
    [loadImage],
  )

  if (isPanel) {
    return (
      <ToolPanelLayout
        canvasDropProps={canvasDropProps}
        canvasContent={
          <div className="mx-auto flex min-h-full max-w-6xl flex-col items-center justify-center gap-4">
            {match(status)
              .with({ phase: "idle" }, () => (
                <div className="flex min-h-full w-full items-center justify-center">
                  <div className="w-full max-w-xl rounded-xl border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30">
                    <UploadZone
                      isDragOver={isDragOver}
                      onClick={handleUploadClick}
                      onDrop={handleDrop}
                      onDragOver={handleUploadDragOver}
                      onDragLeave={handleUploadDragLeave}
                    />
                  </div>
                </div>
              ))
              .with({ phase: "editing" }, ({ imageUrl, imageWidth, imageHeight }) => (
                <div className="rounded-lg border border-dev-border bg-dev-canvas/95 p-3 shadow-2xl shadow-black/30">
                  <p className="mb-2 text-xs text-dev-text-secondary text-center">
                    Original: {imageWidth} × {imageHeight}px
                  </p>
                  <div className="overflow-hidden rounded bg-dev-inset">
                    {/* biome-ignore lint/performance/noImgElement: blob URL */}
                    <img
                      src={imageUrl}
                      alt="Source"
                      className="mx-auto block max-h-[28rem] max-w-full object-contain"
                      draggable={false}
                    />
                  </div>
                </div>
              ))
              .with({ phase: "scaled" }, ({ originalUrl, scaledUrl }) => (
                <>
                  <div className="rounded-lg border border-dev-border bg-dev-canvas/95 p-3 shadow-2xl shadow-black/30">
                    <div className="overflow-hidden rounded bg-dev-inset">
                      {/* biome-ignore lint/performance/noImgElement: blob URL */}
                      <img
                        src={originalUrl}
                        alt="Source"
                        className="mx-auto block max-h-[20rem] max-w-full object-contain"
                        draggable={false}
                      />
                    </div>
                  </div>
                  <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 shadow-xl shadow-black/20">
                    <div className="flex items-center justify-between gap-3 border-b border-dev-border px-4 py-2">
                      <div>
                        <h2 className="text-sm font-semibold text-dev-text">Export Preview</h2>
                        <p className="text-xs text-dev-text-secondary">
                          {targetWidth} × {targetHeight}px ({percentage}%)
                        </p>
                      </div>
                    </div>
                    <div className="min-h-52 overflow-auto p-5">
                      {/* biome-ignore lint/performance/noImgElement: blob URL */}
                      <img
                        src={scaledUrl}
                        alt="Scaled result"
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
              <h2 className="text-base font-semibold text-dev-text">Scale</h2>
              <p className="mt-1 text-xs leading-relaxed text-dev-text-secondary">
                Resize an image by percentage or explicit dimensions.
              </p>
            </div>

            <SourceImagePanel
              sourceImages={sourceImages}
              activeSourceId={activeSourceId}
              onSelectSource={handleSelectSource}
              onRemoveSourceImage={onRemoveSourceImage}
              onRemoveActiveSource={() => onActiveSourceChange?.(null)}
              onAddSourceImages={onAddSourceImages}
              sourceFileInputRef={sourceFileInputRef}
            />

            {status.phase === "editing" || status.phase === "scaled" ? (
              <ScaleControls
                percentage={percentage}
                targetWidth={targetWidth}
                targetHeight={targetHeight}
                lockAspectRatio={lockAspectRatio}
                onPercentageChange={handlePercentageChange}
                onWidthChange={handleWidthChange}
                onHeightChange={handleHeightChange}
                onToggleLock={() => setLockAspectRatio((prev) => !prev)}
                onScale={handleScale}
              />
            ) : null}

            <SidebarActions
              primaryAction={
                status.phase === "editing" || status.phase === "scaled"
                  ? { label: "Scale Image", icon: <Scaling className="size-4" />, onClick: handleScale }
                  : undefined
              }
              download={
                status.phase === "scaled"
                  ? { url: status.scaledUrl, baseName: "scaled-image", format: downloadFormat, onFormatChange: setDownloadFormat }
                  : undefined
              }
              showAddToSource={status.phase === "scaled"}
              onAddToSource={handleAddToSource}
              showCopy={status.phase === "scaled" && hasClipboard}
              onCopyToClipboard={onCopyToClipboard}
              showClear={status.phase !== "idle"}
              onClear={handleClear}
            />
          </>
        }
        hiddenInputs={
          <>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />
            <input ref={sourceFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSourceFileInput} />
          </>
        }
      />
    )
  }

  return (
    <div className="flex flex-col h-full bg-dev-canvas">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-dev-text mb-1">Image Scaler</h1>
          <p className="text-sm text-dev-text-secondary mb-6">
            Upload an image, set a scale percentage or target dimensions, then export. Everything runs locally in your browser.
          </p>

          {match(status)
            .with({ phase: "idle" }, () => (
              <UploadZone
                isDragOver={isDragOver}
                onClick={handleUploadClick}
                onDrop={handleDrop}
                onDragOver={handleUploadDragOver}
                onDragLeave={handleUploadDragLeave}
              />
            ))
            .with({ phase: "editing" }, ({ imageUrl, imageWidth, imageHeight }) => (
              <div className="flex flex-col gap-4">
                <ScaleControls
                  percentage={percentage}
                  targetWidth={targetWidth}
                  targetHeight={targetHeight}
                  lockAspectRatio={lockAspectRatio}
                  onPercentageChange={handlePercentageChange}
                  onWidthChange={handleWidthChange}
                  onHeightChange={handleHeightChange}
                  onToggleLock={() => setLockAspectRatio((prev) => !prev)}
                  onScale={handleScale}
                  variant="page"
                />
                <p className="text-xs text-dev-text-secondary">
                  Original: {imageWidth} × {imageHeight}px
                </p>
                <div className="bg-dev-inset rounded-md overflow-hidden">
                  {/* biome-ignore lint/performance/noImgElement: blob URL */}
                  <img src={imageUrl} alt="Source" className="block max-w-full" draggable={false} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleScale} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-blue text-white hover:bg-dev-accent-blue/90 transition-colors cursor-pointer">
                    <Scaling className="w-4 h-4" />
                    Scale
                  </button>
                  <button type="button" onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-button text-dev-text hover:bg-dev-button-hover transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            ))
            .with({ phase: "scaled" }, ({ originalUrl, scaledUrl }) => (
              <div className="flex flex-col gap-4">
                <ScaleControls
                  percentage={percentage}
                  targetWidth={targetWidth}
                  targetHeight={targetHeight}
                  lockAspectRatio={lockAspectRatio}
                  onPercentageChange={handlePercentageChange}
                  onWidthChange={handleWidthChange}
                  onHeightChange={handleHeightChange}
                  onToggleLock={() => setLockAspectRatio((prev) => !prev)}
                  onScale={handleScale}
                  variant="page"
                />
                <div className="bg-dev-inset rounded-md overflow-hidden">
                  {/* biome-ignore lint/performance/noImgElement: blob URL */}
                  <img src={originalUrl} alt="Source" className="block max-w-full" draggable={false} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleScale} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-blue text-white hover:bg-dev-accent-blue/90 transition-colors cursor-pointer">
                    <Scaling className="w-4 h-4" />
                    Re-scale
                  </button>
                  <button type="button" onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-button text-dev-text hover:bg-dev-button-hover transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                    <h3 className="text-sm font-medium text-dev-text">
                      Export Preview ({targetWidth} × {targetHeight}px)
                    </h3>
                    <button type="button" onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-green text-white hover:bg-dev-accent-green/90 transition-colors cursor-pointer">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <div className="bg-dev-inset rounded-md p-4 overflow-auto border border-dev-border">
                    {/* biome-ignore lint/performance/noImgElement: blob URL */}
                    <img src={scaledUrl} alt="Scaled result" className="block max-w-full rounded" />
                  </div>
                </div>
              </div>
            ))
            .exhaustive()}
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />
    </div>
  )
}

type ScaleControlsProps = {
  percentage: number
  targetWidth: number
  targetHeight: number
  lockAspectRatio: boolean
  onPercentageChange: (value: number) => void
  onWidthChange: (value: number) => void
  onHeightChange: (value: number) => void
  onToggleLock: () => void
  onScale: () => void
  variant?: "panel" | "page"
}

function ScaleControls({
  percentage,
  targetWidth,
  targetHeight,
  lockAspectRatio,
  onPercentageChange,
  onWidthChange,
  onHeightChange,
  onToggleLock,
  variant = "panel",
}: ScaleControlsProps) {
  const [draftWidth, setDraftWidth] = useState<string | null>(null)
  const [draftHeight, setDraftHeight] = useState<string | null>(null)

  const displayWidth = draftWidth ?? String(targetWidth)
  const displayHeight = draftHeight ?? String(targetHeight)

  const commitWidth = useCallback(() => {
    if (draftWidth !== null) {
      const parsed = parseInt(draftWidth, 10)
      if (!Number.isNaN(parsed) && parsed > 0) onWidthChange(parsed)
      setDraftWidth(null)
    }
  }, [draftWidth, onWidthChange])

  const commitHeight = useCallback(() => {
    if (draftHeight !== null) {
      const parsed = parseInt(draftHeight, 10)
      if (!Number.isNaN(parsed) && parsed > 0) onHeightChange(parsed)
      setDraftHeight(null)
    }
  }, [draftHeight, onHeightChange])

  const LockIcon = lockAspectRatio ? Lock : Unlock

  if (variant === "page") {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-xs text-dev-text-secondary">Scale</span>
          <StepperInput
            value={percentage}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10)
              if (!Number.isNaN(parsed)) onPercentageChange(parsed)
            }}
            onIncrement={() => onPercentageChange(percentage + 10)}
            onDecrement={() => onPercentageChange(Math.max(1, percentage - 10))}
            min={1}
            max={500}
            step={10}
            className="w-28"
          />
          <span className="text-xs text-dev-text-secondary">%</span>
        </div>
        <div className="flex items-center gap-1">
          <StepperInput
            value={displayWidth}
            onChange={(e) => setDraftWidth(e.target.value)}
            onBlur={commitWidth}
            onIncrement={() => onWidthChange(targetWidth + 10)}
            onDecrement={() => onWidthChange(Math.max(1, targetWidth - 10))}
            min={1}
            className="w-28"
          />
          <span className="text-xs text-dev-text-secondary">×</span>
          <StepperInput
            value={displayHeight}
            onChange={(e) => setDraftHeight(e.target.value)}
            onBlur={commitHeight}
            onIncrement={() => onHeightChange(targetHeight + 10)}
            onDecrement={() => onHeightChange(Math.max(1, targetHeight - 10))}
            min={1}
            className="w-28"
          />
          <span className="text-xs text-dev-text-secondary">px</span>
        </div>
        <button
          type="button"
          onClick={onToggleLock}
          title={lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
          className={clsx(
            "p-1.5 rounded transition-colors cursor-pointer",
            lockAspectRatio ? "bg-dev-accent-blue text-white" : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
          )}
        >
          <LockIcon className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
          Scale Percentage
        </p>
        <div className="mt-3">
          <StepperInput
            value={percentage}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10)
              if (!Number.isNaN(parsed)) onPercentageChange(parsed)
            }}
            onIncrement={() => onPercentageChange(percentage + 10)}
            onDecrement={() => onPercentageChange(Math.max(1, percentage - 10))}
            min={1}
            max={500}
            step={10}
          />
        </div>
        <input
          type="range"
          min={1}
          max={500}
          value={percentage}
          onChange={(e) => onPercentageChange(parseInt(e.target.value, 10))}
          className="mt-2 w-full accent-dev-accent-blue"
        />
      </div>

      <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
            Target Size
          </p>
          <button
            type="button"
            onClick={onToggleLock}
            title={lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
            className={clsx(
              "p-1 rounded transition-colors cursor-pointer",
              lockAspectRatio ? "bg-dev-accent-blue text-white" : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
            )}
          >
            <LockIcon className="size-3.5" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="scale-width" className="text-xs text-dev-text-secondary flex items-center gap-1">
              <MoveHorizontal className="size-3" /> Width
            </label>
            <StepperInput
              id="scale-width"
              value={displayWidth}
              onChange={(e) => setDraftWidth(e.target.value)}
              onBlur={commitWidth}
              onIncrement={() => onWidthChange(targetWidth + 10)}
              onDecrement={() => onWidthChange(Math.max(1, targetWidth - 10))}
              min={1}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label htmlFor="scale-height" className="text-xs text-dev-text-secondary flex items-center gap-1">
              <MoveVertical className="size-3" /> Height
            </label>
            <StepperInput
              id="scale-height"
              value={displayHeight}
              onChange={(e) => setDraftHeight(e.target.value)}
              onBlur={commitHeight}
              onIncrement={() => onHeightChange(targetHeight + 10)}
              onDecrement={() => onHeightChange(Math.max(1, targetHeight - 10))}
              min={1}
              className="mt-1 w-full"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(ImageScaler)
