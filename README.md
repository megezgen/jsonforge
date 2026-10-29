# JSON Forge

A fast, 100% client-side JSON viewer, formatter, validator, diff and converter. No backend: parsing and conversion run in a Web Worker in the visitor's browser.

- Next.js 15 (App Router, static export), TypeScript strict, Tailwind CSS 4
- Monaco editor (self-hosted, no CDN), virtualized tree via `@tanstack/react-virtual`
- Converters: TypeScript, Go, Python (Pydantic), YAML, CSV, XML
- Statically generated SEO pages per tool, sitemap, robots, JSON-LD, Open Graph image

## Develop

```bash
npm install
npm run dev
```

On Windows PowerShell use `npm.cmd` if script execution is disabled.

## Build and preview

```bash
npm run build      # static site in ./out
npm start          # serves ./out on http://localhost:3000
```

## Configure

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your real domain **before building**, because canonical URLs and the sitemap are generated at build time.

## Deploy (Cloudflare Pages)

1. Push the repo to GitHub and create a Pages project from it.
2. Build command `npm run build`, output directory `out`.
3. Add the environment variables from `.env.example`.
4. Attach your custom domain. `public/_headers` already ships a strict Content-Security-Policy, security headers and long-lived caching for hashed assets. Netlify reads the same file.

If you add an ad network or analytics, extend `script-src`, `img-src`, `connect-src` and `frame-src` in `public/_headers` accordingly, or the scripts will be blocked.

## Adding a tool page

Add an entry to `PAGES` in `src/lib/site.ts`. The route, metadata, structured data, sitemap entry and footer link are generated from it.

## Tests

The Playwright suite runs against the static export in the locally installed Google Chrome (`channel: "chrome"`), so no browser download is needed.

```bash
npm run build
npm run test:e2e
```
