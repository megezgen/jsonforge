import Link from "next/link";
import { JsonTool } from "./json-tool";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { EXAMPLES, exampleBySlug, exampleJson, type ExamplePage } from "@/lib/examples";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const CONVERT = [
  ["/json-to-typescript/", "TypeScript"],
  ["/json-to-zod/", "Zod"],
  ["/json-to-python/", "Python (Pydantic)"],
  ["/json-to-go/", "Go"],
  ["/json-to-json-schema/", "JSON Schema"],
  ["/json-to-csv/", "CSV"],
  ["/json-to-yaml/", "YAML"],
  ["/json-to-xml/", "XML"],
] as const;

export function ExampleJsonLd({ page }: { page: ExamplePage }) {
  const url = `${SITE_URL}/json-examples/${page.slug}/`;
  const data = [
    { "@context": "https://schema.org", "@type": "TechArticle", headline: page.title, description: page.description, url, datePublished: "2026-10-30", author: { "@type": "Organization", name: SITE_NAME } },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "JSON examples", item: `${SITE_URL}/json-examples/` },
        { "@type": "ListItem", position: 3, name: page.h1, item: url },
      ],
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function ExamplePageView({ page }: { page: ExamplePage }) {
  const related = page.related.map(exampleBySlug).filter((e): e is ExamplePage => !!e);
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-[1600px] px-4 py-2 text-center">
        <p className="text-xs text-muted">
          <Link href="/json-examples/" className="underline">
            JSON examples
          </Link>
        </p>
        <h1 className="text-base font-semibold sm:text-lg">{page.h1}</h1>
        <p className="mx-auto max-w-3xl text-xs text-muted">{page.intro}</p>
      </div>
      <main>
        <JsonTool initialTab="tree" sample={{ json: exampleJson(page) }} />
        <article className="prose-seo mx-auto max-w-3xl px-4 py-10">
          <h2 className="!mt-0">The example</h2>
          <p>
            The JSON above is the example. Explore it in the Tree tab, press Download to save it as a .json file, or Share to send someone a link to it. All names, ids, emails and values are invented.
          </p>

          <h2>Fields explained</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 pr-4 font-medium">Path</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {page.fields.map((f) => (
                  <tr key={f.path} className="border-b border-line/60 align-top">
                    <td className="py-2 pr-4">
                      <code>{f.path}</code>
                    </td>
                    <td className="py-2 pr-4">{f.type}</td>
                    <td className="py-2">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Read it in code</h2>
          <p>JavaScript:</p>
          <pre>
            <code>{page.js}</code>
          </pre>
          <p>Python:</p>
          <pre>
            <code>{page.py}</code>
          </pre>

          <h2>What this example is good for</h2>
          <ul>
            {page.uses.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>

          <h2>Tips</h2>
          <ul>
            {page.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <h2>Convert this example</h2>
          <p>Open it in a converter, then switch the output in the Code tab:</p>
          <ul>
            {CONVERT.map(([href, label]) => (
              <li key={href}>
                <Link href={href}>JSON to {label}</Link>
              </li>
            ))}
          </ul>

          {related.length > 0 && (
            <>
              <h2>More examples</h2>
              <ul>
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/json-examples/${r.slug}/`}>{r.h1}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p>
            <Link href="/json-examples/">All JSON examples</Link> · <Link href="/cheat-sheets/">Cheat sheets</Link>
          </p>
        </article>
      </main>
      <SiteFooter />
      <ExampleJsonLd page={page} />
    </>
  );
}

export const allExamples = EXAMPLES;
