import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import CheckerboardPattern from "./checkerboard-pattern"

const meta = {
  title: "BackgroundRemover/CheckerboardPattern",
  component: CheckerboardPattern,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CheckerboardPattern>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
