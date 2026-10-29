// Copies the Monaco runtime into /public so the editor never loads from a CDN
// (keeps the app 100% client-side, offline-capable and privacy friendly).
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const src = join("node_modules", "monaco-editor", "min", "vs");
const dest = join("public", "monaco", "vs");
if (!existsSync(src)) process.exit(0);
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
const skip = [join("language", "css"), join("language", "html"), join("language", "typescript")];
cpSync(src, dest, {
  recursive: true,
  filter: (p) => !skip.some((s) => p.endsWith(s) || p.includes(s + "\\") || p.includes(s + "/")),
});
console.log("Monaco copied to", dest);
