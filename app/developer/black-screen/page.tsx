import { Info } from "lucide-react"
import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import BlackScreenButton from "./_components/black-screen-button"

export const metadata: Metadata = {
  title: "Black Screen — Pixel & Dust Checker",
  description:
    "Display a pure black fullscreen to spot stuck pixels, dust, and smudges on your monitor. Useful for cleaning your screen or checking for display defects.",
  alternates: { canonical: "https://timx.co/developer/black-screen" },
  openGraph: {
    title: "Black Screen — Pixel & Dust Checker",
    description:
      "Display a pure black fullscreen to spot stuck pixels, dust, and smudges on your monitor.",
    url: "https://timx.co/developer/black-screen",
    images: [opengraph.src],
  },
}

export default function BlackScreenPage() {
  return (
    <>
      <WebApplicationJsonLd
        name="Black Screen"
        description="Display a pure black fullscreen to spot stuck pixels, dust, and smudges on your monitor"
        url="https://timx.co/developer/black-screen"
        applicationCategory="UtilitiesApplication"
        featureList={[
          "Full black fullscreen display",
          "Stuck pixel detection",
          "Dust and smudge spotting",
          "One-click enter and exit",
        ]}
      />
      <div className="flex flex-col items-center justify-center min-h-full bg-dev-canvas px-6">
        <div className="max-w-md text-center mb-8">
          <h1 className="text-xl font-semibold text-dev-text mb-3">
            Black Screen
          </h1>
          <p className="text-sm text-dev-text-secondary leading-relaxed">
            Display a pure black fullscreen to help spot stuck pixels, dust, and
            smudges on your monitor. Useful for cleaning your screen or checking
            for display defects.
          </p>
        </div>
        <BlackScreenButton />
        <p className="mt-4 flex items-center gap-1.5 text-xs text-dev-text-secondary">
          <Info className="size-3" />
          Press Escape or click to exit when in fullscreen
        </p>
      </div>
    </>
  )
}
