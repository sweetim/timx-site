import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { ComputePhase } from "../types"
import ComputeProgress from "./compute-progress"

const meta = {
  title: "BackgroundRemover/ComputeProgress",
  component: ComputeProgress,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    phase: {
      control: { type: "select" },
      options: [
        "decoding",
        "computing-inference",
        "computing-mask",
        "encoding",
      ] as ComputePhase[],
    },
  },
} satisfies Meta<typeof ComputeProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Decoding: Story = { args: { phase: "decoding" } }
export const ComputingInference: Story = {
  args: { phase: "computing-inference" },
}
export const ComputingMask: Story = { args: { phase: "computing-mask" } }
export const Encoding: Story = { args: { phase: "encoding" } }
