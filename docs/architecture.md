# Architecture

## Overview

timx-site is a personal portfolio and developer tools site built with Next.js 16 (App Router) and React 19. It is a single-deployment Next.js application with no API routes and no database. Most processing runs client-side in the browser; the LLM Pricing tool fetches OpenRouter model data client-side, and the OG Preview tool uses a server action for server-side URL fetching.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 5 |
| Package manager | Bun 1 via mise |
| Pattern matching | ts-pattern 5 |
| Icons | lucide-react, @icons-pack/react-simple-icons |
| Virtual list | @tanstack/react-virtual |
| Utilities | clsx, date-fns |
| Markdown rendering | react-markdown, remark-gfm |
| Code editor | CodeMirror 6 (@codemirror/view, @codemirror/state, @codemirror/lang-sql, @codemirror/commands, @codemirror/autocomplete) |
| Background removal | @imgly/background-removal |
| Linting | ESLint 9, Biome 2 |
| Component dev | Storybook 10 |

## Routing structure

```
/                          → Profile page (home)
/privacy                   → Privacy policy
/terms                     → Terms of service
/developer                 → Developer tools index
/developer/json-viewer     → JSON Viewer tool
/developer/image-editor    → Image Editor tool
/developer/llm-usage       → LLM Pricing tool
/developer/db-explorer     → SQLite DB Explorer tool
/developer/og-preview      → OG Preview tool
/developer/black-screen    → Black Screen (pixel & dust checker) tool
```

All routes are static (no dynamic segments). The LLM Pricing tool fetches OpenRouter data client-side, the OG Preview tool uses a server action for server-side URL fetching, and the DB Explorer tool uses sql.js (WASM) in a Web Worker to parse SQLite files off the main thread.

## Execution flow

### Home page (`/`)

1. `app/page.tsx` renders a `Profile` component with hardcoded profile data.
2. The profile avatar links to `/developer`.
3. Social links render as crawlable external anchors.

### Developer tools (`/developer/*`)

1. `app/developer/layout.tsx` wraps all developer routes with a `NavBar`.
2. `app/developer/page.tsx` reads the tool registry from `app/developer/_lib/tools.ts` and renders a card grid linking to each tool.
3. Each tool page (e.g. `json-viewer/page.tsx`) sets page metadata and renders its client component.
4. The LLM Pricing page renders a server-rendered H1 and introductory paragraph, then the `LlmUsage` client component, which fetches model data from the OpenRouter API and provides interactive sorting and filtering.
5. The OG Preview page uses a server action (`fetchOgData`) to validate and fetch a user-provided URL server-side, parse its HTML for meta tags, and return structured OG data to the client component for display.

### Image Editor flow

1. `/developer/image-editor` renders a Photoshop-style workspace with a persistent tool rail, shared canvas area, and right properties panel.
2. Users choose Background Remover, Crop, or Screenshot Stitcher from the tool rail; switching tools keeps each tool mounted and does not clear the current canvas image.
3. `ImageEditor` owns a shared current image document, a shared `sourceImages` array, and background-removal results cached by source image ID. Uploads and tool results update that shared image so single-image modes can import the latest canvas image when selected. Any image uploaded in any tool is added to `sourceImages`, which is shared across all tools.
4. The active tool controls the visible canvas overlay and right properties panel: Background Remover shows processing controls with a Source picker, Crop shows crop handles, sizing controls, and a Source picker, and Screenshot Stitcher shows a multi-frame board with layers and stitch settings.
5. Background Remover and Crop each display a "Source" card in the properties panel showing all uploaded images as selectable thumbnails. Users can switch the active image without re-uploading.
6. Screenshot Stitcher remains a multi-image composition mode. Users add frames by uploading, dropping, pasting, or selecting shared Source thumbnails.
7. A shared clipboard in `ImageEditor` stores the latest generated image so result actions can copy the latest output.
8. Background Remover uploads or drops images into `UploadZone`; images are added to `sourceImages` and shown in the Source picker. Users click "Remove Background" per image to start processing via `useBackgroundRemoverPool`, which creates one Web Worker per image for concurrent processing. Each worker calls `@imgly/background-removal` and reports progress independently. Users can browse between images while they process. Completed results are cached per source image ID so users can view previously processed results without reprocessing. The Source picker shows status badges (spinner for processing, checkmark for done, error icon for failures).
9. Crop uploads or imports one shared image, displays a draggable crop rectangle on the canvas, moves aspect ratio and anchor controls into the properties panel, then exports the selected region via Canvas API.
10. Screenshot Stitcher uploads multiple images, places each centered inside a consistent frame, applies optional spacing between frames, shows a live canvas preview plus export preview, stacks frames horizontally or vertically, and exports one combined image in the selected format.

### Image Cropper flow

1. User uploads or drops an image into `UploadZone`.
2. The image is loaded and displayed scaled to fit the container.
3. A centered crop rectangle overlay is rendered with 8 drag handles (corners + edges), defaulting to a 1:1 square aspect ratio.
4. User selects an aspect ratio (Free, 1:1, 4:3, 3:4, 16:9, 9:16) and anchor mode (center or edge).
5. In center anchor mode, handles expand/shrink the crop symmetrically from the center. In edge anchor mode, the opposite edge stays fixed.
6. User drags handles to resize or the rectangle body to reposition the crop area.
7. Clicking "Crop" extracts the selected region via Canvas API and produces a PNG blob.
8. The result is displayed with download format and reset actions.

### JSON Viewer flow

1. The page renders a visible SEO heading and intro copy above the tool workspace.
2. User types or pastes JSON into the input textarea.
3. `useMemo` parses the input; errors are caught and displayed.
4. Valid JSON is rendered as a collapsible tree via recursive `JsonTreeNode` components.
5. Toolbar actions: Format, Minify, Unescape, Clear, Whitespace toggle.

### DB Reader flow

1. User selects or drops a `.db`/`.sqlite`/`.sqlite3` file via file picker or drag-and-drop.
2. The file is loaded client-side using `sql.js` (WASM-based SQLite) in a Web Worker, parsing the file as an `ArrayBuffer`.
3. All user tables are enumerated from `sqlite_master`; each table's columns are read from SQLite schema metadata, row counts are computed asynchronously, and tables are displayed in a sidebar.
4. Clicking a table shows its rows (paginated at 100 rows per page) in the main data table.
5. A SQL query editor lets users run arbitrary queries against the loaded database; results appear in the same table view.
6. Ctrl+Enter shortcut runs the query, and Ctrl+Space offers table and column autocomplete from the loaded SQLite schema. Query errors are displayed inline.
7. The database can be closed to load a different file.

### Screenshot Stitcher flow

1. User uploads one or more images via drag-and-drop or file picker (multiple files supported).
2. Thumbnails of uploaded screenshots are shown with dimensions; individual images can be removed.
3. User configures a consistent frame width and height, spacing between frames, stack direction, and optional background color from the properties panel.
4. The center canvas shows a live frame preview on a grid background, plus a separate export preview area after generation.
5. Individual screenshots can be removed from the live preview via a hover delete button or from the layers list.
6. Clicking "Stitch Screenshots" uses the Canvas API to fit each image into its frame without cropping or stretching.
7. The generated image stacks all frames horizontally or vertically with the configured spacing and can be downloaded as PNG, JPEG, or WebP.

### OG Preview flow

1. User enters a URL in the input field and submits.
2. The client component calls the `fetchOgData` server action with the URL.
3. The server action accepts only HTTPS URLs, blocks private or reserved hosts, follows redirects only after validating the final host, and limits the fetch to 10 seconds and 512 KB of HTML.
4. The server action parses `<meta property="og:*">`, `<meta name="twitter:*">`, description, title, and favicon tags via regex, resolves relative URLs, and returns structured data.
5. The client renders platform-specific preview cards (Facebook, WhatsApp, Discord, LinkedIn) in a grid, plus a raw tags table showing all discovered meta values.

### Black Screen flow

1. `/developer/black-screen` renders an SEO heading and description explaining the tool's purpose.
2. The `BlackScreenButton` client component shows an "Enter Full Black Screen" button.
3. Clicking the button activates fullscreen mode via the Fullscreen API and displays a pure black overlay.
4. The user exits by pressing Escape or clicking anywhere; fullscreen is exited and the overlay is dismissed.

## Key design decisions

- **No API routes**: browser tools run client-side; LLM Pricing fetches OpenRouter data from the client, and OG Preview uses a server action for server-side URL fetching.
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
| `.gitignore` | Git ignore rules for dependencies, build outputs, local env files, and generated artifacts |
| `mise.toml` | Pins Bun 1 for local development via mise |
| `bun.lock` | Bun dependency lockfile for the main application |
| `next-env.d.ts` | Next.js generated type declarations |
| `next.config.ts` | Next.js configuration (image remote patterns, WASM content-type header) |
| `tsconfig.json` | TypeScript configuration |
| `postcss.config.mjs` | PostCSS with Tailwind |
| `eslint.config.mjs` | ESLint flat config |
| `biome.json` | Biome linter/formatter config |
| `package.json` | Dependencies, Bun package-manager metadata, and scripts |
| `.storybook/main.ts` | Storybook file discovery and framework configuration |
| `.storybook/preview.ts` | Storybook global preview configuration |
| `.kilo/commands/doc-sync.md` | Local Kilo command for syncing architecture docs |
| `.kilo/commands/seo-audit.md` | Local Kilo command for SEO audits |

Generated or dependency-managed directories such as `.next/`, `node_modules/`, `.git/`, and `tsconfig.tsbuildinfo` are intentionally omitted from the file map.

### `app/` (routes and components)

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout (Mali font, global CSS, Google Analytics) |
| `app/page.tsx` | Home page — profile card with Person JSON-LD |
| `app/robots.ts` | robots.txt generation (allows all, references sitemap) |
| `app/sitemap.ts` | XML sitemap listing all pages |
| `app/globals.css` | Tailwind import, theme tokens, scrollbar styles, animations, global button bounce (hover:scale-105 active:scale-95) |
| `app/privacy/page.tsx` | Privacy policy page |
| `app/terms/page.tsx` | Terms of service page |
| `app/_components/Profile.tsx` | Profile card component |
| `app/_components/ProfileLink.tsx` | Social link button with blob hover animation |
| `app/_components/json-ld.tsx` | JSON-LD structured data components (Person, ItemList, WebApplication) |
| `app/developer/layout.tsx` | Developer section layout with NavBar and scoped developer scrollbar styling |
| `app/developer/page.tsx` | Developer tools index page |
| `app/developer/_lib/tools.ts` | Tool registry (name, slug, description) |
| `app/developer/_components/nav-bar.tsx` | Top navigation bar for developer section |
| `app/developer/_components/stepper-input.tsx` | Reusable numeric stepper input used by image editor controls |
| `app/developer/_components/button-click-feedback.stories.tsx` | Storybook showcase of global button click feedback styles |
| `app/developer/_components/number-input.stories.tsx` | Storybook showcase of number input styles |
| `app/developer/json-viewer/_components/json-viewer.tsx` | JSON Viewer client component |
| `app/developer/json-viewer/page.tsx` | JSON Viewer route page |
| `app/developer/db-explorer/_components/types.ts` | DB Explorer shared types (TableInfo, QueryResult, DbState, constants) |
| `app/developer/db-explorer/_components/db-worker.ts` | Web Worker that owns sql.js WASM and executes all SQL queries off the main thread |
| `app/developer/db-explorer/_components/use-db-worker.ts` | Hook managing the DB Web Worker lifecycle and typed request/response communication |
| `app/developer/db-explorer/_components/use-file-handle.ts` | Hook for recent files IndexedDB persistence via File System Access API |
| `app/developer/db-explorer/_components/db-explorer.tsx` | DB Explorer orchestrator component (state management, phase rendering) |
| `app/developer/db-explorer/_components/db-explorer-reducer.ts` | DB Explorer reducer (DbExplorerState, DbExplorerAction, ts-pattern dispatch) |
| `app/developer/db-explorer/_components/empty-state.tsx` | Empty/landing state with file upload and recent files list |
| `app/developer/db-explorer/_components/table-sidebar.tsx` | Sidebar showing loaded tables with row counts |
| `app/developer/db-explorer/_components/query-editor.tsx` | CodeMirror SQL query editor with table and column autocomplete, run button, and Ctrl+Enter shortcut |
| `app/developer/db-explorer/_components/result-view.tsx` | Result display with pagination (wraps ResultTable) |
| `app/developer/db-explorer/_components/result-table.tsx` | Generic SQL result table rendering |
| `app/developer/db-explorer/_components/pagination.tsx` | Paginated prev/next navigation for query results |
| `app/developer/db-explorer/page.tsx` | DB Explorer route page |
| `app/developer/image-editor/_components/image-editor.tsx` | Combined Image Editor workspace with tool rail, canvas, and properties panel |
| `app/developer/image-editor/_components/editor-info-content.tsx` | SEO/help content shown from the Image Editor info panel |
| `app/developer/image-editor/page.tsx` | Image Editor route page |
| `app/developer/image-editor/_components/background-remover/index.tsx` | Background Remover client component |
| `app/developer/image-editor/_components/background-remover/types.ts` | Status, phase, and per-image processing types |
| `app/developer/image-editor/_components/background-remover/constants.ts` | Compute step labels, progress ring dimensions |
| `app/developer/image-editor/_components/background-remover/utils.ts` | Progress mapping and formatting utilities |
| `app/developer/image-editor/_components/background-remover/checkerboard-pattern.tsx` | SVG checkerboard pattern for transparency |
| `app/developer/image-editor/_components/background-remover/image-comparison-slider.tsx` | Drag-to-compare original vs result |
| `app/developer/image-editor/_components/background-remover/_hooks/use-background-remover-pool.ts` | Pool hook: per-image worker management, concurrent processing |
| `app/developer/image-editor/_components/background-remover/_hooks/background-remover.worker.ts` | Web Worker running @imgly/background-removal |
| `app/developer/image-editor/_components/background-remover/_components/result-view.tsx` | Result display with download/reset |
| `app/developer/image-editor/_components/background-remover/_components/error-state.tsx` | Error display with retry |
| `app/developer/image-editor/_components/background-remover/_components/compute-progress.tsx` | Step-by-step progress indicator |
| `app/developer/image-editor/_components/background-remover/_components/download-progress.tsx` | Model download progress bar |
| `app/developer/image-editor/_components/upload-zone.tsx` | Shared drag-and-drop upload area with single/multiple image copy |
| `app/developer/image-editor/_components/download-format-selector.tsx` | Shared download format selector (PNG, JPEG, WebP) and format conversion utility |
| `app/developer/image-editor/_components/canvas-drop-overlay.tsx` | Canvas-level drag overlay with label |
| `app/developer/image-editor/_components/shared/types.ts` | Shared editor tool prop contract used by Background Remover, Crop, and Screenshot Stitcher |
| `app/developer/image-editor/_components/shared/tool-panel-layout.tsx` | Shared two-column canvas/sidebar layout for image editor tool panels |
| `app/developer/image-editor/_components/shared/source-image-panel.tsx` | Shared source image picker panel with add/remove controls and status badges |
| `app/developer/image-editor/_components/shared/sidebar-actions.tsx` | Shared panel actions for primary, format/download, copy, and clear controls |
| `app/developer/image-editor/_components/shared/use-dropped-files.ts` | Shared hook for active-tool canvas drop processing |
| `app/developer/image-editor/_components/shared/use-clipboard-paste.ts` | Shared hook for active-tool image paste handling |
| `app/developer/image-editor/_components/shared/use-source-file-input.ts` | Shared hook for source image file input handling |
| `app/developer/image-editor/_components/shared/use-workspace-reset.ts` | Shared hook for workspace reset key handling |
| `app/developer/image-editor/_components/image-cropper/index.tsx` | Image Cropper client component |
| `app/developer/image-editor/_components/image-cropper/types.ts` | Cropper types (CropRect, DragState, Status, AnchorMode, etc.) |
| `app/developer/image-editor/_components/image-cropper/constants.ts` | Aspect ratio presets and handle constants |
| `app/developer/image-editor/_components/image-cropper/crop-overlay.tsx` | Draggable crop rectangle with 8 resize handles |
| `app/developer/image-editor/_components/image-cropper/_hooks/use-image-cropper.ts` | Cropper hook for image loading, crop state, drag math, export, and reset logic |
| `app/developer/image-editor/_components/image-cropper/_lib/crop-math.ts` | Crop math utilities (clamp, resize, aspect ratio) |
| `app/developer/image-editor/_components/image-stitch/index.tsx` | Screenshot Stitcher client component (multi-image upload, frame alignment, spacing, selected-format export) |
| `app/developer/image-editor/_components/image-stitch/types.ts` | Stitcher types (ImageItem, StackDirection, StitchedImage, etc.) |
| `app/developer/image-editor/_components/image-stitch/constants.ts` | Checkerboard background style |
| `app/developer/image-editor/_components/image-stitch/_hooks/use-screenshot-stitcher.ts` | Screenshot Stitcher hook for image list state, frame settings, stitching, export, and reset logic |
| `app/developer/image-editor/_components/image-stitch/_lib/stitch-canvas.ts` | Canvas API stitching logic (frame layout, export) |
| `app/developer/llm-usage/_components/llm-usage.tsx` | LLM Pricing main client component (filter/search, provider groups) |
| `app/developer/llm-usage/_components/llm-usage-info.tsx` | LLM Pricing SEO heading, intro copy, and educational sections |
| `app/developer/llm-usage/_components/provider-section.tsx` | Expandable provider table with sort headers |
| `app/developer/llm-usage/_components/cost-calculator-dialog.tsx` | Cost calculator modal |
| `app/developer/llm-usage/_components/types.ts` | Shared types (Model, ProviderGroup, SortKey, etc.) |
| `app/developer/llm-usage/_components/constants.ts` | Release filter options |
| `app/developer/llm-usage/_components/helpers.ts` | Formatting utilities (cost, tokens, modalities, relative time) |
| `app/developer/llm-usage/page.tsx` | LLM Pricing route page that renders the client-side OpenRouter fetcher |
| `app/developer/og-preview/_lib/fetch-og.ts` | Server action: fetches URL and extracts OG/Twitter meta tags |
| `app/developer/og-preview/_components/og-preview.tsx` | OG Preview client component |
| `app/developer/og-preview/page.tsx` | OG Preview route page |
| `app/developer/black-screen/page.tsx` | Black Screen route page |
| `app/developer/black-screen/_components/black-screen-button.tsx` | Fullscreen black screen toggle (enter via button, exit via Escape/click) |

Storybook stories are colocated with their UI components: `app/_components/Profile.stories.tsx`, `app/_components/ProfileLink.stories.tsx`, `app/developer/_components/nav-bar.stories.tsx`, `app/developer/_components/number-input.stories.tsx`, `app/developer/_components/button-click-feedback.stories.tsx`, `app/developer/json-viewer/_components/json-viewer.stories.tsx`, `app/developer/image-editor/_components/image-editor.stories.tsx`, `app/developer/image-editor/_components/background-remover/index.stories.tsx`, `app/developer/image-editor/_components/background-remover/_components/compute-progress.stories.ts`, `app/developer/image-editor/_components/background-remover/_components/download-progress.stories.ts`, `app/developer/image-editor/_components/background-remover/_components/error-state.stories.ts`, `app/developer/image-editor/_components/background-remover/_components/result-view.stories.tsx`, `app/developer/image-editor/_components/background-remover/_components/upload-zone.stories.ts`, `app/developer/image-editor/_components/background-remover/checkerboard-pattern.stories.tsx`, `app/developer/image-editor/_components/background-remover/image-comparison-slider.stories.tsx`, `app/developer/image-editor/_components/image-cropper/index.stories.tsx`, and `app/developer/image-editor/_components/image-stitch/index.stories.tsx`.

### `app/` assets

| File | Purpose |
|---|---|
| `app/favicon.ico` | Site favicon (Next.js App Router convention) |
| `app/opengraph.jpg` | Open Graph image for social media previews |

### `public/` (static assets)

| File | Purpose |
|---|---|
| `public/github.svg` | GitHub icon |
| `public/gitlab.svg` | GitLab icon |
| `public/docker.svg` | Docker icon |
| `public/linkedin.svg` | LinkedIn icon |
| `public/stackoverflow.svg` | Stack Overflow icon |
| `public/timx-logo.png` | Site logo |
| `public/sql-wasm.wasm` | sql.js WASM binary for client-side SQLite in DB Explorer |

## Dependencies

### Runtime dependencies

| Package | Version | Purpose |
|---|---|---|
| `@codemirror/autocomplete` | ^6.20.2 | CodeMirror autocomplete for DB Explorer query editor |
| `@codemirror/commands` | ^6.10.3 | CodeMirror editing commands |
| `@codemirror/lang-sql` | ^6.10.0 | CodeMirror SQL language support |
| `@codemirror/state` | ^6.6.0 | CodeMirror editor state |
| `@codemirror/view` | ^6.43.0 | CodeMirror editor view |
| `@icons-pack/react-simple-icons` | ^13.13.0 | Brand and social SVG icons |
| `@imgly/background-removal` | ^1.7.0 | Client-side AI background removal |
| `@next/third-parties` | ^16.2.4 | Google Analytics integration |
| `@tanstack/react-virtual` | ^3.13.24 | Virtual scrolling for DB Explorer result table |
| `clsx` | ^2.1.1 | Conditional CSS class joining |
| `date-fns` | ^4.1.0 | Date formatting utilities |
| `lucide-react` | ^1.7.0 | Icon library |
| `next` | 16.2.2 | React framework |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | React DOM renderer |
| `react-markdown` | ^10.1.0 | Markdown rendering |
| `remark-gfm` | ^4.0.1 | GitHub Flavored Markdown plugin for react-markdown |
| `sql.js` | ^1.14.1 | Client-side WASM SQLite for DB Explorer tool |
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
| `@types/sql.js` | ^1.4.11 | sql.js type definitions |
| `eslint` | ^9 | JavaScript linter |
| `eslint-config-next` | 16.2.2 | Next.js ESLint config |
| `eslint-plugin-storybook` | ^10.3.4 | Storybook ESLint plugin |
| `storybook` | ^10.3.4 | Component development environment |
| `tailwindcss` | ^4 | Utility-first CSS framework |
| `typescript` | ^5 | TypeScript compiler |
| `vite` | ^8.0.5 | Build tool (used by Storybook) |

## Environment variables

This application uses one environment variable:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID (e.g. `G-XXXXXXXXXX`). Optional; if unset, the GA script is not loaded. |

## Types

### `Tool` (app/developer/_lib/tools.ts)

```typescript
type Tool = {
  name: string
  slug: string
  description: string
  icon: LucideIcon
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
  image?: string
  knowsAbout?: string[]
  sameAs: string[]
}

type WebApplicationJsonLdProps = {
  name: string
  description: string
  url: string
  applicationCategory: string
  featureList?: string[]
}

type ItemListJsonLdProps = {
  name: string
  description: string
  items: { name: string; url: string; description: string }[]
}
```

### DB Explorer types (app/developer/db-explorer/_components/types.ts)

```typescript
type TableInfo = {
  name: string
  columns: string[]
  rowCount: number
}

type QueryResult = {
  columns: string[]
  rows: SqlValue[][]
}

type DbState =
  | { phase: "empty" }
  | { phase: "loading" }
  | { phase: "ready"; tables: TableInfo[] }
  | { phase: "error"; message: string }
```

### Background Remover types (app/developer/image-editor/_components/background-remover/types.ts)

```typescript
type ComputePhase =
  | "decoding"
  | "computing-inference"
  | "computing-mask"
  | "encoding"

type ProcessingStatus = { phase: "downloading-model" } | { phase: ComputePhase }

type Status =
  | { phase: "idle" }
  | { phase: "ready"; originalUrl: string }
  | { phase: "processing"; status: ProcessingStatus; progress: number; originalUrl: string }
  | { phase: "done"; originalUrl: string; resultUrl: string }
  | { phase: "error"; message: string }

type PerImageStatus =
  | { phase: "processing"; status: ProcessingStatus; progress: number }
  | { phase: "done"; resultUrl: string }
  | { phase: "error"; message: string }
```

### Shared editor tool props (app/developer/image-editor/_components/shared/types.ts)

```typescript
type EditorToolProps = {
  variant?: "page" | "panel"
  isActive?: boolean
  initialImage?: SharedEditorImage | null
  workspaceResetKey?: number
  onResult?: (blob: Blob) => void
  onSourceImage?: (blob: Blob, name: string) => void
  onClearWorkspace?: () => void
  onCopyToClipboard?: () => void
  hasClipboard?: boolean
  droppedFiles?: File[]
  droppedFilesKey?: number
  canvasDropProps?: CanvasDropProps
  sourceImages?: SourceImage[]
  onRemoveSourceImage?: (id: string) => void
  onAddSourceImages?: (files: File[]) => Promise<SourceImage[]>
  backgroundRemovalResults?: Record<string, BackgroundRemovalResult>
  onBackgroundRemovalResult?: (sourceId: string, blob: Blob) => void
}
```

`BackgroundRemover`, `ImageCropper`, and `ScreenshotStitcher` all consume this shared prop contract. `ImageCropperProps` and `ScreenshotStitcherProps` are aliases of `EditorToolProps` in their tool-specific `types.ts` files.

### Worker types (app/developer/image-editor/_components/background-remover/_hooks/background-remover.worker.ts)

```typescript
type WorkerRequest = { type: "process"; file: File }

type WorkerEvent =
  | { type: "progress"; key: string; current: number; total: number }
  | { type: "done"; blob: Blob }
  | { type: "error"; message: string }
```

### Image Editor shared types (app/developer/image-editor/_components/image-editor.tsx)

```typescript
type EditorTool = "background" | "crop" | "stitch"

type SourceImage = {
  id: string
  blob: Blob
  url: string
  name: string
  naturalWidth: number
  naturalHeight: number
}

type BackgroundRemovalResult = {
  blob: Blob
  url: string
}

type SharedEditorImage = {
  blob: Blob
  key: number
  name: string
  originTool: EditorTool
  url: string
}

type ToolItem = {
  id: EditorTool
  name: string
  shortName: string
  description: string
  icon: LucideIcon
}

type CanvasDropProps = {
  isDragOver: boolean
  overlayLabel: string
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

type ImageEditorProps = {
  infoContent: React.ReactNode
}
```

### Upload Zone types (app/developer/image-editor/_components/upload-zone.tsx)

```typescript
type UploadZoneProps = {
  isDragOver: boolean
  multiple?: boolean
  onClick: () => void
  onDrop: (event: React.DragEvent) => void
  onDragOver: (event: React.DragEvent) => void
  onDragLeave: (event: React.DragEvent) => void
}
```

### Download format types (app/developer/image-editor/_components/download-format-selector.tsx)

```typescript
type DownloadFormat = "png" | "jpeg" | "webp"
```

### Image Cropper types (app/developer/image-editor/_components/image-cropper/types.ts)

```typescript
type CropRect = {
  x: number
  y: number
  width: number
  height: number
}

type AnchorMode = "center" | "edge"

type AspectRatioPreset = "free" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "21:9" | "2:1" | "custom"

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

type ImageCropperProps = EditorToolProps
```

### JSON Viewer types (app/developer/json-viewer/_components/json-viewer.tsx)

```typescript
type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
```

### LLM Usage types (app/developer/llm-usage/_components/types.ts)

```typescript
type Model = {
  id: string
  name: string
  created: number
  context_length: number
  pricing: {
    prompt: string
    completion: string
    input_cache_read: string
  }
  architecture: {
    input_modalities: string[]
    output_modalities: string[]
  }
  top_provider: {
    max_completion_tokens: number | null
  }
}

type ProviderGroup = {
  provider: string
  models: Model[]
}

type SortKey = "name" | "prompt" | "completion" | "context_length" | "created"
type SortDirection = "asc" | "desc"
type ReleaseFilter = "all" | "7d" | "30d" | "90d" | "1y"
```

### Screenshot Stitcher types (app/developer/image-editor/_components/image-stitch/types.ts)

```typescript
type ImageItem = {
  id: string
  file: File
  originalUrl: string
  element: HTMLImageElement
  naturalWidth: number
  naturalHeight: number
}

type StackDirection = "horizontal" | "vertical"

type StitchedImage = {
  url: string
  fileName: string
  width: number
  height: number
  blob: Blob
}

type ScreenshotStitcherProps = EditorToolProps
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

type FetchResult = { ok: true; data: OgData } | { ok: false; error: string }
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
| `--color-dev-syntax-punctuation` | #adbac7 | JSON punctuation |
