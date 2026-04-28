"use client"

import clsx from "clsx"
import type { LucideIcon } from "lucide-react"
import { Crop, Eraser, Images, Layers } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import BackgroundRemover from "./background-remover"
import ImageCropper from "./image-cropper/"
import ScreenshotStitcher from "./image-stitch/"

export type EditorTool = "background" | "crop" | "stitch"

export type SourceImage = {
  id: string
  blob: Blob
  url: string
  name: string
  naturalWidth: number
  naturalHeight: number
}

export type BackgroundRemovalResult = {
  blob: Blob
  url: string
}

export type SharedEditorImage = {
  blob: Blob
  key: number
  name: string
  originTool: EditorTool
  url: string
}

type ToolItem = {
  id: EditorTool
  name: string
  shortName: string
  description: string
  icon: LucideIcon
}

export type CanvasDropProps = {
  isDragOver: boolean
  overlayLabel: string
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

const TOOLS: ToolItem[] = [
  {
    id: "background",
    name: "Background Remover",
    shortName: "Remove",
    description: "Remove an image background with local AI processing.",
    icon: Eraser,
  },
  {
    id: "crop",
    name: "Crop",
    shortName: "Crop",
    description: "Crop one image with presets and center or edge handles.",
    icon: Crop,
  },
  {
    id: "stitch",
    name: "Screenshot Stitcher",
    shortName: "Stitch",
    description: "Stack mobile screenshots in equal frames for landing pages.",
    icon: Images,
  },
]

function ImageEditor() {
  const [activeTool, setActiveTool] = useState<EditorTool>("background")
  const [clipboard, setClipboard] = useState<Blob | null>(null)
  const [sharedImage, setSharedImage] = useState<SharedEditorImage | null>(null)
  const [sourceImages, setSourceImages] = useState<SourceImage[]>([])
  const [backgroundRemovalResults, setBackgroundRemovalResults] = useState<
    Record<string, BackgroundRemovalResult>
  >({})
  const [workspaceResetKey, setWorkspaceResetKey] = useState(0)
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false)
  const [droppedFiles, setDroppedFiles] = useState<File[]>([])
  const [droppedFilesKey, setDroppedFilesKey] = useState(0)
  const sharedImageRef = useRef<SharedEditorImage | null>(null)
  const sharedImageCounterRef = useRef(0)
  const sourceImagesRef = useRef<SourceImage[]>([])
  const backgroundRemovalResultsRef = useRef<
    Record<string, BackgroundRemovalResult>
  >({})

  useEffect(() => {
    sharedImageRef.current = sharedImage
  }, [sharedImage])

  useEffect(() => {
    sourceImagesRef.current = sourceImages
  }, [sourceImages])

  useEffect(() => {
    return () => {
      if (sharedImageRef.current)
        URL.revokeObjectURL(sharedImageRef.current.url)
      for (const img of sourceImagesRef.current) URL.revokeObjectURL(img.url)
      for (const result of Object.values(backgroundRemovalResultsRef.current)) {
        URL.revokeObjectURL(result.url)
      }
    }
  }, [])

  const addFilesToSourceImages = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    if (imageFiles.length === 0) return []

    const loaded = await Promise.all(
      imageFiles.map(
        (file) =>
          new Promise<SourceImage | null>((resolve) => {
            const url = URL.createObjectURL(file)
            const img = new Image()
            img.onload = () => {
              resolve({
                id: `${file.name}-${file.lastModified}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                blob: file,
                url,
                name: file.name,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
              })
            }
            img.onerror = () => {
              URL.revokeObjectURL(url)
              resolve(null)
            }
            img.src = url
          }),
      ),
    )

    const valid = loaded.filter((item): item is SourceImage => item !== null)
    if (valid.length === 0) return []

    const nextSourceImages = [...sourceImagesRef.current]
    const added: SourceImage[] = []
    let didAddSource = false

    for (const item of valid) {
      const existing = nextSourceImages.find((img) => img.blob === item.blob)
      if (existing) {
        URL.revokeObjectURL(item.url)
        added.push(existing)
        continue
      }

      nextSourceImages.push(item)
      added.push(item)
      didAddSource = true
    }

    if (didAddSource) {
      sourceImagesRef.current = nextSourceImages
      setSourceImages(nextSourceImages)
    }

    return added
  }, [])

  const removeSourceImage = useCallback((id: string) => {
    const item = sourceImagesRef.current.find((img) => img.id === id)
    if (item) URL.revokeObjectURL(item.url)

    const nextSourceImages = sourceImagesRef.current.filter(
      (img) => img.id !== id,
    )
    sourceImagesRef.current = nextSourceImages
    setSourceImages(nextSourceImages)

    setBackgroundRemovalResults((previousResults) => {
      const previousResult = previousResults[id]
      if (!previousResult) return previousResults

      URL.revokeObjectURL(previousResult.url)
      const nextResults = { ...previousResults }
      delete nextResults[id]
      backgroundRemovalResultsRef.current = nextResults
      return nextResults
    })
  }, [])

  const rememberBackgroundRemovalResult = useCallback(
    (sourceId: string, blob: Blob) => {
      const nextResult = {
        blob,
        url: URL.createObjectURL(blob),
      }

      setBackgroundRemovalResults((previousResults) => {
        const previousResult = previousResults[sourceId]
        if (previousResult) URL.revokeObjectURL(previousResult.url)

        const nextResults = {
          ...previousResults,
          [sourceId]: nextResult,
        }
        backgroundRemovalResultsRef.current = nextResults
        return nextResults
      })
    },
    [],
  )

  const rememberSharedImage = useCallback(
    (blob: Blob, name: string, originTool: EditorTool) => {
      sharedImageCounterRef.current += 1
      const nextImage = {
        blob,
        key: sharedImageCounterRef.current,
        name,
        originTool,
        url: URL.createObjectURL(blob),
      }

      setSharedImage((previousImage) => {
        if (previousImage) URL.revokeObjectURL(previousImage.url)
        sharedImageRef.current = nextImage
        return nextImage
      })
    },
    [],
  )

  const handleSourceImage = useCallback(
    (originTool: EditorTool, blob: Blob, name: string) => {
      rememberSharedImage(blob, name, originTool)
    },
    [rememberSharedImage],
  )

  const handleResult = useCallback(
    (originTool: EditorTool, blob: Blob) => {
      setClipboard(blob)
      rememberSharedImage(blob, `${originTool}-result.png`, originTool)
    },
    [rememberSharedImage],
  )

  const handleClearWorkspace = useCallback(() => {
    setSharedImage((previousImage) => {
      if (previousImage) URL.revokeObjectURL(previousImage.url)
      sharedImageRef.current = null
      return null
    })
    setSourceImages((prev) => {
      for (const img of prev) URL.revokeObjectURL(img.url)
      sourceImagesRef.current = []
      return []
    })
    setBackgroundRemovalResults((previousResults) => {
      for (const result of Object.values(previousResults)) {
        URL.revokeObjectURL(result.url)
      }
      backgroundRemovalResultsRef.current = {}
      return {}
    })
    setWorkspaceResetKey((key) => key + 1)
  }, [])

  const handleCopyToClipboard = useCallback(async () => {
    if (!clipboard) return
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": clipboard }),
    ])
  }, [clipboard])

  const handleToolSwitch = useCallback((id: EditorTool) => {
    setDroppedFiles([])
    setActiveTool(id)
  }, [])

  const canvasDropProps: CanvasDropProps = {
    isDragOver: isCanvasDragOver,
    overlayLabel:
      activeTool === "stitch"
        ? "Drop images to add to canvas"
        : "Drop an image to get started",
    onDragOver: useCallback((e: React.DragEvent) => {
      e.preventDefault()
      setIsCanvasDragOver(true)
    }, []),
    onDragEnter: useCallback((e: React.DragEvent) => {
      e.preventDefault()
      setIsCanvasDragOver(true)
    }, []),
    onDragLeave: useCallback((e: React.DragEvent) => {
      e.preventDefault()
      if (e.currentTarget.contains(e.relatedTarget as Node)) return
      setIsCanvasDragOver(false)
    }, []),
    onDrop: useCallback(
      (e: React.DragEvent) => {
        e.preventDefault()
        setIsCanvasDragOver(false)
        const files = Array.from(e.dataTransfer.files).filter((f) =>
          f.type.startsWith("image/"),
        )
        if (files.length === 0) return
        setDroppedFilesKey((key) => key + 1)
        setDroppedFiles(files)
        void addFilesToSourceImages(files)
      },
      [addFilesToSourceImages],
    ),
  }

  return (
    <div className="h-full min-h-full bg-dev-canvas text-dev-text lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)]">
      <aside className="flex lg:flex-col items-center gap-2 border-b lg:border-b-0 lg:border-r border-dev-border bg-dev-inset px-3 py-2 lg:px-2 lg:py-4">
        <div className="hidden lg:flex size-9 items-center justify-center rounded-md border border-dev-border bg-dev-surface text-dev-text-secondary">
          <Layers className="size-4" />
        </div>
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {TOOLS.map((item) => {
            const Icon = item.icon
            const isActive = item.id === activeTool

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToolSwitch(item.id)}
                className={clsx(
                  "flex lg:flex-col items-center justify-center gap-1 rounded-md px-3 py-2 lg:size-14 lg:px-0 text-xs font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-dev-accent-blue text-white"
                    : "text-dev-text-secondary hover:bg-dev-surface hover:text-dev-text",
                )}
                title={item.name}
              >
                <Icon className="size-4" />
                <span className="lg:text-[10px]">{item.shortName}</span>
              </button>
            )
          })}
        </div>
      </aside>

      <main className="min-h-0 bg-dev-canvas lg:flex lg:flex-col">
        <div className="min-h-155 lg:min-h-0 lg:flex-1 overflow-hidden">
          <div className={activeTool === "background" ? "h-full" : "hidden"}>
            <BackgroundRemover
              variant="panel"
              isActive={activeTool === "background"}
              initialImage={sharedImage}
              workspaceResetKey={workspaceResetKey}
              onSourceImage={(blob, name) =>
                handleSourceImage("background", blob, name)
              }
              onClearWorkspace={handleClearWorkspace}
              onResult={(blob) => handleResult("background", blob)}
              onCopyToClipboard={handleCopyToClipboard}
              hasClipboard={clipboard != null}
              droppedFiles={droppedFiles}
              droppedFilesKey={droppedFilesKey}
              canvasDropProps={canvasDropProps}
              sourceImages={sourceImages}
              onRemoveSourceImage={removeSourceImage}
              onAddSourceImages={addFilesToSourceImages}
              backgroundRemovalResults={backgroundRemovalResults}
              onBackgroundRemovalResult={rememberBackgroundRemovalResult}
            />
          </div>
          <div className={activeTool === "crop" ? "h-full" : "hidden"}>
            <ImageCropper
              variant="panel"
              isActive={activeTool === "crop"}
              initialImage={sharedImage}
              workspaceResetKey={workspaceResetKey}
              onSourceImage={(blob, name) =>
                handleSourceImage("crop", blob, name)
              }
              onClearWorkspace={handleClearWorkspace}
              onResult={(blob) => handleResult("crop", blob)}
              onCopyToClipboard={handleCopyToClipboard}
              hasClipboard={clipboard != null}
              droppedFiles={droppedFiles}
              droppedFilesKey={droppedFilesKey}
              canvasDropProps={canvasDropProps}
              sourceImages={sourceImages}
              onRemoveSourceImage={removeSourceImage}
              onAddSourceImages={addFilesToSourceImages}
            />
          </div>
          <div className={activeTool === "stitch" ? "h-full" : "hidden"}>
            <ScreenshotStitcher
              variant="panel"
              isActive={activeTool === "stitch"}
              initialImage={sharedImage}
              workspaceResetKey={workspaceResetKey}
              onSourceImage={(blob, name) =>
                handleSourceImage("stitch", blob, name)
              }
              onClearWorkspace={handleClearWorkspace}
              onResult={(blob) => handleResult("stitch", blob)}
              onCopyToClipboard={handleCopyToClipboard}
              hasClipboard={clipboard != null}
              droppedFiles={droppedFiles}
              droppedFilesKey={droppedFilesKey}
              canvasDropProps={canvasDropProps}
              sourceImages={sourceImages}
              onRemoveSourceImage={removeSourceImage}
              onAddSourceImages={addFilesToSourceImages}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default ImageEditor
