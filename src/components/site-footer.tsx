import Link from "next/link";
import { INFO_PAGES, PAGES, REPO_URL, SITE_NAME, SUPPORT_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-panel px-4 py-8 text-xs text-muted print:hidden">
      <div className="mx-auto grid max-w-[1200px] gap-6 sm:grid-cols-[1fr_auto]">
        <nav aria-label="All tools" className="flex flex-wrap gap-x-4 gap-y-0.5">
          {PAGES.map((p) => (
            <Link key={p.slug} href={p.slug ? `/${p.slug}/` : "/"} className="inline-flex min-h-6 items-center hover:text-fg">
              {p.h1}
            </Link>
          ))}
        </nav>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-0.5">
          {INFO_PAGES.map((p) => (
            <Link key={p.slug} href={`/${p.slug}/`} className="inline-flex min-h-6 items-center hover:text-fg">
              {p.label}
            </Link>
          ))}
          <a href={REPO_URL} rel="noopener" className="inline-flex min-h-6 items-center hover:text-fg">
            GitHub
          </a>
          {SUPPORT_URL && (
            <a href={SUPPORT_URL} rel="noopener" className="inline-flex min-h-6 items-center hover:text-fg">
              Support the project
            </a>
          )}
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-[1200px]">
        © {new Date().getFullYear()} {SITE_NAME}. All processing happens in your browser. No data is uploaded, stored or logged.
      </p>
    </footer>
  );
}
