import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import ResultView from "./result-view"

const meta = {
  title: "BackgroundRemover/ResultView",
  component: ResultView,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ResultView>

export default meta
type Story = StoryObj<typeof meta>

const originalUrl =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop"
const resultUrl =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop&sat=-100"

export const Default: Story = {
  args: {
    originalUrl,
    resultUrl,
    downloadFormat: "png",
    onDownload: () => {},
    onFormatChange: () => {},
    onReset: () => {},
  },
}
