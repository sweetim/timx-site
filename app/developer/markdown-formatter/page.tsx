import type { Metadata } from "next"
import { BreadcrumbListJsonLd, WebApplicationJsonLd } from "@/app/_components/json-ld"
import { ToolSeoContent } from "../_components/seo-content"
import MarkdownFormatter from "./_components/markdown-formatter"

export const metadata: Metadata = {
  title: "Markdown Formatter — Free Online Tool",
  description:
    "Format and clean up markdown in your browser. Align GFM tables with nice padding, normalize list markers, fix blank lines, and preview the rendered output. No data leaves your machine.",
  alternates: { canonical: "https://timx.co/developer/markdown-formatter" },
  openGraph: {
    title: "Markdown Formatter — Free Online Tool",
    description:
      "Format and clean up markdown in your browser. Align GFM tables with nice padding, normalize list markers, and preview the rendered output.",
    url: "https://timx.co/developer/markdown-formatter",
    images: ["/markdown-formatter-og.jpg"],
  },
}

export default function MarkdownFormatterPage() {
  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
          {
            name: "Markdown Formatter",
            url: "https://timx.co/developer/markdown-formatter",
          },
        ]}
      />
      <WebApplicationJsonLd
        name="Markdown Formatter"
        description="Format markdown, align GFM tables with nice padding, normalize list markers, and preview the rendered output."
        url="https://timx.co/developer/markdown-formatter"
        applicationCategory="DeveloperApplication"
        featureList={[
          "Align GFM tables with padded, aligned columns",
          "Normalize list markers, blank lines, and heading spacing",
          "Live rendered preview with GitHub Flavored Markdown",
          "Copy formatted markdown or rendered HTML and download as .md",
        ]}
      />
      <MarkdownFormatter />
      <ToolSeoContent
        id="markdown-formatter-seo"
        heading="Free Online Markdown Formatter"
        description="Use the Markdown Formatter to clean up messy markdown. Paste a document and the tool aligns GitHub Flavored Markdown tables with padded columns, normalizes list markers and blank lines, and renders a live preview. Copy the formatted markdown or the rendered HTML. All processing runs in your browser, so pasted content stays on your device."
        features={[
          "Align GFM tables into a padded, readable grid that honours left, center, and right alignment.",
          "Normalize list markers, collapse extra blank lines, and tidy heading spacing automatically.",
          "Preview the rendered markdown live and copy either the formatted source or the rendered HTML.",
        ]}
      />
    </>
  )
}
