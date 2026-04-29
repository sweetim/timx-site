import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
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
      <OgPreview
        descriptionSection={
          <section className="bg-dev-canvas border-t border-dev-border">
            <div className="max-w-3xl mx-auto px-6 py-12">
              <h2 className="text-2xl font-semibold text-dev-text mb-4">
                Open Graph Preview Tool
              </h2>
              <p className="text-dev-text-secondary mb-6 leading-relaxed">
                Debug how your pages appear when shared on social media. Enter
                any URL to inspect its Open Graph and Twitter Card meta tags and
                preview the share card across Facebook, WhatsApp, Discord, and
                LinkedIn.
              </p>

              <h3 className="text-lg font-semibold text-dev-text mb-3">
                Features
              </h3>
              <ul className="list-disc list-inside text-dev-text-secondary mb-6 space-y-1.5">
                <li>
                  Preview how links appear on Facebook, WhatsApp, Discord, and
                  LinkedIn
                </li>
                <li>
                  Inspect all Open Graph meta tags (title, description, image,
                  type, site name)
                </li>
                <li>
                  Inspect Twitter Card meta tags (card type, title, description,
                  image)
                </li>
                <li>View raw meta tag values in a table for quick debugging</li>
              </ul>

              <h3 className="text-lg font-semibold text-dev-text mb-3">
                How to Use
              </h3>
              <ol className="list-decimal list-inside text-dev-text-secondary space-y-1.5">
                <li>Enter the full URL of the page you want to inspect</li>
                <li>Click the search button or press Enter</li>
                <li>
                  Scroll through the preview cards to see how the link renders
                  on each platform
                </li>
                <li>
                  Check the raw tags table for missing or incorrect meta values
                </li>
              </ol>
            </div>
          </section>
        }
      />
    </>
  )
}
