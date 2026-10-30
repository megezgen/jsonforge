import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExamplePageView } from "@/components/example-page-view";
import { EXAMPLES, exampleBySlug } from "@/lib/examples";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return EXAMPLES.map((e) => ({ slug: e.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = exampleBySlug(slug);
  if (!page) return {};
  const canonical = `${SITE_URL}/json-examples/${slug}/`;
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical },
    openGraph: { title: page.title, description: page.description, url: canonical },
  };
}

export default async function ExampleRoute({ params }: Props) {
  const { slug } = await params;
  const page = exampleBySlug(slug);
  if (!page) notFound();
  return <ExamplePageView page={page} />;
}
