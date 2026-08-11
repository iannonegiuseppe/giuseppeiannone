import { sanityFetch } from "@/sanity/client";
import { contactSectionQuery } from "@/sanity/queries";
import { getSiteSettings, type PricingFields } from "@/sanity/seo";

// /prezzi proposals pass — three design directions for the real /prezzi
// page (src/app/[locale]/prezzi/page.tsx), NOT wired to it. Scratch route
// only, gated like every other /design-lab page (see each proposal's own
// page.tsx metadata). Italian only, same "no i18n" constraint the rest of
// design-lab uses.
//
// Every fee/duration figure across all three proposals is formatted from
// THIS fetch (siteSettings.pricing, added to the shared siteSettingsQuery
// this same pass) — never a typed literal. If pricing is ever unset in
// Sanity, formatFee/formatDuration fall back to an obvious placeholder
// string rather than silently rendering "undefined" or a wrong number.
//
// getContactSectionCopy below is copy-pasted from every real page's own
// private helper (faq/page.tsx, [slug]/page.tsx, prezzi/page.tsx all
// define an identical one) rather than a new shared export — matching
// this codebase's own established convention, not introducing a new one.
interface ContactSectionCopy {
  contactSection?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    photoCaption?: string;
  };
  googleProfileLabel?: string;
}

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

// locale defaults to "it" so proposals A/B (Italian-only, predating the
// C pass's EN mirror) keep calling this with zero args, unchanged.
export async function getPrezziProposalData(locale: "it" | "en" = "it") {
  const [siteSettings, contactCopy] = await Promise.all([
    getSiteSettings(locale),
    getContactSectionCopy(locale),
  ]);
  return { siteSettings, contactCopy };
}

export function formatFee(amount: number | undefined, currency: string | undefined): string {
  if (typeof amount !== "number") return "[tariffa]";
  const symbol = currency === "EUR" || !currency ? "€" : currency;
  return `${amount} ${symbol}`;
}

export function formatDuration(minutes: number | undefined, locale: "it" | "en" = "it"): string {
  if (typeof minutes !== "number") return locale === "en" ? "[duration]" : "[durata]";
  return locale === "en" ? `${minutes} minutes` : `${minutes} minuti`;
}

export function pricingOrPlaceholder(pricing: PricingFields | undefined, locale: "it" | "en" = "it") {
  return {
    individualFee: formatFee(pricing?.individualFee, pricing?.currency),
    individualDuration: formatDuration(pricing?.individualDurationMin, locale),
    coupleFee: formatFee(pricing?.coupleFee, pricing?.currency),
    coupleDuration: formatDuration(pricing?.coupleDurationMin, locale),
  };
}
