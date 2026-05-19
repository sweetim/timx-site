import { Eye, Lightbulb, Shield } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Browser-only",
    description: "No data sent to any server. Your specs stay on your machine.",
  },
  {
    icon: Eye,
    title: "Color-coded schemas",
    description:
      "Optional, anyOf, oneOf, and allOf branches rendered with distinct colors.",
  },
  {
    icon: Lightbulb,
    title: "Instant suggestions",
    description:
      "Catches missing descriptions, summaries, examples, and error responses.",
  },
]

export function LandingSection() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-semibold text-dev-text mb-2">
        OpenAPI Viewer
      </h1>
      <p className="text-dev-text-secondary text-sm mb-8">
        Visualize, explore, and improve your OpenAPI 3.x specifications.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
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
