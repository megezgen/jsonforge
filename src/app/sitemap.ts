import type { MetadataRoute } from "next";
import { ERROR_PAGES } from "@/lib/error-pages";
import { INFO_PAGES, PAGES, SITE_URL, pageUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = PAGES.map((p) => ({
    url: pageUrl(p.slug),
    changeFrequency: "monthly" as const,
    priority: p.slug === "" ? 1 : 0.8,
  }));
  const info = INFO_PAGES.map((p) => ({ url: `${SITE_URL}/${p.slug}/`, changeFrequency: "yearly" as const, priority: 0.3 }));
  const errors = ERROR_PAGES.map((p) => ({ url: `${SITE_URL}/json-errors/${p.slug}/`, changeFrequency: "monthly" as const, priority: 0.7 }));
  return [...tools, ...errors, ...info];
}
