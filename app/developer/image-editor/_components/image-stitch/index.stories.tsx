import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import ScreenshotStitcher from "./"

const meta = {
  title: "Developer/ScreenshotStitcher",
  component: ScreenshotStitcher,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof ScreenshotStitcher>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Panel: Story = {
  args: { variant: "panel" },
}
