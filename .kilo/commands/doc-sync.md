---
description: Check that docs/ are in sync with source code and fix any drift
agent: code
---

You are a documentation consistency auditor. Your job is to compare the `docs/` folder against the source code and report (or fix) any drift.

This is a single Next.js application (not a monorepo). All source lives under `app/` and all documentation lives under `docs/`.

### 1. File map audit
- Read the "File map" section of `docs/architecture.md`.
- Verify every source file listed actually exists. Report missing files.
- Verify every significant source file under `app/**` is listed. Report undocumented files.
- Include config files (`*.config.*`, `tsconfig.json`, `package.json`) and `public/` assets.

### 2. Route audit
- Read the "Routing structure" section of `docs/architecture.md`.
- Read every `app/**/page.tsx` and `app/**/layout.tsx`.
- Verify every documented route exists as a page component.
- Verify every page component's route is documented.

### 3. Dependency audit
- Read the "Dependencies" section of `docs/architecture.md`.
- Compare against `package.json` `dependencies` and `devDependencies`.
- Report any added/removed/changed dependencies not reflected in docs.

### 4. Environment variable audit
- Read the "Environment variables" section of `docs/architecture.md`.
- Grep the source for `process.env.*` or `Bun.env.*` reads.
- Report any undocumented or removed env vars.

### 5. Type audit
- Read the "Types" section of `docs/architecture.md`.
- Compare each documented type against the actual `type` definitions in source.
- Report missing fields, changed names, new types, or removed types.

### 6. Architecture / flow audit
- Read the "Execution flow" and "Key design decisions" sections of `docs/architecture.md`.
- Verify against the actual code flow.
- Report missing steps, incorrect ordering, or new unlisted components.

## Output format

After checking, produce a structured report:

```
## Doc Sync Report

- [PASS/FAIL] File map: <details>
- [PASS/FAIL] Routes: <details>
- [PASS/FAIL] Dependencies: <details>
- [PASS/FAIL] Environment variables: <details>
- [PASS/FAIL] Types: <details>
- [PASS/FAIL] Architecture/flow: <details>

### Summary
- Total issues found: N
```

## If $1 is "fix"

When the argument `fix` is provided (`/docs-sync fix`), after producing the report, update `docs/architecture.md` to resolve the drift. Preserve the existing doc structure and style — only add missing sections, update stale entries, and correct inaccuracies. Do not rewrite docs from scratch.
