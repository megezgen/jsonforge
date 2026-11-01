import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";

/** The generated 1200x630 card from src/app/opengraph-image.tsx. */
export const SOCIAL_IMAGE = `${SITE_URL}/opengraph-image`;

/**
 * Open Graph and Twitter card metadata for a page. A page that sets its own `openGraph` replaces the
 * parent's, which silently drops the share image, so every page builds its social metadata here.
 */
export function socialMeta({ title, description, url }: { title: string; description: string; url: string }): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME}: JSON Viewer, Formatter & Converter` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [SOCIAL_IMAGE] },
  };
}
