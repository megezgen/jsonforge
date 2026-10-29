import type { Metadata } from "next";
import { ToolPageView } from "@/components/tool-page";
import { PAGES, pageUrl } from "@/lib/site";

const page = PAGES.find((p) => p.slug === "")!;

export const metadata: Metadata = {
  title: { absolute: page.title },
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: pageUrl("") },
  openGraph: { title: page.title, description: page.description, url: pageUrl("") },
};

export default function Home() {
  return <ToolPageView page={page} />;
}
