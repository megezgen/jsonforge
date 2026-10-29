# Contributing to JSON Forge

Thanks for helping. Bug reports, feature ideas and pull requests are welcome.

## Reporting a bug

Open an issue with:

- the page you used (for example `/json-to-typescript/`),
- a minimal JSON input that reproduces the problem (remove anything sensitive),
- what you expected and what happened, plus your browser and version.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run build && npm run test:e2e
```

On Windows PowerShell use `npm.cmd` if script execution is disabled.

## Guidelines

- Everything must stay client-side. Do not add code that sends user JSON to a server or a third-party service.
- Keep heavy work in the Web Worker (`src/workers`, `src/lib/engine.ts`), not on the main thread.
- Do not keep large documents in React state; the editor owns the text (see `src/lib/editor-bridge.ts`).
- New tool pages are added as entries in `PAGES` in `src/lib/site.ts`. Write original content for every page and avoid copying text between pages.
- Add or update an end-to-end test in `e2e/` for user-visible changes.

## License

By contributing you agree that your contributions are licensed under the MIT License.
