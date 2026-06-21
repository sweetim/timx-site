import type { Metadata } from "next"
import {
  BreadcrumbListJsonLd,
  WebApplicationJsonLd,
} from "@/app/_components/json-ld"
import { ToolSeoContent } from "@/app/developer/_components/seo-content"
import Gitropolis from "./_components/gitropolis"
import { LandingSection } from "./_components/landing-section"

export const metadata: Metadata = {
  title: "Gitropolis — GitHub Contribution Heatmap",
  description:
    "Sign in with GitHub to visualize your full contribution history as interactive yearly heatmaps, then turn it into an isometric city.",
  alternates: { canonical: "https://timx.co/gitropolis" },
  openGraph: {
    title: "Gitropolis — GitHub Contribution Heatmap",
    description:
      "Sign in with GitHub to visualize your full contribution history as interactive yearly heatmaps.",
    url: "https://timx.co/gitropolis",
  },
}

export default function GitropolisPage() {
  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Gitropolis", url: "https://timx.co/gitropolis" },
        ]}
      />
      <WebApplicationJsonLd
        name="Gitropolis"
        description="Sign in with GitHub to visualize your full contribution history as interactive yearly heatmaps."
        url="https://timx.co/gitropolis"
        applicationCategory="DeveloperApplication"
        featureList={[
          "Sign in securely with GitHub OAuth",
          "Render a heatmap for every year of your contribution history",
          "Read-only access to profile and contribution history",
        ]}
      />
      <Gitropolis landingContent={<LandingSection />} />
      <ToolSeoContent
        id="gitropolis-seo"
        heading="GitHub Contribution Heatmap Tool"
        description="Use Gitropolis to sign in with GitHub and visualize your full contribution history as an interactive heatmap for every year. The tool uses secure GitHub OAuth so your access token never leaves a server-side cookie, and renders a day-by-day contribution calendar that mirrors your GitHub profile."
        features={[
          "Sign in with GitHub OAuth to read your profile and contribution history.",
          "Render a heatmap for every year of your GitHub contribution history.",
          "Keep your access token in a server-side httpOnly cookie, never exposed to the browser.",
        ]}
      />
    </>
  )
}
