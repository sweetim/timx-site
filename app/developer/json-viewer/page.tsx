import type { Metadata } from "next"
import { BreadcrumbListJsonLd, WebApplicationJsonLd } from "@/app/_components/json-ld"
import { ToolSeoContent } from "../_components/seo-content"
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
    images: ["/json-viewer-og.jpg"],
  },
}

export default function JsonViewerPage() {
  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
          { name: "JSON Viewer", url: "https://timx.co/developer/json-viewer" },
        ]}
      />
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
      <ToolSeoContent
        id="json-viewer-seo"
        heading="Free Online JSON Viewer"
        description="Use the JSON Viewer to validate JSON syntax, format or minify JSON, inspect nested objects and arrays in a collapsible tree, reveal whitespace, and unescape JSON strings. Processing runs in your browser so pasted data stays on your device."
        features={[
          "Validate pasted JSON and find syntax errors quickly.",
          "Format, minify, and inspect nested JSON with a collapsible tree view.",
          "Reveal tabs, spaces, new lines, and escaped JSON strings when debugging API responses or logs.",
        ]}
      />
    </>
  )
}
