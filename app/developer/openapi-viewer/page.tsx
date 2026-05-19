import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import { LandingSection } from "./_components/landing-section"
import OpenApiViewer from "./_components/openapi-viewer"

export const metadata: Metadata = {
  title: "OpenAPI Viewer — Free Online Tool",
  description:
    "Visualize OpenAPI 3.x specifications with endpoint explorer, parameter details, request/response schemas, and improvement suggestions. Supports JSON and YAML. Runs entirely in your browser.",
  alternates: { canonical: "https://timx.co/developer/openapi-viewer" },
  openGraph: {
    title: "OpenAPI Viewer — Free Online Tool",
    description:
      "Visualize OpenAPI specs with endpoint explorer, parameter details, request/response schemas, and improvement suggestions. Supports JSON and YAML.",
    url: "https://timx.co/developer/openapi-viewer",
    images: [opengraph.src],
  },
}

export default function OpenApiViewerPage() {
  return (
    <>
      <WebApplicationJsonLd
        name="OpenAPI Viewer"
        description="Visualize OpenAPI specifications with endpoint explorer and improvement suggestions"
        url="https://timx.co/developer/openapi-viewer"
        applicationCategory="DeveloperApplication"
        featureList={[
          "Upload OpenAPI 3.x JSON and YAML files",
          "Browse endpoints grouped by tags",
          "View URL, parameters, request and response schemas",
          "Get improvement suggestions for your API spec",
        ]}
      />
      <OpenApiViewer landingContent={<LandingSection />} />
    </>
  )
}
