import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { BENCHMARK } from "@/lib/benchmark-data";
import { REPO_URL, SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = "How JSON Forge Opens 25 MB JSON Files: Benchmarks and Method";
const DESCRIPTION =
  "Measured times for opening 1, 5, 10 and 25 MB JSON files in the browser, how the Web Worker and virtualized tree work, what still pauses the page, and a script to reproduce the numbers.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/benchmarks/` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/benchmarks/` },
};

const secs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`);

export default function Benchmarks() {
  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: "2026-10-30",
    author: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/benchmarks/`,
  };
  return (
    <InfoPage title="How JSON Forge opens 25 MB JSON files" updated={BENCHMARK.date}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, "\\u003c") }} />
      <p>
        Most online JSON viewers slow down or freeze on big files. {SITE_NAME} is built to stay usable on them. This page shows measured numbers, how it
        works, and, just as important, what it does <em>not</em> fix yet. Everything here can be reproduced with a script in the{" "}
        <a href={REPO_URL}>open-source repository</a>.
      </p>

      <h2>Results</h2>
      <p>
        Median of {BENCHMARK.runs} runs per size on one machine: {BENCHMARK.machine}, {BENCHMARK.browser}. Run on {BENCHMARK.date} against the static build.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-2 pr-4 font-medium">File size</th>
              <th className="py-2 pr-4 font-medium">Shown as valid</th>
              <th className="py-2 pr-4 font-medium">First tree rows</th>
              <th className="py-2 font-medium">Longest main-thread pause</th>
            </tr>
          </thead>
          <tbody>
            {BENCHMARK.rows.map((r) => (
              <tr key={r.mb} className="border-b border-line/60">
                <td className="py-2 pr-4">{r.mb} MB</td>
                <td className="py-2 pr-4">{secs(r.validMs)}</td>
                <td className="py-2 pr-4">{secs(r.treeMs)}</td>
                <td className="py-2">{secs(r.longestTaskMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        You can try it yourself: open the <Link href="/large-json-viewer/">Large JSON Viewer</Link>, press Load Sample, then Large (about 25 MB).
      </p>

      <h2>What was measured</h2>
      <ul>
        <li>
          <strong>Shown as valid:</strong> from handing the file to the app (the same path as the Open button) until the status bar shows Valid JSON with the
          size, depth and node count. It includes reading the file, loading it into the editor and parsing it.
        </li>
        <li>
          <strong>First tree rows:</strong> until the first rows of the tree view are on screen.
        </li>
        <li>
          <strong>Longest main-thread pause:</strong> the longest long task (over 50 ms) the browser reported on the page&apos;s main thread, using the Long
          Tasks API. While a long task runs the page cannot react to clicks or scrolling.
        </li>
      </ul>
      <p>
        The test files are generated records (ids, names, emails, nested address objects, short tag arrays and some nulls), pretty-printed, about 40 nodes per
        record. A 25 MB file contains roughly one million JSON nodes. Real files differ, and deeply nested or string-heavy documents can behave differently.
      </p>

      <h2>How it stays responsive</h2>
      <ol>
        <li>
          <strong>Parsing in a Web Worker.</strong> The text is parsed, measured and formatted off the main thread. The parsed value stays inside the worker.
        </li>
        <li>
          <strong>A virtualized tree.</strong> The worker flattens only the visible part of the tree into rows, and the page draws just the rows that fit on
          screen, a few dozen DOM nodes, however large the document is. Expanding, collapsing and searching ask the worker for a new list of rows.
        </li>
        <li>
          <strong>The editor owns the text.</strong> The document is not kept in React state, so typing does not copy megabytes on every keystroke.
        </li>
        <li>
          <strong>Caps and lighter modes.</strong> The tree lists at most 250,000 rows at once, and above a few megabytes the editor drops its minimap and
          language services.
        </li>
      </ol>

      <h2>What still pauses the page</h2>
      <p>
        Honest limits: loading the text into the Monaco editor runs on the main thread. In these runs that cost about 60 ms per megabyte, which is why the
        longest pause is about 1.5 seconds at 25 MB. Parsing itself does not block the page, but reading and displaying the text does. We have not tried to hide
        this: for very large files a future version could skip the editor and show a read-only view while the worker does the work.
      </p>
      <p>
        We also have not measured other browsers, phones, or other JSON tools, so this page makes no comparison claims. If you run the script on your own
        hardware, we would like to see the numbers.
      </p>

      <h2>Reproduce it</h2>
      <pre>
        <code>{`git clone ${REPO_URL}.git
cd jsonforge
npm install
npm run build
node scripts/benchmark.mjs            # serves ./out and measures 1, 5, 10 and 25 MB
SIZES=50 RUNS=5 node scripts/benchmark.mjs`}</code>
      </pre>
      <p>
        The script needs Google Chrome installed and prints your hardware next to the results. Set <code>BASE_URL</code> to measure a deployed site instead.
      </p>

      <h2>Tips for working with very large JSON</h2>
      <ul>
        <li>Collapse everything first and expand only the branch you need; search narrows the tree to the paths that match.</li>
        <li>
          Use the <Link href="/jsonpath-tester/">JSONPath tester</Link> to pull out just the values you care about instead of scrolling.
        </li>
        <li>For files above 100 MB, a command-line tool such as jq is a better fit than any browser.</li>
      </ul>
    </InfoPage>
  );
}
