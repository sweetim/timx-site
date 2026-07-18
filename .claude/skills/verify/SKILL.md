---
name: verify
description: Build/launch/drive recipe for verifying changes to this Next.js site in a real browser.
---

# Verifying timx-site changes

## Launch

A dev server is often already running on port 3000 (check `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`). Next.js refuses a second `next dev` in the same dir — reuse the running one (Turbopack hot-reloads the working tree) instead of starting another.

Otherwise: `bun run dev` (port 3000).

## Drive (browser)

Playwright is not a repo dependency. Playwright browser builds are cached in `~/.cache/ms-playwright` (chromium-1228 as of 2026-07). Install the matching `playwright` npm package in the session scratchpad (not the repo), then run scripts with:

```bash
cd <scratchpad> && bun add playwright@latest
PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright bun <script>.mjs
```

If the installed playwright wants a browser build not in the cache, `bunx playwright install chromium --dry-run` shows which build it expects — pick a playwright version matching the cache rather than downloading.

## Gotchas

- Tool pages like `/developer/image-editor` mount all tool panels at once and hide inactive ones with CSS — plain `.first()` locators grab hidden nodes. Filter with `.locator("visible=true")`.
- Hidden `<input type="file">` everywhere: click the visible upload zone and catch the `filechooser` event instead of `setInputFiles` on a guessed input.
- Generate test images in-browser (about:blank + canvas → `toDataURL` → write file) rather than shipping fixtures.
- Collect `console`/`pageerror` events for the whole run; the app is client-heavy and errors there don't fail navigation.
