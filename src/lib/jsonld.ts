import { SOCIAL_IMAGE } from "./seo";
import { REPO_URL, SITE_NAME, SITE_URL } from "./site";

export const ORG_ID = `${SITE_URL}/#org`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Update when the content of the article-style pages is reviewed again. */
export const PUBLISHED = "2026-10-30";
export const LAST_REVIEWED = "2026-11-01";

/** One Organization and one WebSite entity for the whole site; pages refer to them by @id. */
export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/icon-512.png`, width: 512, height: 512 },
      sameAs: [REPO_URL],
    },
    { "@type": "WebSite", "@id": WEBSITE_ID, url: `${SITE_URL}/`, name: SITE_NAME, inLanguage: "en", publisher: { "@id": ORG_ID } },
  ],
};

export function articleLd({ headline, description, url }: { headline: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    datePublished: PUBLISHED,
    dateModified: LAST_REVIEWED,
    inLanguage: "en",
    image: SOCIAL_IMAGE,
  };
}

/** Items are [name, absolute url] pairs, starting with the home page. */
export function breadcrumbLd(items: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
  };
}

export function collectionLd({ name, url, description }: { name: string; url: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function aboutLd(url: string) {
  return { "@context": "https://schema.org", "@type": "AboutPage", name: `About ${SITE_NAME}`, url, mainEntity: { "@id": ORG_ID }, isPartOf: { "@id": WEBSITE_ID }, inLanguage: "en" };
}

/** Serialises JSON-LD safely for a script tag. */
export const ldHtml = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
