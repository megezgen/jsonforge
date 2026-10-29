import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageView } from "@/components/tool-page";
import { PAGES, pageUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return PAGES.filter((p) => p.slug).map((p) => ({ tool: p.slug }));
}

type Props = { params: Promise<{ tool: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const page = PAGES.find((p) => p.slug === tool);
  if (!page) return {};
  return {
    title: { absolute: page.title },
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: pageUrl(page.slug) },
    openGraph: { title: page.title, description: page.description, url: pageUrl(page.slug) },
  };
}

export default async function ToolRoute({ params }: Props) {
  const { tool } = await params;
  const page = PAGES.find((p) => p.slug === tool);
  if (!page) notFound();
  return <ToolPageView page={page} />;
}
