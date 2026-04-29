import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Developer/ButtonClickFeedback",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-dev-canvas p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj

const primaryBase =
  "no-bounce inline-flex items-center justify-center rounded px-3 py-1.5 text-sm font-medium text-white bg-dev-accent-blue hover:bg-dev-accent-blue/90 transition-colors cursor-pointer select-none"

const secondaryBase =
  "no-bounce inline-flex items-center justify-center rounded px-3 py-1.5 text-sm font-medium text-dev-text bg-dev-button hover:bg-dev-button-hover transition-colors cursor-pointer select-none"

type FeedbackStyle = {
  name: string
  classes: string
}

const feedbackStyles: FeedbackStyle[] = [
  {
    name: "Scale down (classic)",
    classes: "active:scale-95 transition-transform duration-100",
  },
  {
    name: "Scale down (subtle)",
    classes: "active:scale-[0.98] transition-transform duration-100",
  },
  {
    name: "Scale up (pop)",
    classes: "active:scale-105 transition-transform duration-100",
  },
  {
    name: "Bounce (hover up, press down)",
    classes:
      "hover:scale-105 active:scale-95 transition-transform duration-150",
  },
  {
    name: "Brightness down (90%)",
    classes: "active:brightness-90 transition-all duration-100",
  },
  {
    name: "Brightness down (75%)",
    classes: "active:brightness-75 transition-all duration-100",
  },
  {
    name: "Opacity fade",
    classes: "active:opacity-80 transition-opacity duration-100",
  },
  {
    name: "Saturate boost",
    classes: "active:saturate-150 transition-all duration-100",
  },
  {
    name: "Scale + brightness",
    classes: "active:scale-95 active:brightness-90 transition-all duration-100",
  },
  {
    name: "Scale + opacity",
    classes: "active:scale-95 active:opacity-90 transition-all duration-100",
  },
  {
    name: "Pop + lighten",
    classes:
      "active:scale-105 active:brightness-110 transition-all duration-100",
  },
  {
    name: "Ring flash",
    classes:
      "active:ring-2 active:ring-dev-accent-blue transition-all duration-100",
  },
  {
    name: "Focus ring + active ring",
    classes:
      "focus-visible:ring-2 focus-visible:ring-dev-accent-blue active:ring-4 active:ring-dev-accent-blue transition-all duration-100",
  },
  {
    name: "Border color flash",
    classes: "active:border-dev-accent-blue transition-colors duration-100",
  },
  {
    name: "Inset shadow (pushed in)",
    classes: "active:shadow-inner transition-all duration-100",
  },
  {
    name: "Shadow lift then drop",
    classes: "hover:shadow-md active:shadow-lg transition-all duration-100",
  },
  {
    name: "Light flash overlay",
    classes: "active:bg-white/10 transition-colors duration-100",
  },
  {
    name: "Dark overlay press",
    classes: "active:bg-black/10 transition-colors duration-100",
  },
  {
    name: "Accent color flash",
    classes: "active:bg-dev-accent-blue/10 transition-colors duration-100",
  },
  {
    name: "Spring overshoot (keyframe)",
    classes: "active:animate-[press_200ms_ease-out]",
  },
  {
    name: "Upload zone (large area)",
    classes:
      "active:scale-[0.995] active:brightness-95 transition-all duration-150",
  },
]

function FeedbackGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
      {feedbackStyles.map((style) => (
        <div
          key={style.name}
          className="flex flex-col gap-2 rounded-lg border border-dev-border bg-dev-surface p-4"
        >
          <span className="text-xs text-dev-text-secondary">{style.name}</span>
          <code className="text-[10px] text-dev-text-secondary break-all leading-relaxed">
            {style.classes}
          </code>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              className={`${primaryBase} ${style.classes}`}
            >
              Primary
            </button>
            <button
              type="button"
              className={`${secondaryBase} ${style.classes}`}
            >
              Secondary
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export const AllStyles: Story = {
  render: () => <FeedbackGrid />,
}

export const ScaleDown: Story = {
  render: () => (
    <div className="flex gap-4">
      <button
        type="button"
        className={`${primaryBase} active:scale-95 transition-transform duration-100`}
      >
        Scale 95
      </button>
      <button
        type="button"
        className={`${primaryBase} active:scale-[0.98] transition-transform duration-100`}
      >
        Scale 98
      </button>
      <button
        type="button"
        className={`${primaryBase} active:scale-105 transition-transform duration-100`}
      >
        Scale 105
      </button>
    </div>
  ),
}

export const Brightness: Story = {
  render: () => (
    <div className="flex gap-4">
      <button
        type="button"
        className={`${primaryBase} active:brightness-90 transition-all duration-100`}
      >
        90%
      </button>
      <button
        type="button"
        className={`${primaryBase} active:brightness-75 transition-all duration-100`}
      >
        75%
      </button>
      <button
        type="button"
        className={`${primaryBase} active:brightness-110 transition-all duration-100`}
      >
        110%
      </button>
    </div>
  ),
}

export const Combined: Story = {
  render: () => (
    <div className="flex gap-4">
      <button
        type="button"
        className={`${primaryBase} active:scale-95 active:brightness-90 transition-all duration-100`}
      >
        Scale + Dim
      </button>
      <button
        type="button"
        className={`${primaryBase} hover:scale-105 active:scale-95 transition-transform duration-150`}
      >
        Bounce
      </button>
      <button
        type="button"
        className={`${primaryBase} active:scale-105 active:brightness-110 transition-all duration-100`}
      >
        Pop + Light
      </button>
    </div>
  ),
}

export const RingAndShadow: Story = {
  render: () => (
    <div className="flex gap-4">
      <button
        type="button"
        className={`${primaryBase} active:ring-2 active:ring-dev-accent-blue transition-all duration-100`}
      >
        Ring Flash
      </button>
      <button
        type="button"
        className={`${secondaryBase} active:shadow-inner transition-all duration-100`}
      >
        Inset Shadow
      </button>
      <button
        type="button"
        className={`${secondaryBase} hover:shadow-md active:shadow-lg transition-all duration-100`}
      >
        Lift Shadow
      </button>
    </div>
  ),
}

export const OverlayFlash: Story = {
  render: () => (
    <div className="flex gap-4">
      <button
        type="button"
        className={`${secondaryBase} active:bg-white/10 transition-colors duration-100`}
      >
        Light Flash
      </button>
      <button
        type="button"
        className={`${secondaryBase} active:bg-black/10 transition-colors duration-100`}
      >
        Dark Overlay
      </button>
      <button
        type="button"
        className={`${secondaryBase} active:bg-dev-accent-blue/10 transition-colors duration-100`}
      >
        Accent Flash
      </button>
    </div>
  ),
}

export const LargeAreaUploadZone: Story = {
  render: () => (
    <button
      type="button"
      className="no-bounce flex flex-col items-center justify-center rounded-md border-2 border-dashed border-dev-border cursor-pointer transition-all duration-150 min-h-75 w-full max-w-lg p-8 hover:border-dev-border-muted hover:bg-dev-inset active:scale-[0.995] active:brightness-95"
    >
      <span className="text-sm font-medium text-dev-text">
        Click or drag to upload
      </span>
      <span className="mt-1 text-xs text-dev-text-secondary">
        hover:border-dev-border-muted hover:bg-dev-inset + active:scale-[0.995]
        active:brightness-95
      </span>
    </button>
  ),
}
