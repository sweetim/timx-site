# timx-site

Personal portfolio and developer tools site built with Next.js App Router.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npx biome check .` — run Biome formatter + linter
- `npx biome check --write .` — auto-fix Biome issues
- `npm run storybook` — start Storybook (port 6006)
- `npm run build-storybook` — build Storybook static

## Tech Stack

- Next.js 16 (App Router only — no `pages/` directory)
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4 (CSS-first config via `@theme {}` in `app/globals.css`, no `tailwind.config.*`)
- Biome — formatter + linter (primary)
- ESLint — secondary, for Next.js core-web-vitals rules
- Storybook 10 (configured but not yet scaffolded — no `.storybook/` or stories)

## Formatting Rules

Configured in `biome.json`. Key settings:

- 2-space indent, spaces (no tabs)
- Double quotes
- No semicolons (as needed)
- Multiline JSX attributes
- Operator linebreak before

## TypeScript Rules

- Use `type` instead of `interface` for all type definitions
- Path alias: `@/*` maps to `./*`
- Use `ts-pattern@5` for pattern matching and exhaustive type handling
- No abbreviations — use full names

## Architecture

### App Router Structure

```
app/
  layout.tsx              # Root layout (server component)
  page.tsx                # Home page /
  _components/            # Shared components (underscore prefix = excluded from routing)
  developer/
    layout.tsx            # Developer section layout
    page.tsx              # Developer tools index /developer
    _components/          # Developer-specific shared components
      background-remover/ # Feature module (self-contained)
      nav-bar.tsx
      json-viewer.tsx
    _lib/
      tools.ts            # Tool registry (single source of truth)
    background-remover/   # Route: /developer/background-remover
    json-viewer/          # Route: /developer/json-viewer
```

### Component Patterns

- **Server components by default** — pages and presentational components stay server-side
- **`"use client"` only when needed** — for state, effects, browser APIs, or hooks
- **Thin server-component pages** — route pages export metadata and delegate to client components
- **Co-located components** — use `_components/` (underscore prefix) next to routes
- **Self-contained feature modules** — complex features (e.g., background-remover) have their own `types.ts`, `constants.ts`, `utils.ts`, and sub-components

### Adding a New Developer Tool

1. Create route directory: `app/developer/<tool-name>/page.tsx` (server component, exports metadata)
2. Create component in `app/developer/_components/<tool-name>/` (client component)
3. Add entry to `app/developer/_lib/tools.ts` registry

### Key Libraries

- `lucide-react` — icons (required for all icons)
- `classnames` — conditional CSS class composition (no custom `cn` helper)
- `ts-pattern@5` — pattern matching with `.exhaustive()`
- `@imgly/background-removal` — client-side AI processing (dynamically imported)

### State Management

- React built-in hooks only (`useState`, `useRef`, `useCallback`, `useMemo`, `useEffect`)
- No external state management libraries

## Color Theme — Developer Pages

All pages under `app/developer/` use the **GitHub Soft Dark** (`dark-dimmed`) color tokens from `app/globals.css` under the `dev-` namespace.

- Always use `dev-` prefixed Tailwind classes (e.g. `bg-dev-canvas`, `text-dev-text`)
- Never use arbitrary hex values (e.g. `bg-[#22272e]`)
- Never use the "hard dark" GitHub palette

## Coding Rules

- When the API implementation is updated, update `docs/api.md`
- Use discriminated unions with `ts-pattern` `.exhaustive()` for state machines
- Dynamically import heavy dependencies (e.g. `await import("@imgly/background-removal")`)
- Use `biome-ignore` comments for intentional lint suppressions

## Next.js

This is Next.js 16 with breaking changes from earlier versions. APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

## Testing

No test framework is currently configured. There are no test files or test runners.
