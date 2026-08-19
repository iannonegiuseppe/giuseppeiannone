import type { MetadataRoute } from "next";
import { getSiteUrl, isProductionDeployment } from "@/sanity/metadata";

// Bot-allow policy — see SPEC.md's "robots.txt bot-allow policy" section.
// GPTBot/Google-Extended are allowed here but flagged there as a
// provisional default pending client confirmation, not a settled decision.
const NAMED_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "GPTBot",
  "Google-Extended",
];

const DISALLOWED_PATHS = ["/studio", "/api/", "/design-preview", "/design-lab"];

export default function robots(): MetadataRoute.Robots {
  // PRE-LAUNCH STATE — currently active, verified live: isProductionDeployment()
  // is false on any preview deployment (Vercel sets VERCEL_ENV to "preview"
  // automatically, before NEXT_PUBLIC_SITE_URL even enters into it) and on
  // local dev, so this branch blocks ALL crawling of the entire site,
  // unconditionally, on every environment except real production. This is
  // deliberate and load-bearing right now: the site carries 81 documents
  // with seo.noIndex set (every singleton marketing page, every pillar,
  // every subtopic, the 5 EN articles — see this pass's own sitemap audit
  // report), and a blanket robots disallow is what actually keeps Google
  // from crawling any of it during pre-launch, not the noIndex flags
  // themselves — a disallowed page is never fetched, so Google never even
  // sees a per-page noindex tag to honour. Relying on noIndex alone here
  // would be the known trap this rule avoids.
  //
  // WHAT CHANGES ON LAUNCH DAY: nothing in this file. isProductionDeployment()
  // flips to true automatically once the production deploy has both
  // VERCEL_ENV=production (Vercel sets this) and NEXT_PUBLIC_SITE_URL
  // configured in Vercel's production env vars — at that point this
  // function falls through to the `rules` object below (allow "/", disallow
  // only /studio, /api/, /design-preview, /design-lab), and per-document
  // seo.noIndex becomes the sole, correct mechanism for excluding
  // individual pages (privacy, cookie policy, anything still deliberately
  // noIndex) from the index — because crawling is now ALLOWED, Google can
  // actually reach those pages and read the noindex signal. Before flipping
  // the switch: confirm every document that SHOULD be indexable at launch
  // (chi-sono, metodo, prezzi, faq, contatti, libri, the 7 pillars, the 21
  // subtopics, the homepage, the 5 EN articles) has had its own seo.noIndex
  // cleared — this file doesn't and can't know which of those 81 documents
  // are "still not ready" vs "ready, just never had the flag flipped."
  if (!isProductionDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      { userAgent: NAMED_BOTS, allow: "/", disallow: DISALLOWED_PATHS },
      { userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
