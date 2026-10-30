import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorPageView } from "@/components/error-page-view";
import { ERROR_PAGES, errorPageBySlug } from "@/lib/error-pages";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ERROR_PAGES.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = errorPageBySlug(slug);
  if (!page) return {};
  const canonical = `${SITE_URL}/json-errors/${slug}/`;
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical },
    openGraph: { title: page.title, description: page.description, url: canonical },
  };
}

export default async function ErrorRoute({ params }: Props) {
  const { slug } = await params;
  const page = errorPageBySlug(slug);
  if (!page) notFound();
  return <ErrorPageView page={page} />;
}
