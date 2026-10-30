import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}: JSON Viewer, Formatter & Converter`,
    short_name: SITE_NAME,
    description: "Client-side JSON viewer, formatter, validator and converter. Works offline after the first visit.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#1e1e1e",
    theme_color: "#1e1e1e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
