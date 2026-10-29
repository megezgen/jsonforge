import Link from "next/link";
import { Braces, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { PAGES, SITE_NAME } from "@/lib/site";

const NAV = PAGES.filter((p) => ["", "json-validator", "json-to-typescript", "json-diff"].includes(p.slug));
const SHORT: Record<string, string> = {
  "": "Viewer",
  "json-validator": "Validator",
  "json-to-typescript": "JSON to TS",
  "json-diff": "Diff",
};

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-panel">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accentfg">
            <Braces className="size-4" />
          </span>
          {SITE_NAME}
        </Link>
        <nav aria-label="Tools" className="flex items-center gap-1 text-sm">
          {NAV.map((p) => (
            <Link key={p.slug} href={p.slug ? `/${p.slug}/` : "/"} className="rounded-md px-2.5 py-1 text-muted transition-colors hover:bg-panel2 hover:text-fg">
              {SHORT[p.slug]}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-ok/40 bg-ok/10 px-3 py-1 text-xs font-medium text-ok">
            <ShieldCheck className="size-3.5" />
            <span aria-hidden>🔒</span> 100% Client-Side: your data is never sent to a server
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
