import type { Metadata } from "next"
import Link from "next/link"
import { tools } from "./_lib/tools"

export const metadata: Metadata = {
  title: "Developer Tools",
  description: "Useful applications for developers",
}

export default function DeveloperPage() {
  return (
    <div className="flex-1 overflow-auto bg-neutral-950 flex items-center">
      <div className="max-w-3xl mx-auto px-6 py-12 w-full">
        <h1 className="text-2xl font-semibold text-neutral-100 mb-2">
          Developer Tools
        </h1>
        <p className="text-neutral-500 mb-8">
          A collection of handy utilities for everyday development tasks.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/developer/${tool.slug}`}
              className="group block p-5 rounded-lg border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900 transition-colors"
            >
              <h2 className="text-base font-medium text-neutral-200 group-hover:text-neutral-100 mb-1">
                {tool.name}
              </h2>
              <p className="text-sm text-neutral-500">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
