import type {
  BackgroundRemovalResult,
  CanvasDropProps,
  SharedEditorImage,
  SourceImage,
} from "../image-editor"

export type EditorToolProps = {
  variant?: "page" | "panel"
  isActive?: boolean
  initialImage?: SharedEditorImage | null
  activeSourceId?: string | null
  onActiveSourceChange?: (id: string | null) => void
  workspaceResetKey?: number
  onResult?: (blob: Blob) => void
  onSourceImage?: (blob: Blob, name: string) => void
  onClearWorkspace?: () => void
  onCopyToClipboard?: () => void
  hasClipboard?: boolean
  droppedFiles?: File[]
  droppedFilesKey?: number
  canvasDropProps?: CanvasDropProps
  sourceImages?: SourceImage[]
  onRemoveSourceImage?: (id: string) => void
  onAddSourceImages?: (files: File[]) => Promise<SourceImage[]>
  backgroundRemovalResults?: Record<string, BackgroundRemovalResult>
  onBackgroundRemovalResult?: (sourceId: string, blob: Blob) => void
}
