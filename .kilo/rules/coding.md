# Coding Rules

- Use `type` instead of `interface` when defining TypeScript types to ensure
  consistency and avoid unintended interface merging.
- Prefer [`ts-pattern@5`](https://github.com/gvergnaud/ts-pattern) for pattern
  matching and exhaustive type handling whenever possible.
- Don't use abbreviations, always use full names.
- when the API implementation is updated, update the changes to docs/api.md
  file, this file is used by others to implement the endpoints
