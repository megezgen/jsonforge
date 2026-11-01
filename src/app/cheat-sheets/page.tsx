import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { CHEAT_SHEETS } from "@/lib/cheat-sheets";
import { SITE_URL } from "@/lib/site";
import { socialMeta } from "@/lib/seo";
import { breadcrumbLd, collectionLd, ldHtml } from "@/lib/jsonld";
import { SITE_NAME } from "@/lib/site";

const TITLE = "JSON Cheat Sheets";
const DESCRIPTION = "One-page, printable JSON cheat sheets: syntax and escapes, JSONPath operators and filters, and JSON Schema keywords for every type.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE}: Syntax, JSONPath, JSON Schema` },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/cheat-sheets/` },
  ...socialMeta({ title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/cheat-sheets/` }),
};

export default function CheatSheets() {
  return (
    <InfoPage title={TITLE}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldHtml([
          collectionLd({ name: TITLE, url: `${SITE_URL}/cheat-sheets/`, description: DESCRIPTION }),
          breadcrumbLd([
            [SITE_NAME, `${SITE_URL}/`],
            ["Cheat sheets", `${SITE_URL}/cheat-sheets/`],
          ]),
        ])}
      />
      <p>Short references you can keep open while you work. Each one prints cleanly on a single page.</p>
      <ul>
        {CHEAT_SHEETS.map((c) => (
          <li key={c.slug}>
            <Link href={`/cheat-sheets/${c.slug}/`}>{c.h1}</Link>
            <br />
            <span className="text-sm text-muted">{c.description}</span>
          </li>
        ))}
      </ul>
    </InfoPage>
  );
}
