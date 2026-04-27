import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useEffect, useState } from "react"
import { match, P } from "ts-pattern"
import ComputeProgress from "./_components/compute-progress"
import DownloadProgress from "./_components/download-progress"
import BackgroundRemover from "./index"
import type { Status } from "./types"

const meta = {
  title: "BackgroundRemover/BackgroundRemover",
  component: BackgroundRemover,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof BackgroundRemover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Panel: Story = {
  args: { variant: "panel" },
}

type ProcessingState = Extract<Status, { phase: "processing" }>

function ProcessingTransition() {
  const [status, setStatus] = useState<ProcessingState>({
    phase: "processing",
    status: { phase: "downloading-model" },
    progress: 0,
  })

  useEffect(() => {
    const timeline: Array<{ delay: number; status: ProcessingState }> = [
      {
        delay: 600,
        status: {
          phase: "processing",
          status: { phase: "downloading-model" },
          progress: 0.35,
        },
      },
      {
        delay: 1400,
        status: {
          phase: "processing",
          status: { phase: "downloading-model" },
          progress: 0.7,
        },
      },
      {
        delay: 2200,
        status: {
          phase: "processing",
          status: { phase: "downloading-model" },
          progress: 0.95,
        },
      },
      {
        delay: 3200,
        status: {
          phase: "processing",
          status: { phase: "decoding" },
          progress: 0,
        },
      },
      {
        delay: 4400,
        status: {
          phase: "processing",
          status: { phase: "computing-inference" },
          progress: 0,
        },
      },
    ]

    const timers = timeline.map(({ delay, status: nextStatus }) =>
      setTimeout(() => setStatus(nextStatus), delay),
    )

    const loopTimer = setTimeout(
      () =>
        setStatus({
          phase: "processing",
          status: { phase: "downloading-model" },
          progress: 0,
        }),
      5800,
    )

    return () => {
      for (const timer of timers) clearTimeout(timer)
      clearTimeout(loopTimer)
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-dev-canvas">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {match(status.status)
            .with({ phase: "downloading-model" }, () => (
              <DownloadProgress progress={status.progress} />
            ))
            .with({ phase: P.select() }, (phase) => (
              <ComputeProgress phase={phase} />
            ))
            .exhaustive()}
        </div>
      </div>
    </div>
  )
}

export const DownloadToComputeTransition: Story = {
  render: () => <ProcessingTransition />,
}
