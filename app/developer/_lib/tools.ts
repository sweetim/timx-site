import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Braces,
  Database,
  Globe,
  Images,
  Monitor,
  Scale,
} from "lucide-react"

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
    name: "Image Editor",
    slug: "image-editor",
    description:
      "Remove backgrounds, crop, scale, convert formats, and stitch mobile screenshots locally",
    icon: Images,
  },
  {
    name: "LLM Pricing",
    slug: "llm-usage",
    description: "Compare pricing across LLM providers via OpenRouter",
    icon: Scale,
  },
  {
    name: "OG Preview",
    slug: "og-preview",
    description: "Debug Open Graph and Twitter meta tags for any URL",
    icon: Globe,
  },
  {
    name: "DB Explorer",
    slug: "db-explorer",
    description: "Browse SQLite files, view tables, and run SQL queries",
    icon: Database,
  },
  {
    name: "Black Screen",
    slug: "black-screen",
    description:
      "Fullscreen black display for spotting dead pixels and cleaning your monitor — press Escape or click to exit",
    icon: Monitor,
  },
  {
    name: "OpenAPI Viewer",
    slug: "openapi-viewer",
    description: "Browse OpenAPI specs, endpoints, parameters, and schemas",
    icon: BookOpen,
  },
]
