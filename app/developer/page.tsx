import type { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbListJsonLd, ItemListJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import { ToolSeoContent } from "./_components/seo-content"
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
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
        ]}
      />
      <ItemListJsonLd
        name="Free Developer Tools"
        description="A collection of free browser-based developer tools. JSON viewer, image editor, LLM pricing comparison, and OG preview."
        items={tools.map((tool) => ({
          name: tool.name,
          url: `https://timx.co/developer/${tool.slug}`,
          description: tool.description,
        }))}
      />
      <div className="min-h-full bg-dev-canvas flex items-center">
        <div className="max-w-3xl mx-auto px-6 py-12 w-full">
          <h1 className="text-2xl font-semibold text-dev-text mb-2">
            Developer Tools
          </h1>
          <p className="text-dev-text-secondary mb-2">
            A collection of handy utilities for everyday development tasks.
          </p>
          <p className="text-sm text-dev-text-secondary mb-8">
            All tools are open source —{" "}
            <Link
              href="https://github.com/sweetim/timx-site/tree/main/app/developer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dev-link hover:underline"
            >
              browse the code on GitHub
            </Link>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/developer/${tool.slug}`}
                className="group block p-5 rounded-lg border border-dev-border bg-dev-surface hover:opacity-90 hover:scale-[1.03] transition-opacity"
              >
                <div className="flex items-center gap-2 mb-1">
                  <tool.icon
                    size={16}
                    className="text-dev-link"
                  />
                  <h2 className="text-base font-medium text-dev-text group-hover:text-dev-link">
                    {tool.name}
                  </h2>
                </div>
                <p className="text-sm text-dev-text-secondary line-clamp-2">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <footer className="fixed bottom-0 left-0 w-full border-t border-dev-border bg-dev-canvas">
          <div className="px-6 py-3 text-sm text-dev-text-secondary flex justify-between">
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="hover:text-dev-link"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-dev-link"
              >
                Terms of Service
              </Link>
            </div>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
      <ToolSeoContent
        id="developer-tools-seo"
        heading="Free Browser-Based Developer Tools"
        description="Use timx developer tools for everyday web, API, image, database, and AI development tasks directly in the browser. The tools are free, open source, and designed for quick workflows without accounts or unnecessary uploads."
        features={[
          "Format and inspect JSON, Open Graph metadata, and OpenAPI specifications.",
          "Edit images, remove backgrounds, crop assets, and stitch screenshots in the browser.",
          "Compare LLM pricing and browse SQLite database files with local-first developer utilities.",
        ]}
      />
    </>
  )
}
