// Reproducible large-file benchmark against the static export.
//   npm run build && node scripts/benchmark.mjs            (serves ./out itself)
//   BASE_URL=https://jsonforge.dev node scripts/benchmark.mjs
// For each size it types nothing: it loads generated JSON through the same path a user's file takes,
// then measures time to "Valid JSON", time to the first tree rows, and the longest main-thread task.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import os from "node:os";

const SIZES_MB = (process.env.SIZES ?? "1,5,10,25").split(",").map(Number);
const RUNS = Number(process.env.RUNS ?? 3);
const remote = process.env.BASE_URL;
const base = remote ?? "http://localhost:3199";

function makeJson(targetBytes) {
  const rec = (i) => ({
    id: i,
    uuid: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    active: i % 3 !== 0,
    balance: Math.round(((i * 9301 + 49297) % 233280) / 100) / 100,
    address: { city: ["London", "Berlin", "Istanbul", "Tokyo"][i % 4], zip: String(10000 + (i % 89999)) },
    tags: ["alpha", "beta", "gamma"].slice(0, (i % 3) + 1),
    manager: i % 5 === 0 ? null : i - 1,
  });
  const parts = ["{\n  \"records\": [\n"];
  let size = parts[0].length;
  let i = 0;
  while (size < targetBytes) {
    const s = JSON.stringify(rec(i), null, 2).replace(/^/gm, "    ") + ",\n";
    parts.push(s);
    size += s.length;
    i++;
  }
  parts.push(`    ${JSON.stringify(rec(i))}\n  ]\n}\n`);
  return parts.join("");
}

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

let server;
if (!remote) {
  server = spawn("npx", ["serve", "out", "-l", "3199", "--no-clipboard"], { shell: true, stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 4000));
}

const browser = await chromium.launch({ channel: "chrome" });
const results = [];
for (const mb of SIZES_MB) {
  const text = makeJson(mb * 1024 * 1024);
  const parse = [];
  const tree = [];
  const longest = [];
  for (let run = 0; run < RUNS; run++) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(`${base}/`);
    await page.waitForSelector(".monaco-editor");
    await page.getByRole("status").getByText("Valid JSON").waitFor();
    await page.evaluate(() => {
      window.__long = [];
      new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(e.duration))).observe({ entryTypes: ["longtask"] });
    });
    // Use the app's own file-open path so the measurement includes loading the text into the editor.
    const t0 = Date.now();
    await page.setInputFiles('input[type="file"]', { name: "big.json", mimeType: "application/json", buffer: Buffer.from(text) });
    await page.waitForFunction((n) => /Size: [\d.]+ MB/.test(document.querySelector('[role="status"]')?.textContent ?? "") && document.querySelector('[role="status"]').textContent.includes("Valid JSON"), mb, { timeout: 120000 });
    parse.push(Date.now() - t0);
    await page.getByRole("treeitem").first().waitFor();
    tree.push(Date.now() - t0);
    longest.push(await page.evaluate(() => Math.round(Math.max(0, ...window.__long))));
    await ctx.close();
  }
  results.push({ mb, valid_ms: median(parse), tree_ms: median(tree), longest_task_ms: median(longest) });
}
await browser.close();
server?.kill();

console.log(`\nEnvironment: ${os.cpus()[0].model.trim()} x${os.cpus().length}, ${Math.round(os.totalmem() / 2 ** 30)} GB RAM, ${os.platform()} ${os.release()}`);
console.log(`Runs per size: ${RUNS} (median). Target: ${base}\n`);
console.log("size_mb | valid_ms | first_tree_rows_ms | longest_main_thread_task_ms");
for (const r of results) console.log(`${String(r.mb).padStart(7)} | ${String(r.valid_ms).padStart(8)} | ${String(r.tree_ms).padStart(18)} | ${String(r.longest_task_ms).padStart(27)}`);
console.log("\n" + JSON.stringify(results));
