import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ContributionHeatmap } from "./contribution-heatmap"
import type { ContributionWeek } from "./types"

function mockWeeks(seed = 1): ContributionWeek[] {
  let value = seed
  const random = () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }

  const weeks: ContributionWeek[] = []
  const start = new Date()
  start.setDate(start.getDate() - 364)

  for (let week = 0; week < 53; week++) {
    const contributionDays = Array.from({ length: 7 }, (_, weekday) => {
      const date = new Date(start)
      date.setDate(start.getDate() + week * 7 + weekday)
      const count = Math.floor(random() ** 2 * 12)
      const intensityLevel = count === 0 ? 0 : Math.min(4, Math.ceil(count / 3))
      return {
        date: date.toISOString().slice(0, 10),
        contributionCount: count,
        weekday,
        intensityLevel,
      }
    })
    weeks.push({ contributionDays })
  }
  return weeks
}

const meta = {
  title: "Developer/Gitropolis/ContributionHeatmap",
  component: ContributionHeatmap,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="rounded-lg border border-dev-border bg-dev-surface p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContributionHeatmap>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { weeks: mockWeeks() },
}

export const Active: Story = {
  args: { weeks: mockWeeks(7) },
}

export const Sparse: Story = {
  args: { weeks: mockWeeks(42) },
}
