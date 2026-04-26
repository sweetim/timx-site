# Architecture

## Overview

timx-site is a personal portfolio and developer tools site built with Next.js 16 (App Router) and React 19. It is a single-deployment Next.js application with no API routes, no database, and no server-side logic beyond static metadata generation. All processing runs client-side in the browser.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 5 |
| Package manager | Bun 1 via mise |
| Pattern matching | ts-pattern 5 |
| Icons | lucide-react |
| Utilities | classnames, date-fns |
| Background removal | @imgly/background-removal |
| Linting | ESLint 9, Biome 2 |
| Component dev | Storybook 10 |

## Routing structure

```
/                          → Profile page (home)
/about                     → About page
/privacy                   → Privacy policy
/developer                 → Developer tools index
/developer/json-viewer     → JSON Viewer tool
/developer/background-remover → Background Remover tool
/developer/image-cropper     → Image Cropper tool
/developer/llm-usage        → LLM Pricing tool
/developer/image-resizer    → Image Resizer tool
/developer/og-preview       → OG Preview tool
```

All routes are static (no dynamic segments). The OG Preview tool uses a server action for server-side URL fetching.

## Execution flow

### Home page (`/`)

1. `app/page.tsx` renders a `Profile` component with hardcoded profile data.
2. The profile avatar links to `/developer`.
3. Social links open external URLs via `window.open`.

### Developer tools (`/developer/*`)

1. `app/developer/layout.tsx` wraps all developer routes with a `NavBar`.
2. `app/developer/page.tsx` reads the tool registry from `app/developer/_lib/tools.ts` and renders a card grid linking to each tool.
3. Each tool page (e.g. `json-viewer/page.tsx`) sets page metadata and renders its client component.
4. The LLM Pricing page fetches model data server-side from the OpenRouter API and passes it to a client component for interactive sorting and filtering.
5. The OG Preview page uses a server action (`fetchOgData`) to fetch a user-provided URL server-side, parse its HTML for meta tags, and return structured OG data to the client component for display.

### Background Remover flow

1. User uploads or drops an image into `UploadZone`.
2. `useBackgroundRemover` hook sends the file to a Web Worker (`background-remover.worker.ts`).
3. The worker calls `@imgly/background-removal` with progress callbacks.
4. Progress events (`downloading-model` → `decoding` → `computing-inference` → `computing-mask` → `encoding`) are mapped to UI phases.
5. On completion, the worker returns a PNG blob; the hook creates an object URL and transitions to the done state.
6. `ResultView` renders an `ImageComparisonSlider` with download and reset actions.

### Image Cropper flow

1. User uploads or drops an image into `UploadZone`.
2. The image is loaded and displayed scaled to fit the container.
3. A centered crop rectangle overlay is rendered with 8 drag handles (corners + edges), defaulting to a 1:1 square aspect ratio.
4. User selects an aspect ratio (Free, 1:1, 4:3, 3:4, 16:9, 9:16) and anchor mode (center or edge).
5. In center anchor mode, handles expand/shrink the crop symmetrically from the center. In edge anchor mode, the opposite edge stays fixed.
6. User drags handles to resize or the rectangle body to reposition the crop area.
7. Clicking "Crop" extracts the selected region via Canvas API and produces a PNG blob.
8. The result is displayed with download and reset actions.

### JSON Viewer flow

1. User types or pastes JSON into the input textarea.
2. `useMemo` parses the input; errors are caught and displayed.
3. Valid JSON is rendered as a collapsible tree via recursive `JsonTreeNode` components.
4. Toolbar actions: Format, Minify, Unescape, Clear, Whitespace toggle.

### Image Resizer flow

1. User uploads one or more images via drag-and-drop or file picker (multiple files supported).
2. Thumbnails of uploaded images are shown with dimensions; individual images can be removed.
3. User configures target width × height (defaults to smallest image dimensions), resize mode (Cover, Contain, or Stretch), and optional background color for Contain mode.
4. Clicking "Resize" processes each image via the Canvas API using the selected mode.
5. Resized images are displayed side by side in a preview grid with per-image download buttons and a "Download All" action.

### OG Preview flow

1. User enters a URL in the input field and submits.
2. The client component calls the `fetchOgData` server action with the URL.
3. The server action fetches the HTML, parses `<meta property="og:*">` and `<meta name="twitter:*">` tags via regex, resolves relative URLs, and returns structured data.
4. The client renders platform-specific preview cards (Facebook, WhatsApp, Discord, LinkedIn, Pinterest) via a tabbed interface, plus a raw tags table showing all discovered meta values.

## Key design decisions

- **No API routes**: all tools run entirely in the browser, except OG Preview which uses a server action for server-side URL fetching.
- **Web Worker for AI inference**: background removal runs off the main thread to keep the UI responsive.
- **Tool registry pattern**: tools are defined centrally in `app/developer/_lib/tools.ts` and referenced by both the index page and the navbar.
- **ts-pattern for exhaustive matching**: used throughout for state machine transitions and conditional rendering.
- **Private component folders**: components prefixed with `_` (e.g. `_components`, `_lib`, `_hooks`) are colocated with their routes and excluded from routing.
- **Colocated Storybook stories**: UI stories live beside the components they document as `*.stories.tsx` files under `app/`.

## File map

### Root config

| File | Purpose |
|---|---|
| `README.md` | Project overview and local development instructions |
| `AGENTS.md` | Repository-specific engineering instructions and workflow constraints |
| `mise.toml` | Pins Bun 1 for local development via mise |
| `bun.lock` | Bun dependency lockfile for the main application |
| `next-env.d.ts` | Next.js generated type declarations |
| `next.config.ts` | Next.js configuration (image remote patterns) |
| `tsconfig.json` | TypeScript configuration |
| `postcss.config.mjs` | PostCSS with Tailwind |
| `eslint.config.mjs` | ESLint flat config |
| `biome.json` | Biome linter/formatter config |
| `package.json` | Dependencies, Bun package-manager metadata, and scripts |
| `.storybook/main.ts` | Storybook file discovery and framework configuration |
| `.storybook/preview.ts` | Storybook global preview configuration |
| `.kilo/commands/doc-sync.md` | Local Kilo command for syncing architecture docs |

Generated or dependency-managed directories such as `.next/`, `node_modules/`, `.git/`, and `tsconfig.tsbuildinfo` are intentionally omitted from the file map.

### `app/` (routes and components)

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout (Mali font, global CSS) |
| `app/page.tsx` | Home page — profile card with Person JSON-LD |
| `app/robots.ts` | robots.txt generation (allows all, references sitemap) |
| `app/sitemap.ts` | XML sitemap listing all pages |
| `app/globals.css` | Tailwind import, theme tokens, animations |
| `app/privacy/page.tsx` | Privacy policy page |
| `app/_components/Profile.tsx` | Profile card component |
| `app/_components/ProfileLink.tsx` | Social link button with blob hover animation |
| `app/_components/json-ld.tsx` | JSON-LD structured data components (Person, WebApplication) |
| `app/developer/layout.tsx` | Developer section layout with NavBar |
| `app/developer/page.tsx` | Developer tools index page |
| `app/developer/_lib/tools.ts` | Tool registry (name, slug, description) |
| `app/developer/_components/nav-bar.tsx` | Top navigation bar for developer section |
| `app/developer/json-viewer/_components/json-viewer.tsx` | JSON Viewer client component |
| `app/developer/json-viewer/page.tsx` | JSON Viewer route page |
| `app/developer/_components/background-remover/index.tsx` | Background Remover client component |
| `app/developer/_components/background-remover/types.ts` | Status and phase types |
| `app/developer/_components/background-remover/constants.ts` | Compute step labels, progress ring dimensions |
| `app/developer/_components/background-remover/utils.ts` | Progress mapping and formatting utilities |
| `app/developer/_components/background-remover/checkerboard-pattern.tsx` | SVG checkerboard pattern for transparency |
| `app/developer/_components/background-remover/image-comparison-slider.tsx` | Drag-to-compare original vs result |
| `app/developer/_components/background-remover/_hooks/use-background-remover.ts` | Main hook: state management, worker communication |
| `app/developer/_components/background-remover/_hooks/background-remover.worker.ts` | Web Worker running @imgly/background-removal |
| `app/developer/_components/background-remover/_components/upload-zone.tsx` | Drag-and-drop upload area |
| `app/developer/_components/background-remover/_components/result-view.tsx` | Result display with download/reset |
| `app/developer/_components/background-remover/_components/error-state.tsx` | Error display with retry |
| `app/developer/_components/background-remover/_components/compute-progress.tsx` | Step-by-step progress indicator |
| `app/developer/_components/background-remover/_components/download-progress.tsx` | Model download progress bar |
| `app/developer/background-remover/page.tsx` | Background Remover route page |
| `app/developer/image-cropper/_components/image-cropper.tsx` | Image Cropper client component |
| `app/developer/image-cropper/page.tsx` | Image Cropper route page |
| `app/developer/llm-usage/_components/llm-usage.tsx` | LLM Pricing main client component (filter/search, provider groups) |
| `app/developer/llm-usage/_components/provider-section.tsx` | Expandable provider table with sort headers |
| `app/developer/llm-usage/_components/cost-calculator-dialog.tsx` | Cost calculator modal |
| `app/developer/llm-usage/_components/types.ts` | Shared types (Model, ProviderGroup, SortKey, etc.) |
| `app/developer/llm-usage/_components/constants.ts` | Release filter options |
| `app/developer/llm-usage/_components/helpers.ts` | Formatting utilities (cost, tokens, modalities, relative time) |
| `app/developer/llm-usage/page.tsx` | LLM Pricing route page (server-side fetch from OpenRouter) |
| `app/developer/image-resizer/_components/image-resizer.tsx` | Image Resizer client component (multi-image upload, resize modes, preview grid) |
| `app/developer/image-resizer/page.tsx` | Image Resizer route page |
| `app/developer/og-preview/_lib/fetch-og.ts` | Server action: fetches URL and extracts OG/Twitter meta tags |
| `app/developer/og-preview/_components/og-preview.tsx` | OG Preview client component |
| `app/developer/og-preview/page.tsx` | OG Preview route page |

Storybook stories are colocated with their UI components. Representative examples include `app/_components/Profile.stories.tsx`, `app/developer/_components/nav-bar.stories.tsx`, `app/developer/json-viewer/_components/json-viewer.stories.tsx`, and `app/developer/_components/background-remover/index.stories.tsx`.

### `app/` assets

| File | Purpose |
|---|---|
| `app/favicon.ico` | Site favicon (Next.js App Router convention) |

### `public/` (static assets)

| File | Purpose |
|---|---|
| `public/github.svg` | GitHub icon |
| `public/gitlab.svg` | GitLab icon |
| `public/docker.svg` | Docker icon |
| `public/linkedin.svg` | LinkedIn icon |
| `public/stackoverflow.svg` | Stack Overflow icon |

## Dependencies

### Runtime dependencies

| Package | Version | Purpose |
|---|---|---|
| `@imgly/background-removal` | ^1.7.0 | Client-side AI background removal |
| `classnames` | ^2.5.1 | Conditional CSS class joining |
| `date-fns` | ^4.1.0 | Date formatting utilities |
| `lucide-react` | ^1.7.0 | Icon library |
| `next` | 16.2.2 | React framework |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | React DOM renderer |
| `ts-pattern` | ^5.9.0 | Pattern matching with exhaustive checks |

### Dev dependencies

| Package | Version | Purpose |
|---|---|---|
| `@biomejs/biome` | 2.4.10 | Linter/formatter |
| `@storybook/nextjs-vite` | ^10.3.4 | Storybook integration for Next.js |
| `@tailwindcss/postcss` | ^4 | Tailwind CSS PostCSS plugin |
| `@types/node` | ^25 | Node.js type definitions |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM type definitions |
| `eslint` | ^9 | JavaScript linter |
| `eslint-config-next` | 16.2.2 | Next.js ESLint config |
| `eslint-plugin-storybook` | ^10.3.4 | Storybook ESLint plugin |
| `storybook` | ^10.3.4 | Component development environment |
| `tailwindcss` | ^4 | Utility-first CSS framework |
| `typescript` | ^5 | TypeScript compiler |
| `vite` | ^8.0.5 | Build tool (used by Storybook) |

## Environment variables

This application uses no environment variables at runtime or build time. There are no `process.env` or `Bun.env` reads in the codebase.

## Types

### `Tool` (app/developer/_lib/tools.ts)

```typescript
type Tool = {
  name: string
  slug: string
  description: string
}
```

### `ProfileProps` (app/_components/Profile.tsx)

```typescript
type ProfileProps = {
  title: string
  description: string
  location: string
  imageUrl: string
  linkUrl: ProfileLinkProps[]
}
```

### `ProfileLinkProps` (app/_components/ProfileLink.tsx)

```typescript
type ProfileLinkProps = {
  imageUrl: string
  linkUrl: string
  label: string
  isRounded?: boolean
  index?: number
}
```

### JSON-LD types (app/_components/json-ld.tsx)

```typescript
type PersonJsonLdProps = {
  name: string
  url: string
  jobTitle: string
  description: string
  sameAs: string[]
}

type WebApplicationJsonLdProps = {
  name: string
  description: string
  url: string
  applicationCategory: string
}
```

### Background Remover types (app/developer/_components/background-remover/types.ts)

```typescript
type ComputePhase =
  | "decoding"
  | "computing-inference"
  | "computing-mask"
  | "encoding"

type ProcessingStatus = { phase: "downloading-model" } | { phase: ComputePhase }

type Status =
  | { phase: "idle" }
  | { phase: "processing"; status: ProcessingStatus; progress: number }
  | { phase: "done"; originalUrl: string; resultUrl: string }
  | { phase: "error"; message: string }
```

### Worker types (app/developer/_components/background-remover/_hooks/background-remover.worker.ts)

```typescript
type WorkerRequest = { type: "process"; file: File }

type WorkerEvent =
  | { type: "progress"; key: string; current: number; total: number }
  | { type: "done"; blob: Blob }
  | { type: "error"; message: string }
```

### Image Cropper types (app/developer/image-cropper/_components/image-cropper.tsx)

```typescript
type CropRect = {
  x: number
  y: number
  width: number
  height: number
}

type AnchorMode = "center" | "edge"

type AspectRatioPreset = "free" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16"

type AspectRatioOption = {
  label: string
  preset: AspectRatioPreset
  ratio: number | null
}

type DragState = {
  type: "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"
  startX: number
  startY: number
  startCrop: CropRect
}

type Status =
  | { phase: "idle" }
  | { phase: "editing"; imageUrl: string; imageWidth: number; imageHeight: number }
  | { phase: "cropped"; originalUrl: string; croppedUrl: string }
```

### JSON Viewer types (app/developer/json-viewer/_components/json-viewer.tsx)

```typescript
type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
```

### Image Resizer types (app/developer/image-resizer/_components/image-resizer.tsx)

```typescript
type ImageItem = {
  id: string
  file: File
  originalUrl: string
  element: HTMLImageElement
  naturalWidth: number
  naturalHeight: number
}

type ResizeMode = "cover" | "contain" | "stretch"

type ResizedItem = {
  id: string
  url: string
  fileName: string
}
```

### OG Preview types (app/developer/og-preview/_lib/fetch-og.ts)

```typescript
type OgData = {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  type: string | null
  twitterCard: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  favicon: string | null
}
```

## Theme tokens

Defined in `app/globals.css` under `@theme`:

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | var(--font-mali) | Primary font family |
| `--color-dev-canvas` | #22272e | Page background |
| `--color-dev-surface` | #2d333b | Elevated surface |
| `--color-dev-inset` | #1c2128 | Recessed areas |
| `--color-dev-button` | #373e47 | Button background |
| `--color-dev-button-hover` | #444c56 | Button hover |
| `--color-dev-border` | #373e47 | Borders |
| `--color-dev-border-muted` | #444c56 | Subtle borders |
| `--color-dev-text` | #adbac7 | Primary text |
| `--color-dev-text-secondary` | #768390 | Secondary text |
| `--color-dev-link` | #539bf5 | Links |
| `--color-dev-accent-blue` | #539bf5 | Primary accent |
| `--color-dev-accent-green` | #57ab5a | Success |
| `--color-dev-accent-red` | #e5534b | Error |
| `--color-dev-accent-orange` | #c69026 | Warning |
| `--color-dev-accent-purple` | #b083f0 | Info |
| `--color-dev-syntax-keyword` | #f47067 | JSON keyword |
| `--color-dev-syntax-string` | #96d0ff | JSON string |
| `--color-dev-syntax-number` | #e6b450 | JSON number |
| `--color-dev-syntax-boolean` | #ff8b39 | JSON boolean |
| `--color-dev-syntax-null` | #ff8b39 | JSON null |
| `--color-dev-syntax-property` | #6cb6ff | JSON property |
| `--color-dev-syntax-punctuation` | #adbac7 | JSON punctuatio    