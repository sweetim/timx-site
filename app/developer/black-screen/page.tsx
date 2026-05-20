import { Info } from "lucide-react"
import type { Metadata } from "next"
import { BreadcrumbListJsonLd, WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import { ToolSeoContent } from "../_components/seo-content"
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
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
          { name: "Black Screen", url: "https://timx.co/developer/black-screen" },
        ]}
      />
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
      <ToolSeoContent
        id="black-screen-seo"
        heading="Black Screen Tool for Pixel and Dust Checking"
        description="Use the Black Screen tool to display a pure black fullscreen panel for checking monitor dust, smudges, stuck pixels, and display defects. It is designed for quick screen cleaning and display inspection without installing software."
        features={[
          "Show a pure black fullscreen display in one click.",
          "Spot stuck pixels, dust, fingerprints, and smudges on a monitor.",
          "Exit fullscreen with Escape or a click when the inspection is finished.",
        ]}
      />
    </>
  )
}
