import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { CONTACT_EMAIL } from "@/lib/site";

export function InfoPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="prose-seo mx-auto min-h-[60vh] max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">{title}</h1>
        {updated && <p className="text-sm text-muted">Last updated: {updated}</p>}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

export function ContactLine() {
  return CONTACT_EMAIL ? (
    <p>
      Contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    </p>
  ) : null;
}
