export type Tool = {
  name: string
  slug: string
  description: string
}

export const tools: Tool[] = [
  {
    name: "JSON Viewer",
    slug: "json-viewer",
    description:
      "View, format, and validate JSON data with a collapsible tree view",
  },
  {
    name: "Background Remover",
    slug: "background-remover",
    description:
      "Remove the background from any image using AI — entirely in your browser",
  },
  {
    name: "Image Cropper",
    slug: "image-cropper",
    description:
      "Crop images from the center by dragging to select your desired area",
  },
  {
    name: "LLM Pricing",
    slug: "llm-usage",
    description:
      "Compare pricing across LLM providers via OpenRouter",
  },
]
