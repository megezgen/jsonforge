import Link from "next/link";
import { JsonTool } from "./json-tool";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ERROR_PAGES, LOCATE_STEPS, errorPageBySlug, type ErrorPage } from "@/lib/error-pages";
import { hintForSlug } from "@/lib/error-hints";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { articleLd, breadcrumbLd, ldHtml } from "@/lib/jsonld";

const url = (slug: string) => `${SITE_URL}/json-errors/${slug}/`;

export function ErrorPageJsonLd({ page }: { page: ErrorPage }) {
  const data = [
    articleLd({ headline: page.title, description: page.description, url: url(page.slug) }),
    breadcrumbLd([
      [SITE_NAME, `${SITE_URL}/`],
      ["JSON errors", `${SITE_URL}/json-errors/`],
      [page.h1, url(page.slug)],
    ]),
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={ldHtml(data)} />;
}

export function ErrorPageView({ page }: { page: ErrorPage }) {
  const repairable = hintForSlug(page.slug)?.repairable !== false;
  const related = page.related.map(errorPageBySlug).filter((p): p is ErrorPage => !!p);
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-[1600px] px-4 py-2 text-center">
        <p className="text-xs text-muted">
          <Link href="/json-errors/" className="underline">
            JSON errors
          </Link>
        </p>
        <h1 className="text-base font-semibold sm:text-lg">{page.h1}</h1>
        <p className="mx-auto mt-1 max-w-3xl text-sm text-fg">{page.answer}</p>
        <p className="mx-auto max-w-3xl text-xs text-muted">
          {repairable
            ? "The JSON below reproduces this error. See where it breaks, press Fix JSON, or paste your own text."
            : "The text below reproduces this error. It is not damaged JSON, so Fix JSON cannot repair it: the cause is where the text comes from. Read the causes below, or paste your own text."}
        </p>
      </div>
      <main>
        <JsonTool initialTab="tree" sample={{ json: page.sample }} />
        <article className="prose-seo mx-auto max-w-3xl px-4 py-10">
          <h2 className="!mt-0">What the error means</h2>
          <p>{page.summary}</p>
          <p>The message looks like this in Chrome, Edge and Node.js (Firefox and Safari use different wording for the same problems):</p>
          <pre>
            <code>{page.messages.join("\n")}</code>
          </pre>
          <p>Python&apos;s json module reports the same problems with different wording (checked on Python 3.12):</p>
          <pre>
            <code>{page.python.join("\n")}</code>
          </pre>

          <h2>Common causes</h2>
          {page.causes.map((c) => (
            <section key={c.t}>
              <h3>{c.t}</h3>
              <p>{c.p}</p>
              {(c.bad !== undefined || c.good !== undefined) && (
                <pre>
                  <code>
                    {c.bad !== undefined && `Broken:  ${c.bad === "" ? "(empty text)" : c.bad}`}
                    {c.bad !== undefined && c.good !== undefined && "\n"}
                    {c.good !== undefined && `Valid:   ${c.good}`}
                  </code>
                </pre>
              )}
            </section>
          ))}

          <h2>How to find the problem</h2>
          <ol>
            {LOCATE_STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>

          <h2>{page.code.label}</h2>
          <pre>
            <code>{page.code.text}</code>
          </pre>

          <h2>Frequently asked questions</h2>
          {page.faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}

          {related.length > 0 && (
            <>
              <h2>Related errors</h2>
              <ul>
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/json-errors/${r.slug}/`}>{r.h1}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p>
            <Link href="/json-errors/">All common JSON errors</Link> · <Link href="/json-validator/">JSON Validator</Link>
          </p>
        </article>
      </main>
      <SiteFooter />
      <ErrorPageJsonLd page={page} />
    </>
  );
}

export function allErrorPages() {
  return ERROR_PAGES;
}
