import type { EditorToolProps } from "../shared/types"

export type CropRect = {
  x: number
  y: number
  width: number
  height: number
}

export type DragState = {
  type: "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"
  startX: number
  startY: number
  startCrop: CropRect
}

export type Status =
  | { phase: "idle" }
  | {
      phase: "editing"
      imageUrl: string
      imageWidth: number
      imageHeight: number
    }
  | { phase: "cropped"; originalUrl: string; croppedUrl: string }

export type AnchorMode = "center" | "edge"

export type AspectRatioPreset = "free" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16"

export type AspectRatioOption = {
  label: string
  preset: AspectRatioPreset
  ratio: number | null
}

export type ImageCropperProps = EditorToolProps
