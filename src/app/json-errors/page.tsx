import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { ERROR_PAGES } from "@/lib/error-pages";
import { SITE_URL } from "@/lib/site";

const TITLE = "Common JSON Errors and How to Fix Them";
const DESCRIPTION = "Plain-language fixes for the JSON.parse errors developers meet most: unexpected token, unexpected end of input, trailing commas, bad escapes and more.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | JSON Forge` },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/json-errors/` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/json-errors/` },
};

export default function JsonErrors() {
  return (
    <InfoPage title={TITLE}>
      <p>
        When JSON.parse fails, the message tells you where the parser gave up but not why. Each page below explains one error, lists its usual causes with broken and
        valid examples, and opens the tool with JSON that reproduces it so you can see exactly where it breaks. Messages are shown as Chrome, Edge and Node.js
        print them.
      </p>
      <ul>
        {ERROR_PAGES.map((p) => (
          <li key={p.slug}>
            <Link href={`/json-errors/${p.slug}/`}>{p.h1}</Link>
            <br />
            <span className="text-sm text-muted">{p.description}</span>
          </li>
        ))}
      </ul>
      <h2>Not sure which error you have?</h2>
      <p>
        Paste your text into the <Link href="/json-validator/">JSON Validator</Link>. It shows the line and column of the first problem, and Fix JSON repairs the
        common mistakes automatically.
      </p>
    </InfoPage>
  );
}
