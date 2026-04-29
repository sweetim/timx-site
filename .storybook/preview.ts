import type { Preview } from "@storybook/nextjs-vite"

import "../app/globals.css"

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dev-canvas",
      values: [
        { name: "dev-canvas", value: "#22272e" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
