import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin the workspace root: sibling directories outside this project contain
  // their own lockfiles, which would otherwise make Next.js infer the wrong root.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // The current seed image is an SVG placeholder — Next.js blocks SVG
    // optimization by default (an SVG can carry a <script>). Safe here
    // because every asset comes from an editor publishing through Studio,
    // not from public uploads; the strict CSP below still blocks scripts
    // in case an SVG asset ever slips through with one.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
