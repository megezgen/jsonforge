import type { MetadataRoute } from "next";
import { INFO_PAGES, PAGES, SITE_URL, pageUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = PAGES.map((p) => ({
    url: pageUrl(p.slug),
    changeFrequency: "monthly" as const,
    priority: p.slug === "" ? 1 : 0.8,
  }));
  const info = INFO_PAGES.map((p) => ({ url: `${SITE_URL}/${p.slug}/`, changeFrequency: "yearly" as const, priority: 0.3 }));
  return [...tools, ...info];
}
