import { resolveNavItems } from "./headerNavItems";
import { HeaderInteractive } from "./HeaderInteractive";
import type { Locale } from "@/sanity/paths";
import { getHeaderSettings } from "@/sanity/seo";
import type {
  AvailabilityStatus,
  ContactChannel,
  ResolvedLogo,
} from "@/sanity/seo";

// CMS-driven header/footer pass: nav items + the CTA button label now
// come from the new headerSettings singleton (fetched here, colocated —
// this data is Header-exclusive, unlike siteSettings/logo which layout.tsx
// already fetches once for the whole page tree and passes down, matching
// authorName/contactChannels' own existing pattern). Replaces the old
// next-intl-catalog-driven buildNavItems/t("cta") entirely — see
// headerNavItems.ts's own comment on the resolver this now uses.
export async function Header({
  locale,
  authorName,
  logo,
  contactChannels,
  availabilityStatus,
  availabilityText,
}: {
  locale: Locale;
  authorName: string;
  logo?: ResolvedLogo;
  contactChannels?: ContactChannel[];
  availabilityStatus?: AvailabilityStatus;
  availabilityText?: string;
}) {
  const headerSettings = await getHeaderSettings(locale);
  const navItems = resolveNavItems(locale, headerSettings?.navItems);

  return (
    <HeaderInteractive
      navItems={navItems}
      locale={locale}
      authorName={authorName}
      logo={logo}
      ctaLabel={headerSettings?.ctaButtonText ?? "Prenota un primo colloquio"}
      contactChannels={contactChannels}
      availabilityStatus={availabilityStatus}
      availabilityText={availabilityText}
    />
  );
}
