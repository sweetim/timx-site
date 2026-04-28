import type { ContentAlignment } from "./types"

export const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage: `repeating-conic-gradient(#373e47 0% 25%, #2d333b 0% 50%)`,
  backgroundSize: "8px 8px",
}

export const ALIGNMENT_OPTIONS: { value: ContentAlignment; label: string }[] = [
  { value: "start", label: "Top" },
  { value: "center", label: "Center" },
  { value: "end", label: "Bottom" },
]
