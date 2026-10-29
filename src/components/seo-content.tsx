import Link from "next/link";
import { AdSlot } from "./ad-slot";
import { PAGES, SITE_NAME, pageUrl, type ToolPage } from "@/lib/site";

const EXAMPLE = `{
  "name": "Ada",
  "age": 36,
  "admin": true,
  "skills": ["math", "code"],
  "address": { "city": "London" },
  "manager": null
}`;

export function SeoContent({ page }: { page: ToolPage }) {
  const related = PAGES.filter((p) => p.slug !== page.slug);
  return (
    <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article className="prose-seo min-w-0">
        <h2 className="!mt-0">{page.howTo.title}</h2>
        <ol>
          {page.howTo.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>

        {page.sections?.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}

        <h2>What is JSON?</h2>
        <p>
          JSON (JavaScript Object Notation) is a lightweight, text-based data format that is easy for people to read and for machines to parse. It is the
          de facto standard for web APIs, configuration files and data exchange between services. A JSON document is built from just six value types:
          objects, arrays, strings, numbers, booleans and <code>null</code>.
        </p>
        <pre>
          <code>{EXAMPLE}</code>
        </pre>
        <p>
          JSON is stricter than JavaScript object literals: keys and strings must use double quotes, trailing commas are not allowed and comments are not
          part of the specification (RFC 8259).
        </p>

        <h2>Why format JSON?</h2>
        <p>
          APIs usually return minified JSON on a single line, which is efficient for machines but unreadable for people. Formatting (also called pretty
          printing or beautifying) adds consistent indentation and line breaks so that you can scan the structure, spot mistakes and review changes.
          Minifying does the opposite and strips whitespace to reduce size.
        </p>

        <h2>Frequently asked questions</h2>
        {page.faq.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}

        <h2>More JSON tools</h2>
        <ul>
          {related.map((p) => (
            <li key={p.slug}>
              <Link href={p.slug ? `/${p.slug}/` : "/"}>{p.h1}</Link>
            </li>
          ))}
        </ul>
      </article>
      <aside className="lg:sticky lg:top-4 lg:self-start" aria-label="Sidebar">
        <AdSlot size="rectangle" />
      </aside>
    </div>
  );
}

/** schema.org structured data: the web app, its FAQ and breadcrumbs. */
export function JsonLd({ page }: { page: ToolPage }) {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `${SITE_NAME} - ${page.h1}`,
      url: pageUrl(page.slug),
      description: page.description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any (runs in the browser)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: page.howTo.title,
      step: page.howTo.steps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: pageUrl("") },
        ...(page.slug ? [{ "@type": "ListItem", position: 2, name: page.h1, item: pageUrl(page.slug) }] : []),
      ],
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
