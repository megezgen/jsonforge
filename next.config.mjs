const isDev = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
const config = {
  // `next dev` and `next build` get separate cache folders so they never corrupt each other.
  distDir: isDev ? ".next-dev" : ".next",
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
