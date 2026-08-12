import { sanityFetch } from "@/sanity/client";
import { sedesQuery, contactSectionQuery } from "@/sanity/queries";
import { getSiteSettings, type ContactChannel } from "@/sanity/seo";
import type { SedeData } from "@/components/LocationsSection";

// /contatti proposals pass — three design directions for the real Contatti
// page (currently a PreviewPlaceholderPage, src/app/[locale]/contatti/
// page.tsx), NOT wired to it. Scratch route only, gated like every other
// /design-lab page (see each proposal's own page.tsx metadata). Italian
// only, same "no i18n" constraint prezzi-proposals already established for
// this kind of internal-review route.
//
// Every address/phone/email/whatsapp value across all three proposals comes
// from THIS fetch (real `sede` documents + siteSettings.contactChannels) —
// never a typed literal copied from a brief. getContactSectionCopy is
// copy-pasted from prezzi-proposals/shared.ts's own identical helper
// (itself copy-pasted from every real page's private helper) rather than a
// new shared export, matching this codebase's own established convention.
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

function getSedes(locale: string) {
  return sanityFetch<SedeData[]>(sedesQuery, { locale }, ["sede"]);
}

export async function getContattiProposalData(locale: "it" | "en" = "it") {
  const [siteSettings, contactCopy, sedes] = await Promise.all([
    getSiteSettings(locale),
    getContactSectionCopy(locale),
    getSedes(locale),
  ]);
  return { siteSettings, contactCopy, sedes };
}

export function pickChannel(
  channels: ContactChannel[] | undefined,
  type: ContactChannel["type"],
): ContactChannel | undefined {
  return channels?.find((c) => c.type === type);
}

// Page-level opening hours — NOT per-location (see each proposal's own
// "Dove" section, which explicitly says as much): he cannot be at four
// studios at once, so these are shown once, not duplicated per address.
// Resolved copy, not a placeholder — verbatim per this pass's own brief.
export const HOURS_IT = {
  line1: "Lunedì–venerdì, 8:00–21:00. Sabato e domenica chiuso.",
  line2: "Gli appuntamenti si fissano su richiesta; rispondo entro 24 ore.",
};
