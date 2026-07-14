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

const DISALLOWED_PATHS = ["/studio", "/api/", "/design-preview"];

export default function robots(): MetadataRoute.Robots {
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
