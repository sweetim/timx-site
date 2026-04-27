import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import ImageEditor from "./image-editor"

const meta = {
  title: "Developer/ImageEditor",
  component: ImageEditor,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof ImageEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
