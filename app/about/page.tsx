import type { Metadata } from "next"
import Link from "next/link"
import opengraph from "@/app/opengraph.jpg"

export const metadata: Metadata = {
  title: "About",
  description:
    "About Tim — a software developer based in Tokyo building free browser-based developer tools.",
  alternates: { canonical: "https://timx.co/about" },
  openGraph: {
    title: "About Tim",
    description:
      "About Tim — a software developer based in Tokyo building free browser-based developer tools.",
    url: "https://timx.co/about",
    images: [opengraph.src],
  },
}

export default function AboutPage() {
  return (
    <div className="flex justify-center items-center min-h-full bg-neutral-200 p-6">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900">About</h1>

        <p className="text-slate-700 leading-relaxed">
          Hi, I&apos;m Tim — a software developer based in Tokyo, Japan. I build
          free, browser-based developer tools that run entirely in your browser.
          No sign-ups, no server uploads, no data collection.
        </p>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Why build these?
          </h2>
          <p className="text-slate-700 leading-relaxed">
            I built these tools because I use them myself. They were scattered
            across different sites, so I brought them together here — free,
            fast, and all in one place.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">The tools</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>
              <strong>JSON Viewer</strong> — View, format, and validate JSON
              with a collapsible tree view.
            </li>
            <li>
              <strong>Background Remover</strong> — Remove image backgrounds
              using AI, running entirely in your browser via a Web Worker.
            </li>
            <li>
              <strong>Image Cropper</strong> — Crop images with configurable
              aspect ratios and anchor modes.
            </li>
            <li>
              <strong>LLM Pricing</strong> — Compare pricing across LLM
              providers with data sourced from OpenRouter.
            </li>
          </ul>
        </div>

        <div className="pt-4">
          <Link
            href="/developer"
            className="text-blue-700 hover:text-blue-900 underline"
          >
            Try the tools
          </Link>
          {" · "}
          <Link
            href="/privacy"
            className="text-blue-700 hover:text-blue-900 underline"
          >
            Privacy policy
          </Link>
        </div>
      </div>
    </div>
  )
}
