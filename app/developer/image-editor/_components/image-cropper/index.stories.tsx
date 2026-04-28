import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import ImageCropper from "./"

const meta = {
  title: "Developer/ImageCropper",
  component: ImageCropper,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof ImageCropper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Panel: Story = {
  args: { variant: "panel" },
}
