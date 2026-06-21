import { Building2, CalendarDays, Lock } from "lucide-react"

const features = [
  {
    icon: Lock,
    title: "Secure GitHub sign-in",
    description:
      "Sign in with GitHub OAuth. Your access token stays in a server-side httpOnly cookie and is never exposed to the browser.",
  },
  {
    icon: CalendarDays,
    title: "Contribution heatmaps",
    description:
      "Visualize every year of your GitHub activity as a familiar contribution calendar, day by day.",
  },
  {
    icon: Building2,
    title: "City from your code",
    description:
      "Your contribution heatmap becomes the blueprint for an isometric city. (Coming soon.)",
  },
]

export function LandingSection() {
  return (
    <div className="mb-8 text-center">
      <h1 className="mb-2 text-3xl font-semibold text-dev-text">Gitropolis</h1>
      <p className="mb-8 text-sm text-dev-text-secondary">
        Sign in with GitHub to turn your contribution history into a living
        heatmap.
      </p>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-dev-border bg-dev-surface p-4"
          >
            <feature.icon className="mx-auto mb-2 size-5 text-dev-link" />
            <h2 className="mb-1 text-sm font-semibold text-dev-text">
              {feature.title}
            </h2>
            <p className="text-xs leading-relaxed text-dev-text-secondary">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
