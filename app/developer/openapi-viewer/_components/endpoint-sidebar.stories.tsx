import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { EndpointSidebar } from "./endpoint-sidebar"
import type { EndpointGroup, OpenApiOperation } from "./types"

const endpoints = [
  {
    method: "get",
    path: "/pets",
    summary: "List pets",
    tags: ["pets"],
  },
  {
    method: "post",
    path: "/pets",
    summary: "Create pet",
    tags: ["pets"],
    security: [{ apiKeyAuth: [] }],
  },
  {
    method: "get",
    path: "/status",
    summary: "Public status endpoint",
    tags: ["system"],
    security: [],
  },
] satisfies OpenApiOperation[]

const endpointGroups = [
  { tag: "pets", endpoints: endpoints.slice(0, 2) },
  { tag: "system", endpoints: endpoints.slice(2) },
] satisfies EndpointGroup[]

const meta = {
  title: "Developer/OpenAPI Viewer/EndpointSidebar",
  component: EndpointSidebar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    specTitle: "Petstore API",
    specVersion: "1.0.0",
    specServers: [{ url: "https://api.example.com" }],
    specSecurity: [{ bearerAuth: [] }],
    fileName: "petstore.yaml",
    endpoints: endpointGroups,
    selectedEndpoint: endpoints[0],
    expandedGroups: new Set(["pets", "system"]),
    onToggleGroup: () => {},
    onSelectEndpoint: () => {},
  },
  decorators: [
    (Story) => (
      <div className="h-120 overflow-hidden rounded-lg border border-dev-border bg-dev-canvas text-dev-text">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EndpointSidebar>

export default meta
type Story = StoryObj<typeof meta>

export const WithAuthorizationIndicators: Story = {}
