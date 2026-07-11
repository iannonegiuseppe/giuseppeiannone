// Single base URL for canonicals, hreflang, sitemap, and JSON-LD — never
// hardcode a host anywhere else. Falls back through: the real production
// domain (set at launch) -> the current Vercel deployment's own URL
// (correct for previews: canonical should point at itself) -> localhost.
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

// True only on an actual production deployment with a real site URL
// configured — covers "local dev" and "preview deployment" identically
// (both non-production) without needing a separate toggle.
//
// This does NOT cover the hard "any *.vercel.app host is always noindex"
// rule: that includes the production deployment's OWN auto-assigned
// vercel.app alias (VERCEL_ENV is "production" there too), which can only
// be distinguished by the actual request hostname — and reading that here
// would force every page dynamic, defeating static generation. That rule
// is enforced separately, per-request, via an X-Robots-Tag response
// header injected in src/proxy.ts, which runs for every request
// regardless of the page's static/ISR status.
export function isProductionDeployment(): boolean {
  return (
    process.env.VERCEL_ENV === "production" &&
    Boolean(process.env.NEXT_PUBLIC_SITE_URL)
  );
}

// Per-document seo.noIndex always wins over the environment check.
export function resolveRobots(noIndex?: boolean) {
  if (noIndex) {
    return { index: false, follow: false };
  }

  const shouldIndex = isProductionDeployment();
  return { index: shouldIndex, follow: shouldIndex };
}
