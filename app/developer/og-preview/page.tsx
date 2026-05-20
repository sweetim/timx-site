import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
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
    </>
  )
}
