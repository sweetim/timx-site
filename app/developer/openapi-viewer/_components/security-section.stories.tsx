import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { SecuritySchemesList, SecuritySection } from "./security-section"
import type { OpenApiSecurityRequirement, OpenApiSecurityScheme } from "./types"

type SecurityPreviewProps = {
  security?: OpenApiSecurityRequirement[]
  securitySchemes: Record<string, OpenApiSecurityScheme>
  specSecurity?: OpenApiSecurityRequirement[]
}

const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Send the access token in the Authorization header.",
  },
  apiKeyAuth: {
    type: "apiKey",
    name: "X-API-Key",
    in: "header",
    description: "Project API key for server-to-server requests.",
  },
  oauth: {
    type: "oauth2",
    description: "OAuth scopes required for user delegated access.",
  },
} satisfies Record<string, OpenApiSecurityScheme>

function SecurityPreview({
  security,
  securitySchemes,
  specSecurity,
}: SecurityPreviewProps) {
  return (
    <div className="w-150 rounded-lg border border-dev-border bg-dev-canvas p-4 text-dev-text">
      <h3 className="mb-2 text-sm font-medium text-dev-text">
        Defined Security Schemes
      </h3>
      <SecuritySchemesList schemes={securitySchemes} />
      <SecuritySection
        security={security}
        securitySchemes={securitySchemes}
        specSecurity={specSecurity}
      />
    </div>
  )
}

const meta = {
  title: "Developer/OpenAPI Viewer/SecuritySection",
  component: SecurityPreview,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof SecurityPreview>

export default meta
type Story = StoryObj<typeof meta>

export const EndpointAuthorization: Story = {
  args: {
    security: [{ bearerAuth: [] }, { oauth: ["read:pets", "write:pets"] }],
    securitySchemes,
  },
}

export const TopLevelAuthorization: Story = {
  args: {
    securitySchemes,
    specSecurity: [{ apiKeyAuth: [] }],
  },
}
