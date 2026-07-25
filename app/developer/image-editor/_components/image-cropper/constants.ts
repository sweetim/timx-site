import type { LucideIcon } from "lucide-react"
import { Circle, Square } from "lucide-react"
import type { AspectRatioOption, AspectRatioPreset, CropShape } from "./types"

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: "Free", preset: "free", ratio: null },
  { label: "1:1", preset: "1:1", ratio: 1 },
  { label: "4:3", preset: "4:3", ratio: 4 / 3 },
  { label: "3:4", preset: "3:4", ratio: 3 / 4 },
  { label: "16:9", preset: "16:9", ratio: 16 / 9 },
  { label: "9:16", preset: "9:16", ratio: 9 / 16 },
  { label: "21:9", preset: "21:9", ratio: 21 / 9 },
  { label: "2:1", preset: "2:1", ratio: 2 },
  { label: "Custom", preset: "custom", ratio: null },
]

export const DEFAULT_ASPECT_RATIO: AspectRatioPreset = "1:1"

export const DEFAULT_CROP_SHAPE: CropShape = "rectangle"

export const CROP_SHAPES: {
  label: string
  shape: CropShape
  icon: LucideIcon
}[] = [
  { label: "Rectangle", shape: "rectangle", icon: Square },
  { label: "Circle", shape: "circle", icon: Circle },
]

export const HANDLE_SIZE = 10
export const MAX_DISPLAY_WIDTH = 1024
export const MAX_DISPLAY_HEIGHT = 500
export const MIN_CROP = 20
