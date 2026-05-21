import type { Metadata } from "next"
import { BreadcrumbListJsonLd, WebApplicationJsonLd } from "@/app/_components/json-ld"
import { ToolSeoContent } from "../_components/seo-content"
import { LandingSection } from "./_components/landing-section"
import OpenApiViewer from "./_components/openapi-viewer"

export const metadata: Metadata = {
  title: "OpenAPI Viewer — Free Online Tool",
  description:
    "Visualize OpenAPI 3.x specifications with endpoint explorer, parameter details, request/response schemas with examples, security scheme visualization (Bearer, API Key, OAuth 2.0, OpenID Connect), and a lint engine that flags missing summaries, descriptions, operationIds, responses, and security schemes. Supports JSON and YAML. Runs entirely in your browser.",
  alternates: { canonical: "https://timx.co/developer/openapi-viewer" },
  openGraph: {
    title: "OpenAPI Viewer — Free Online Tool",
    description:
      "Visualize OpenAPI specs with endpoint explorer, request/response schemas with examples, security scheme visualization, and a lint engine for missing summaries, descriptions, operationIds, responses, and security schemes.",
    url: "https://timx.co/developer/openapi-viewer",
    images: ["/openapi-viewer-og.jpg"],
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
        description="Visualize OpenAPI specifications with endpoint explorer, schema examples, security scheme visualization, and lint suggestions"
        url="https://timx.co/developer/openapi-viewer"
        applicationCategory="DeveloperApplication"
        featureList={[
          "Upload OpenAPI 3.x JSON and YAML files",
          "Browse endpoints grouped by tags",
          "View request and response schemas with examples",
          "Visualize security schemes (Bearer, API Key, OAuth 2.0, OpenID Connect)",
          "Lint missing summaries, descriptions, operationIds, responses, and security schemes",
        ]}
      />
      <OpenApiViewer landingContent={<LandingSection />} />
      <ToolSeoContent
        id="openapi-viewer-seo"
        heading="OpenAPI Viewer"
        description="Use the OpenAPI Viewer to visualize OpenAPI 3.x JSON or YAML specifications in the browser. Browse endpoints, parameters, request and response schemas with examples, security schemes (Bearer, API Key, OAuth 2.0, OpenID Connect), and lint suggestions — all client-side."
        features={[
          "Upload OpenAPI 3.x JSON or YAML specifications.",
          "Browse endpoints grouped by tag with method, path, summary, and schema details.",
          "View request and response schemas with inline examples.",
          "Visualize security schemes: Bearer, API Key, OAuth 2.0, and OpenID Connect.",
          "Lint for missing summaries, descriptions, operationIds, responses, and security schemes.",
        ]}
      />
    </>
  )
}
