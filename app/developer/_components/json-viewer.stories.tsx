import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import JsonViewer from "./json-viewer"

const meta = {
  title: "Developer/JsonViewer",
  component: JsonViewer,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof JsonViewer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
