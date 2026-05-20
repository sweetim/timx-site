import { Monitor, Paintbrush, Search } from "lucide-react"

const features = [
  {
    icon: Monitor,
    title: "Stuck pixel detection",
    description:
      "Display a pure black screen to quickly spot any stuck or dead pixels on your monitor.",
  },
  {
    icon: Paintbrush,
    title: "Dust & smudge spotting",
    description:
      "Reveal dust particles and smudges that are invisible during normal use.",
  },
  {
    icon: Search,
    title: "One-click fullscreen",
    description:
      "Enter and exit fullscreen with a single click or by pressing Escape.",
  },
]

export function LandingSection() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-semibold text-dev-text mb-2">
        Black Screen
      </h1>
      <p className="text-dev-text-secondary text-sm mb-8">
        Display a pure black fullscreen to spot stuck pixels, dust, and smudges
        on your monitor.
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
