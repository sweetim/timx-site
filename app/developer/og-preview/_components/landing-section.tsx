import { Code, Eye, Layers, MessageSquare } from "lucide-react"

const features = [
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
]

export function LandingSection() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-semibold text-dev-text mb-2">
        Open Graph Preview
      </h1>
      <p className="text-dev-text-secondary text-sm mb-8">
        Inspect Open Graph and Twitter Card meta tags for any URL. Debug how
        your pages appear when shared on social media.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-dev-border bg-dev-surface p-4"
          >
            <feature.icon className="size-5 text-dev-link mx-auto mb-2" />
            <h2 className="text-sm font-semibold text-dev-text mb-1">
              {feature.title}
            </h2>
            <p className="text-xs text-dev-text-secondary leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
