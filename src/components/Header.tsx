import { resolveNavItems } from "./headerNavItems";
import { HeaderInteractive } from "./HeaderInteractive";
import type { Locale } from "@/sanity/paths";
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

  return (
    <HeaderInteractive
      navItems={navItems}
      locale={locale}
      ctaLabel={headerSettings?.ctaButtonText ?? "Prenota un primo colloquio"}
      contactChannels={contactChannels}
    />
  );
}
