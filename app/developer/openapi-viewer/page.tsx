import type { Metadata } from "next"
import { BreadcrumbListJsonLd, WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import { ToolSeoContent } from "../_components/seo-content"
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
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
          { name: "OpenAPI Viewer", url: "https://timx.co/developer/openapi-viewer" },
        ]}
      />
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
      <ToolSeoContent
        id="openapi-viewer-seo"
        heading="OpenAPI Viewer"
        description="Use the OpenAPI Viewer to visualize OpenAPI 3.x JSON or YAML specifications in the browser. Browse endpoints, parameters, request bodies, response schemas, and improvement suggestions without sending API specs to a server."
        features={[
          "Upload OpenAPI 3.x JSON or YAML specifications.",
          "Browse endpoints grouped by tag with method, path, summary, and schema details.",
          "Find missing descriptions, examples, operation IDs, servers, and error responses.",
        ]}
      />
    </>
  )
}
