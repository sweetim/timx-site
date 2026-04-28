"use client"

import clsx from "clsx"
import type { LucideIcon } from "lucide-react"
import { Crop, Eraser, Images, Layers } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import BackgroundRemover from "./background-remover"
import ImageCropper from "./image-cropper/"
import ScreenshotStitcher from "./image-stitch/"

export type EditorTool = "background" | "crop" | "stitch"

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
  const [activeTool, setActiveTool] = useState<EditorTool>("stitch")
  const [clipboard, setClipboard] = useState<Blob | null>(null)
  const [sharedImage, setSharedImage] = useState<SharedEditorImage | null>(null)
  const [workspaceResetKey, setWorkspaceResetKey] = useState(0)
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false)
  const [droppedFiles, setDroppedFiles] = useState<File[]>([])
  const [droppedFilesKey, setDroppedFilesKey] = useState(0)
  const sharedImageRef = useRef<SharedEditorImage | null>(null)
  const sharedImageCounterRef = useRef(0)

  useEffect(() => {
    sharedImageRef.current = sharedImage
  }, [sharedImage])

  useEffect(() => {
    return () => {
      if (sharedImageRef.current)
        URL.revokeObjectURL(sharedImageRef.current.url)
    }
  }, [])

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
    onDrop: useCallback((e: React.DragEvent) => {
      e.preventDefault()
      setIsCanvasDragOver(false)
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      )
      if (files.length === 0) return
      setDroppedFilesKey((key) => key + 1)
      setDroppedFiles(files)
    }, []),
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
                  "flex lg:flex-col items-center justify-center gap-1 rounded-md px-3 py-2 lg:size-14 lg:px-0 text-xs font-medium transition-colors",
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
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default ImageEditor
