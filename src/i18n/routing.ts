import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["it", "en"],
  defaultLocale: "it",
  localePrefix: "as-needed",
  // URL structure alone decides the locale (no cookie/Accept-Language
  // negotiation): deterministic for SEO/AEO crawlers and static caching.
  localeDetection: false,
});
