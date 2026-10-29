import { AdSlot } from "./ad-slot";
import { JsonTool } from "./json-tool";
import { JsonLd, SeoContent } from "./seo-content";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { ToolPage } from "@/lib/site";

export function ToolPageView({ page }: { page: ToolPage }) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-[1600px] px-4 py-2 text-center">
        <h1 className="text-base font-semibold sm:text-lg">{page.h1}</h1>
        <p className="mx-auto max-w-3xl text-xs text-muted">{page.intro}</p>
      </div>
      <AdSlot size="leaderboard" className="mb-2" />
      <main>
        <JsonTool initialTab={page.tab} initialCodeLang={page.lang} initialIndent={page.indent} />
        <SeoContent page={page} />
      </main>
      <SiteFooter />
      <JsonLd page={page} />
    </>
  );
}
