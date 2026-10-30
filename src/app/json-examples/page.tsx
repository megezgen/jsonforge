import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { EXAMPLES } from "@/lib/examples";
import { SITE_URL } from "@/lib/site";

const TITLE = "JSON Examples and Sample Data";
const DESCRIPTION = "Twelve ready-to-use JSON examples: simple, arrays, nested, user profile, paginated API, product catalog, order, blog posts, package.json, GeoJSON, config and weather.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | JSON Forge` },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/json-examples/` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/json-examples/` },
};

export default function JsonExamples() {
  return (
    <InfoPage title={TITLE}>
      <p>
        Sample JSON you can copy, open in the viewer or download. Every example comes with an explanation of its fields, snippets that read it in JavaScript and
        Python, and links to convert it to TypeScript, Python, Go, Zod, JSON Schema, CSV, YAML or XML. All data is invented and safe to use in tests and documentation.
      </p>
      <ul>
        {EXAMPLES.map((e) => (
          <li key={e.slug}>
            <Link href={`/json-examples/${e.slug}/`}>{e.h1}</Link>
            <br />
            <span className="text-sm text-muted">{e.intro}</span>
          </li>
        ))}
      </ul>
      <p>
        Need a quick reference instead? See the <Link href="/cheat-sheets/">JSON cheat sheets</Link>.
      </p>
    </InfoPage>
  );
}
