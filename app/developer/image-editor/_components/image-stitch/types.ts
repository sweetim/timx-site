import type { CanvasDropProps, SharedEditorImage } from "../image-editor"

export type ImageItem = {
  id: string
  file: File
  originalUrl: string
  element: HTMLImageElement
  naturalWidth: number
  naturalHeight: number
}

export type StackDirection = "horizontal" | "vertical"

export type ContentAlignment = "start" | "center" | "end"

export type StitchedImage = {
  url: string
  fileName: string
  width: number
  height: number
  blob: Blob
}

export type ScreenshotStitcherProps = {
  variant?: "page" | "panel"
  isActive?: boolean
  initialImage?: SharedEditorImage | null
  workspaceResetKey?: number
  onResult?: (blob: Blob) => void
  onSourceImage?: (blob: Blob, name: string) => void
  onClearWorkspace?: () => void
  onCopyToClipboard?: () => void
  hasClipboard?: boolean
  droppedFiles?: File[]
  droppedFilesKey?: number
  canvasDropProps?: CanvasDropProps
}
