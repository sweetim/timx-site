import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import JsonViewer from "./_components/json-viewer"

export const metadata: Metadata = {
  title: "JSON Viewer — Free Online Tool",
  description:
    "View, format, validate, and explore JSON data with a collapsible tree view. Runs entirely in your browser — no data leaves your machine.",
  alternates: { canonical: "https://timx.co/developer/json-viewer" },
  openGraph: {
    title: "JSON Viewer — Free Online Tool",
    description:
      "View, format, validate, and explore JSON data with a collapsible tree view. Runs entirely in your browser.",
    url: "https://timx.co/developer/json-viewer",
    images: [opengraph.src],
  },
}

export default function JsonViewerPage() {
  return (
    <>
      <WebApplicationJsonLd
        name="JSON Viewer"
        description="View, format, validate, and explore JSON data with a collapsible tree view"
        url="https://timx.co/developer/json-viewer"
        applicationCategory="DeveloperApplication"
        featureList={[
          "Validate JSON syntax",
          "Format and minify JSON",
          "Explore JSON in a collapsible tree",
          "Reveal whitespace characters",
          "Unescape nested JSON strings",
        ]}
      />
      <JsonViewer />
    </>
  )
}
