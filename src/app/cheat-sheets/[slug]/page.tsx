import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InfoPage } from "@/components/info-page";
import { CHEAT_SHEETS, cheatSheetBySlug } from "@/lib/cheat-sheets";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return CHEAT_SHEETS.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sheet = cheatSheetBySlug(slug);
  if (!sheet) return {};
  const canonical = `${SITE_URL}/cheat-sheets/${slug}/`;
  return {
    title: { absolute: sheet.title },
    description: sheet.description,
    alternates: { canonical },
    openGraph: { title: sheet.title, description: sheet.description, url: canonical },
  };
}

export default async function CheatSheetRoute({ params }: Props) {
  const { slug } = await params;
  const sheet = cheatSheetBySlug(slug);
  if (!sheet) notFound();
  const ld = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: sheet.title,
    description: sheet.description,
    url: `${SITE_URL}/cheat-sheets/${sheet.slug}/`,
    datePublished: "2026-10-30",
    author: { "@type": "Organization", name: SITE_NAME },
  };
  return (
    <InfoPage title={sheet.h1}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <p>{sheet.intro}</p>
      {sheet.tables.map((t) => (
        <section key={t.h}>
          <h2>{t.h}</h2>
          {t.note && <p>{t.note}</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  {t.head.map((h) => (
                    <th key={h} className="py-2 pr-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r) => (
                  <tr key={r[0] + r[2]} className="border-b border-line/60 align-top">
                    <td className="py-2 pr-4">
                      <code>{r[0]}</code>
                    </td>
                    <td className="py-2 pr-4">{r[1]}</td>
                    <td className="py-2">
                      <code>{r[2]}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <h2>Good to know</h2>
      <ul>
        {sheet.tips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p>
        <Link href={sheet.tool.href}>{sheet.tool.label}</Link> · <Link href="/cheat-sheets/">All cheat sheets</Link> · <Link href="/json-examples/">JSON examples</Link>
      </p>
    </InfoPage>
  );
}
