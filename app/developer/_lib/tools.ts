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
]
