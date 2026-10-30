// Builds public/sw.js from the template and a precache list (the Monaco core and icons),
// so the editor works offline after the first visit. Runs automatically before `next build`.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join("public", "monaco", "vs");
if (!existsSync(root)) {
  console.log("gen-sw: public/monaco missing, run scripts/copy-monaco.mjs first");
  process.exit(0);
}

// Files Monaco requests for the editor, JSON mode, workers and the languages used by the Code tab.
const CORE = [
  /^loader\.js$/,
  /^editor\/editor\.main\.(js|css)$/,
  /^(editor|editorWorkerHost|index|main|workers|toggleHighContrast|lspLanguageFeatures|jsonMode|tsMode)-[\w-]+\.js$/,
  /^monaco\.contribution-[\w-]+\.js$/,
  /^basic-languages\/monaco\.contribution\.js$/,
  /^nls\.messages-loader\.js$/,
  // The TypeScript, CSS and HTML workers are large and only needed for the Code tab's TypeScript/Zod view;
  // they are cached at runtime the first time they are used instead of being precached.
  /^json\.worker-[\w-]+\.js$/,
  /^assets\/(editor|json)\.worker-[\w-]+\.js$/,
  /^(go|java|python|rust|xml|yaml|typescript)-[\w-]+\.js$/,
];

function walk(dir, base = "") {
  const out = [];
  for (const name of readdirSync(join(dir, base))) {
    const rel = base ? `${base}/${name}` : name;
    if (statSync(join(dir, rel)).isDirectory()) out.push(...walk(dir, rel));
    else out.push(rel);
  }
  return out;
}

const monaco = walk(root)
  .filter((rel) => CORE.some((re) => re.test(rel)))
  .map((rel) => `/monaco/vs/${rel}`)
  .sort();

const urls = ["/", "/icons/icon-192.png", "/icons/icon-512.png", ...monaco];
const bytes = monaco.reduce((n, u) => n + statSync(join("public", u)).size, 0);
const template = readFileSync(join("scripts", "sw.template.js"), "utf8");
// The version changes whenever the file list or the worker logic changes, so old caches get replaced.
const version = createHash("sha1").update(urls.join("\n")).update(template).digest("hex").slice(0, 10);
writeFileSync(join("public", "sw.js"), template.replace("__VERSION__", version).replace("__PRECACHE__", JSON.stringify(urls, null, 2)));
console.log(`gen-sw: ${urls.length} URLs precached (Monaco ${(bytes / 1024 / 1024).toFixed(1)} MB), version ${version}`);
