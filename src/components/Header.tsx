import { resolveNavItems } from "./headerNavItems";
import { HeaderInteractive } from "./HeaderInteractive";
import type { Locale } from "@/sanity/paths";
import { getAreaTaxonomy } from "@/sanity/areaTaxonomy";
import { getHeaderSettings } from "@/sanity/seo";
import type { ContactChannel } from "@/sanity/seo";

// CMS-driven header/footer pass: nav items + the CTA button label now
// come from the new headerSettings singleton (fetched here, colocated —
// this data is Header-exclusive, unlike siteSettings which layout.tsx
// already fetches once for the whole page tree and passes down, matching
// contactChannels' own existing pattern). Replaces the old
// next-intl-catalog-driven buildNavItems/t("cta") entirely — see
// headerNavItems.ts's own comment on the resolver this now uses.
//
// Logo pass: authorName/logo props are gone — the header's brand mark is
// now a fixed, vectorized signature (see Logo.tsx), not CMS-driven text
// or an uploaded image.
export async function Header({
  locale,
  contactChannels,
}: {
  locale: Locale;
  contactChannels?: ContactChannel[];
}) {
  const headerSettings = await getHeaderSettings(locale);
  const navItems = resolveNavItems(locale, headerSettings?.navItems);
  // Only ever consumed by the one item flagged usesPillarTaxonomy ("Aree")
  // — fetched unconditionally rather than gated on that flag being present,
  // since it's cheap (7 pillars, their subtopics) and Header is already a
  // server component making one other Sanity round trip on this same
  // request; a conditional fetch would save nothing real and would leave
  // the desktop panel/mobile accordion needing to handle "taxonomy missing
  // because the flag wasn't set yet" as a real state to design for.
  const areaTaxonomy = await getAreaTaxonomy(locale);

  return (
    <HeaderInteractive
      navItems={navItems}
      areaTaxonomy={areaTaxonomy}
      locale={locale}
      ctaLabel={headerSettings?.ctaButtonText ?? "Inizia il percorso"}
      contactChannels={contactChannels}
    />
  );
}
