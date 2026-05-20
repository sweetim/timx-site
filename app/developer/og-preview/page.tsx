import type { Metadata } from "next"
import { BreadcrumbListJsonLd, WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import { ToolSeoContent } from "../_components/seo-content"
import { LandingSection } from "./_components/landing-section"
import OgPreview from "./_components/og-preview"

export const metadata: Metadata = {
  title: "OG Preview — Free Online Tool",
  description:
    "Inspect Open Graph and Twitter Card meta tags for any URL. Debug how your pages appear when shared on social media.",
  alternates: { canonical: "https://timx.co/developer/og-preview" },
  openGraph: {
    title: "OG Preview — Free Online Tool",
    description: "Inspect Open Graph and Twitter Card meta tags for any URL.",
    url: "https://timx.co/developer/og-preview",
    images: [opengraph.src],
  },
}

export default function OgPreviewPage() {
  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
          { name: "OG Preview", url: "https://timx.co/developer/og-preview" },
        ]}
      />
      <WebApplicationJsonLd
        name="OG Preview"
        description="Inspect Open Graph and Twitter Card meta tags for any URL"
        url="https://timx.co/developer/og-preview"
        applicationCategory="DeveloperApplication"
        featureList={[
          "Inspect Open Graph tags",
          "Inspect Twitter Card tags",
          "Preview social share cards",
          "Review raw social metadata",
        ]}
      />
      <OgPreview landingContent={<LandingSection />} />
      <ToolSeoContent
        id="og-preview-seo"
        heading="Open Graph Preview Tool"
        description="Use the Open Graph Preview tool to inspect social sharing metadata for any HTTPS URL. Check Open Graph tags, Twitter Card tags, preview images, titles, descriptions, and platform-specific share cards before publishing a page."
        features={[
          "Inspect og:title, og:description, og:image, and Twitter Card metadata.",
          "Preview how links can appear on Facebook, WhatsApp, Discord, and LinkedIn.",
          "Review raw social metadata values and catch missing or broken tags.",
        ]}
      />
    </>
  )
}
