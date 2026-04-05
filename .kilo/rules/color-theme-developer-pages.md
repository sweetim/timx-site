# Color Theme — Developer Pages

All pages under `app/developer/` must use the **GitHub Soft Dark** (`dark-dimmed`)
color tokens defined in `app/globals.css` under the `dev-` namespace.

## Token Map

### Backgrounds

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `bg-canvas` | `bg-dev-canvas` | Page background |
| `bg-surface` | `bg-dev-surface` | Cards, panels, elevated surfaces |
| `bg-inset` | `bg-dev-inset` | Inset areas, code editors |
| `bg-button` | `bg-dev-button` | Button backgrounds |
| `bg-button-hover` | `hover:bg-dev-button-hover` | Button hover state |

### Borders

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `border-default` | `border-dev-border` | Default borders |
| `border-muted` | `border-dev-border-muted` | Subtle / divider borders |

### Text

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `text-primary` | `text-dev-text` | Headings, body text |
| `text-secondary` | `text-dev-text-secondary` | Descriptions, captions, muted text |
| `text-link` | `text-dev-link` | Links, active accents |

### Semantic

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `accent-blue` | `text-dev-accent-blue` | Links, focus rings |
| `accent-green` | `text-dev-accent-green` | Success states |
| `accent-red` | `text-dev-accent-red` | Error / danger states |
| `accent-orange` | `text-dev-accent-orange` | Warnings |
| `accent-purple` | `text-dev-accent-purple` | Special highlights |

### Code Syntax (editor components)

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| `syntax-keyword` | `text-dev-syntax-keyword` | Keywords |
| `syntax-string` | `text-dev-syntax-string` | Strings |
| `syntax-number` | `text-dev-syntax-number` | Numbers |
| `syntax-boolean` | `text-dev-syntax-boolean` | Booleans |
| `syntax-null` | `text-dev-syntax-null` | Null |
| `syntax-property` | `text-dev-syntax-property` | Object keys |
| `syntax-punctuation` | `text-dev-syntax-punctuation` | Brackets, colons, commas |

## Rules

- Always use the `dev-` prefixed Tailwind classes from this table
  (e.g. `bg-dev-canvas`, `text-dev-text`).
- Never use arbitrary hex values for developer page colors
  (e.g. `bg-[#22272e]`).
- Never use the "hard dark" GitHub palette (`#0d1117`, `#161b22`, `#21262d`,
  `#30363d`, `#484f58`, `#e6edf3`, `#c9d1d9`, `#8b949e`, `#58a6ff`, `#f85149`).
- When adding new developer pages, follow the same color tokens for consistency.
