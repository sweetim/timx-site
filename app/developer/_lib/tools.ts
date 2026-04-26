import type { LucideIcon } from "lucide-react"
import { Braces, Crop, Eraser, Scale } from "lucide-react"

export type Tool = {
  name: string
  slug: string
  description: string
  icon: LucideIcon
}

export const tools: Tool[] = [
  {
    name: "JSON Viewer",
    slug: "json-viewer",
    description:
      "View, format, and validate JSON data with a collapsible tree view",
    icon: Braces,
  },
  {
    name: "Background Remover",
    slug: "background-remover",
    description:
      "Remove the background from any image using AI — entirely in your browser",
    icon: Eraser,
  },
  {
    name: "Image Cropper",
    slug: "image-cropper",
    description:
      "Crop images from the center by dragging to select your desired area",
    icon: Crop,
  },
  {
    name: "LLM Pricing",
    slug: "llm-usage",
    description:
      "Compare pricing across LLM providers via OpenRouter",
    icon: Scale,
  },
]
