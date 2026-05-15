import { Code, Eye, Layers, MessageSquare } from "lucide-react"
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
          <section className="bg-dev-canvas">
            <div className="max-w-3xl mx-auto">
              <p className="text-dev-text-secondary mb-6 leading-relaxed">
                Debug how your pages appear when shared on social media. Enter
                any URL to inspect its Open Graph and Twitter Card meta tags and
                preview the share card across Facebook, WhatsApp, Discord, and
                LinkedIn.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    icon: Layers,
                    title: "Cross-Platform Preview",
                    description:
                      "See exactly how your content renders on Facebook, LinkedIn, Discord, and WhatsApp.",
                  },
                  {
                    icon: Eye,
                    title: "Tag Inspector",
                    description:
                      "Instantly validate og:title, og:description, and og:image properties.",
                  },
                  {
                    icon: MessageSquare,
                    title: "Twitter/X Cards",
                    description:
                      "Debug Twitter Card types (Summary vs. Large Image) and metadata.",
                  },
                  {
                    icon: Code,
                    title: "Raw Tag Table",
                    description:
                      "Audit the raw HTML source and catch missing or broken meta tags quickly.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="p-5 rounded-md border border-dev-border bg-dev-inset"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <feature.icon
                        size={16}
                        className="text-dev-text-secondary"
                      />
                      <h3 className="text-base font-medium text-dev-text">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm text-dev-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        }
      />
    </>
  )
}
