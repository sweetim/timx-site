import { Info } from "lucide-react"
import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import BlackScreenButton from "./_components/black-screen-button"
import { LandingSection } from "./_components/landing-section"

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
      <div className="flex flex-col items-center justify-center min-h-full bg-dev-canvas p-8">
        <div className="w-full max-w-2xl">
          <LandingSection />
          <div className="flex flex-col items-center">
            <BlackScreenButton />
            <p className="mt-4 flex items-center gap-1.5 text-xs text-dev-text-secondary">
              <Info className="size-3" />
              Press Escape or click to exit when in fullscreen
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
