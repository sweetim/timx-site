import type { EditorToolProps } from "../shared/types"

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

export type ScreenshotStitcherProps = EditorToolProps
