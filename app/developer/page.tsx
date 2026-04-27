import type { Metadata } from "next"
import Link from "next/link"
import opengraph from "@/app/opengraph.jpg"
import { tools } from "./_lib/tools"

export const metadata: Metadata = {
  title: "Free Developer Tools",
  description:
    "A collection of free browser-based developer tools. JSON viewer, image editor, LLM pricing comparison, and OG preview — no uploads, no sign-up.",
  alternates: { canonical: "https://timx.co/developer" },
  openGraph: {
    title: "Free Developer Tools",
    description:
      "A collection of free browser-based developer tools. JSON viewer, image editor, LLM pricing comparison, and OG preview.",
    url: "https://timx.co/developer",
    images: [opengraph.src],
  },
}

export default function DeveloperPage() {
  return (
    <div className="min-h-full bg-dev-canvas flex items-center">
      <div className="max-w-3xl mx-auto px-6 py-12 w-full">
        <h1 className="text-2xl font-semibold text-dev-text mb-2">
          Developer Tools
        </h1>
        <p className="text-dev-text-secondary mb-8">
          A collection of handy utilities for everyday development tasks.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/developer/${tool.slug}`}
              className="group block p-5 rounded-md border border-dev-border bg-dev-inset hover:border-dev-border-muted hover:bg-dev-surface transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <tool.icon
                  size={16}
                  className="text-dev-text-secondary"
                />
                <h2 className="text-base font-medium text-dev-text group-hover:text-dev-link">
                  {tool.name}
                </h2>
              </div>
              <p className="text-sm text-dev-text-secondary">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
