import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import MarkdownFormatter from "./markdown-formatter"

const meta = {
  title: "Developer/MarkdownFormatter",
  component: MarkdownFormatter,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof MarkdownFormatter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
