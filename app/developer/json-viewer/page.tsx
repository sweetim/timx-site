import type { Metadata } from "next"
import JsonViewer from "./_components/json-viewer"

export const metadata: Metadata = {
  title: "JSON Viewer",
  description:
    "View, format, and validate JSON data with a collapsible tree view",
}

export default function JsonViewerPage() {
  return <JsonViewer />
}
