import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import QrStream from "./qr-stream"

const meta = {
  title: "Developer/QrStream",
  component: QrStream,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof QrStream>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
