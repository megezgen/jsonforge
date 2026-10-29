import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PAGES } from "@/lib/site";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="prose-seo mx-auto min-h-[60vh] max-w-3xl px-4 py-16 text-center">
        <p className="text-6xl font-bold text-accent">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
        <p>The page you are looking for does not exist. Try one of our tools:</p>
        <ul className="!list-none !ml-0">
          {PAGES.map((p) => (
            <li key={p.slug}>
              <Link href={p.slug ? `/${p.slug}/` : "/"}>{p.h1}</Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
