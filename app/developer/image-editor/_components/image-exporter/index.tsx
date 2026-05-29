"use client"

import clsx from "clsx"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import type { DownloadFormat } from "../download-format-selector"
import { downloadBlob, getFormatOption } from "../download-format-selector"
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
import type { IcoSize } from "./encode-ico"
import { encodeIco, ICO_AVAILABLE_SIZES } from "./encode-ico"

const EMPTY_SOURCE_IMAGES: SourceImage[] = []

function ImageExporter({
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
  useEffect(() => {
    sourceImagesRef.current = sourceImages
  }, [sourceImages])
  const activeSourceId = activeSourceIdProp ?? null
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("png")
  const [quality, setQuality] = useState(92)
  const [icoSize, setIcoSize] = useState<IcoSize>(32)
  const [exportedUrl, setExportedUrl] = useState<string | null>(null)
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [sourceDimensions, setSourceDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { sourceFileInputRef, handleSourceFileInput } = useSourceFileInput({
    onAddSourceImages,
  })

  const revokeExported = useCallback(() => {
    setExportedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setExportedBlob(null)
  }, [])

  const loadImage = useCallback(
    (file: File, notify = true) => {
      setSourceUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      revokeExported()
      const url = URL.createObjectURL(file)
      setSourceUrl(url)
      if (notify) onSourceImage?.(file, file.name)
      const img = new Image()
      img.onload = () => {
        setSourceDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
      }
      img.src = url
    },
    [onSourceImage, revokeExported],
  )

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
        onActiveSourceChange?.(firstSource.id)
        const file = new File([firstSource.blob], firstSource.name, {
          type: firstSource.blob.type || "image/png",
        })
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
    const found = sourceImagesRef.current.find(
      (img) => img.blob === droppedFileRef.current,
    )
    if (found) {
      loadedSourceIdRef.current = found.id
      onActiveSourceChange?.(found.id)
      droppedFileRef.current = null
    }
  }, [isActive, onActiveSourceChange])

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
      onActiveSourceChange?.(null)
      setSourceUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      revokeExported()
      setSourceDimensions(null)
    },
  })

  useEffect(() => {
    if (!isActive || !activeSourceId) return
    if (loadedSourceIdRef.current === activeSourceId && sourceUrl !== null) {
      return
    }
    const source = sourceImagesRef.current.find(
      (img) => img.id === activeSourceId,
    )
    if (!source) return
    const file = new File([source.blob], source.name, {
      type: source.blob.type || "image/png",
    })
    loadedSourceIdRef.current = source.id
    loadImage(file, false)
  }, [isActive, activeSourceId, sourceUrl, loadImage])

  useEffect(() => {
    if (!sourceUrl) return
    let cancelled = false

    if (downloadFormat === "ico") {
      void encodeIco(sourceUrl, [icoSize]).then((blob) => {
        if (cancelled) return
        revokeExported()
        const url = URL.createObjectURL(blob)
        setExportedUrl(url)
        setExportedBlob(blob)
        onResult?.(blob)
      })
      return () => {
        cancelled = true
      }
    }

    const option = getFormatOption(downloadFormat)
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const context = canvas.getContext("2d")
      if (!context) return
      if (downloadFormat === "jpeg") {
        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
      context.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (cancelled || !blob) return
          revokeExported()
          const url = URL.createObjectURL(blob)
          setExportedUrl(url)
          setExportedBlob(blob)
          onResult?.(blob)
        },
        option.mimeType,
        downloadFormat === "png" ? undefined : quality / 100,
      )
    }
    img.src = sourceUrl

    return () => {
      cancelled = true
    }
  }, [sourceUrl, downloadFormat, quality, icoSize, revokeExported, onResult])

  const handleSelectSource = (id: string) => {
    droppedFileRef.current = null
    onActiveSourceChange?.(id)
  }

  const handleAddToSource = useCallback(async () => {
    if (!exportedBlob) return
    const option = getFormatOption(downloadFormat)
    const file = new File(
      [exportedBlob],
      `exported-image.${option.extension}`,
      {
        type: option.mimeType,
      },
    )
    await onAddSourceImages?.([file])
  }, [exportedBlob, downloadFormat, onAddSourceImages])

  const handleClear = useCallback(() => {
    droppedFileRef.current = null
    loadedSourceIdRef.current = null
    onActiveSourceChange?.(null)
    setSourceUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    revokeExported()
    setSourceDimensions(null)
    onClearWorkspace?.()
  }, [revokeExported, onClearWorkspace, onActiveSourceChange])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleUploadDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleUploadDragLeave = useCallback(() => {}, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) loadImage(file)
      e.target.value = ""
    },
    [loadImage],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file?.type.startsWith("image/")) loadImage(file)
    },
    [loadImage],
  )

  const isLossy = downloadFormat === "jpeg" || downloadFormat === "webp"

  if (isPanel) {
    return (
      <ToolPanelLayout
        canvasDropProps={canvasDropProps}
        canvasContent={
          <div className="mx-auto flex min-h-full max-w-5xl flex-col items-center justify-center gap-4">
            {!sourceUrl ? (
              <div className="flex min-h-full w-full items-center justify-center">
                <div className="w-full max-w-xl rounded-xl border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30">
                  <UploadZone
                    isDragOver={false}
                    onClick={handleUploadClick}
                    onDrop={handleDrop}
                    onDragOver={handleUploadDragOver}
                    onDragLeave={handleUploadDragLeave}
                  />
                </div>
              </div>
            ) : null}

            {sourceUrl && !exportedUrl ? (
              <div className="w-full rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
                {/* biome-ignore lint/performance/noImgElement: blob URL */}
                <img
                  src={sourceUrl}
                  alt="Source"
                  className="mx-auto block max-h-[28rem] max-w-full object-contain rounded-md"
                />
                {sourceDimensions ? (
                  <p className="mt-2 text-center text-xs text-dev-text-secondary">
                    {sourceDimensions.width} × {sourceDimensions.height}px
                  </p>
                ) : null}
              </div>
            ) : null}

            {sourceUrl && exportedUrl ? (
              <div className="flex w-full min-h-full flex-col gap-4">
                <div className="rounded-lg border border-dev-border bg-dev-canvas/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
                  {/* biome-ignore lint/performance/noImgElement: blob URL */}
                  <img
                    src={sourceUrl}
                    alt="Source"
                    className="mx-auto block max-h-[20rem] max-w-full object-contain rounded-md"
                  />
                </div>
                <div className="rounded-lg border border-dev-border bg-dev-canvas/95 shadow-xl shadow-black/20">
                  <div className="flex items-center justify-between gap-3 border-b border-dev-border px-4 py-2">
                    <div>
                      <h2 className="text-sm font-semibold text-dev-text">
                        Export Preview
                      </h2>
                      <p className="text-xs text-dev-text-secondary">
                        {downloadFormat === "ico"
                          ? `${icoSize}×${icoSize}px`
                          : sourceDimensions
                            ? `${sourceDimensions.width} × ${sourceDimensions.height}px`
                            : ""}
                        {" · "}
                        {formatFileSize(exportedBlob?.size ?? 0)}
                      </p>
                    </div>
                  </div>
                  <div className="min-h-52 overflow-auto p-5">
                    {/* biome-ignore lint/performance/noImgElement: blob URL */}
                    <img
                      src={exportedUrl}
                      alt="Exported result"
                      className="mx-auto block max-h-[28rem] max-w-full rounded border border-dev-border"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        }
        sidebarContent={
          <>
            <div>
              <h2 className="text-base font-semibold text-dev-text">Export</h2>
              <p className="mt-1 text-xs leading-relaxed text-dev-text-secondary">
                Convert an image to a different format with quality control for
                lossy formats, or generate a favicon (.ico).
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

            {isLossy && sourceUrl ? (
              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
                    Quality
                  </span>
                  <span className="text-xs font-medium text-dev-text">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="mt-2 w-full accent-dev-accent-blue"
                />
              </div>
            ) : null}

            {downloadFormat === "ico" && sourceUrl ? (
              <div className="mt-3 rounded-md border border-dev-border bg-dev-surface p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-dev-text-secondary">
                  Size
                </p>
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {ICO_AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setIcoSize(size)}
                      className={clsx(
                        "rounded px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                        icoSize === size
                          ? "bg-dev-accent-blue text-white"
                          : "bg-dev-button text-dev-text hover:bg-dev-button-hover",
                      )}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <SidebarActions
              download={
                exportedUrl
                  ? {
                      url: exportedUrl,
                      baseName: "exported-image",
                      format: downloadFormat,
                      onFormatChange: setDownloadFormat,
                    }
                  : undefined
              }
              showAddToSource={!!exportedBlob}
              onAddToSource={handleAddToSource}
              showCopy={exportedUrl != null && hasClipboard}
              onCopyToClipboard={onCopyToClipboard}
              showClear={sourceUrl !== null}
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
              onChange={handleFileInputChange}
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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-dev-text mb-1">
            Image Exporter
          </h1>
          <p className="text-sm text-dev-text-secondary mb-6">
            Upload an image and convert it to PNG, JPEG, WebP, or ICO favicon
            with quality control. Everything runs locally in your browser.
          </p>

          {!sourceUrl ? (
            <UploadZone
              isDragOver={false}
              onClick={handleUploadClick}
              onDrop={handleDrop}
              onDragOver={handleUploadDragOver}
              onDragLeave={handleUploadDragLeave}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-dev-inset rounded-md overflow-hidden">
                {/* biome-ignore lint/performance/noImgElement: blob URL */}
                <img
                  src={sourceUrl}
                  alt="Source"
                  className="block max-w-full"
                  draggable={false}
                />
              </div>
              {sourceDimensions ? (
                <p className="text-xs text-dev-text-secondary">
                  Original: {sourceDimensions.width} × {sourceDimensions.height}
                  px
                </p>
              ) : null}

              {exportedUrl ? (
                <div>
                  <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                    <h3 className="text-sm font-medium text-dev-text">
                      Exported — {formatFileSize(exportedBlob?.size ?? 0)}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        void downloadBlob(
                          exportedUrl,
                          "exported-image",
                          downloadFormat,
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-dev-accent-green text-white hover:bg-dev-accent-green/90 transition-colors cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                  <div className="bg-dev-inset rounded-md p-4 overflow-auto border border-dev-border">
                    {/* biome-ignore lint/performance/noImgElement: blob URL */}
                    <img
                      src={exportedUrl}
                      alt="Exported result"
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
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default memo(ImageExporter)
