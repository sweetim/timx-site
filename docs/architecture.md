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
| Utilities | classnames |
| Background removal | @imgly/background-removal |
| Linting | ESLint 9, Biome 2 |
| Component dev | Storybook 10 |

## Routing structure

```
/                          → Profile page (home)
/developer                 → Developer tools index
/developer/json-viewer     → JSON Viewer tool
/developer/background-remover → Background Remover tool
/developer/image-cropper     → Image Cropper tool
```

All routes are static (no dynamic segments, no server actions).

## Execution flow

### Home page (`/`)

1. `app/page.tsx` renders a `Profile` component with hardcoded profile data.
2. The profile avatar links to `/developer`.
3. Social links open external URLs via `window.open`.

### Developer tools (`/developer/*`)

1. `app/developer/layout.tsx` wraps all developer routes with a `NavBar`.
2. `app/developer/page.tsx` reads the tool registry from `app/developer/_lib/tools.ts` and renders a card grid linking to each tool.
3. Each tool page (e.g. `json-viewer/page.tsx`) sets page metadata and renders its client component.

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
3. A centered crop rectangle overlay is rendered with 8 drag handles (corners + edges).
4. User drags handles to resize or the rectangle body to reposition the crop area.
5. Clicking "Crop" extracts the selected region via Canvas API and produces a PNG blob.
6. The result is displayed with download and reset actions.

### JSON Viewer flow

1. User types or pastes JSON into the input textarea.
2. `useMemo` parses the input; errors are caught and displayed.
3. Valid JSON is rendered as a collapsible tree via recursive `JsonTreeNode` components.
4. Toolbar actions: Format, Minify, Unescape, Clear, Whitespace toggle.

## Key design decisions

- **No API routes**: all tools run entirely in the browser.
- **Web Worker for AI inference**: background removal runs off the main thread to keep the UI responsive.
- **Tool registry pattern**: tools are defined centrally in `app/developer/_lib/tools.ts` and referenced by both the index page and the navbar.
- **ts-pattern for exhaustive matching**: used throughout for state machine transitions and conditional rendering.
- **Private component folders**: components prefixed with `_` (e.g. `_components`, `_lib`, `_hooks`) are colocated with their routes and excluded from routing.

## File map

### Root config

| File | Purpose |
|---|---|
| `mise.toml` | Pins Bun 1 for local development via mise |
| `next.config.ts` | Next.js configuration (image remote patterns) |
| `tsconfig.json` | TypeScript configuration |
| `postcss.config.mjs` | PostCSS with Tailwind |
| `eslint.config.mjs` | ESLint flat config |
| `biome.json` | Biome linter/formatter config |
| `package.json` | Dependencies, Bun package-manager metadata, and scripts |

### `app/` (routes and components)

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout (Mali font, global CSS) |
| `app/page.tsx` | Home page — profile card |
| `app/globals.css` | Tailwind import, theme tokens, animations |
| `app/_components/Profile.tsx` | Profile card component |
| `app/_components/ProfileLink.tsx` | Social link button with blob hover animation |
| `app/developer/layout.tsx` | Developer section layout with NavBar |
| `app/developer/page.tsx` | Developer tools index page |
| `app/developer/_lib/tools.ts` | Tool registry (name, slug, description) |
| `app/developer/_components/nav-bar.tsx` | Top navigation bar for developer section |
| `app/developer/_components/json-viewer.tsx` | JSON Viewer client component |
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
| `app/developer/_components/image-cropper.tsx` | Image Cropper client component |
| `app/developer/image-cropper/page.tsx` | Image Cropper route page |

### `public/` (static assets)

| File | Purpose |
|---|---|
| `public/favicon.ico` | Site favicon |
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
  isRounded?: boolean
  index?: number
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

### JSON Viewer types (app/developer/_components/json-viewer.tsx)

```typescript
type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
```

## Theme tokens

Defined in `app/globals.css` under `@theme`:

| Token | Value | Usage |
|---|---|---|
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
| `--color-dev-syntax-punctuation` | #adbac7 | JSON punctuation |
