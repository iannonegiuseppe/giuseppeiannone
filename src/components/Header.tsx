import { getTranslations } from "next-intl/server";
import { buildNavItems } from "./headerNavItems";
import { HeaderInteractive } from "./HeaderInteractive";
import type { Locale } from "@/sanity/paths";
import type { AvailabilityStatus, ContactChannel } from "@/sanity/seo";

// Promoted from design-lab's own DesignLabHeader.tsx (glass-on-scroll,
// two-state collapse, data-driven nav with the "Aree" submenu, channel
// dialog, mobile burger overlay) — see HeaderInteractive.tsx for the
// client-side implementation this wraps. Stays a server component so it
// can fetch translations the same way the pre-promotion Header.tsx did;
// authorName stays a prop (Sanity-driven, wired by layout.tsx) rather than
// hardcoded, since that wiring already existed and this pass doesn't
// remove working infrastructure, just restyles around it. contactChannels
// (CMS-wiring pass) threads through to ChannelPickerDialog, replacing its
// old static import of src/components/contactChannels.ts.
export async function Header({
  locale,
  authorName,
  contactChannels,
  availabilityStatus,
  availabilityText,
}: {
  locale: Locale;
  authorName: string;
  contactChannels?: ContactChannel[];
  availabilityStatus?: AvailabilityStatus;
  availabilityText?: string;
}) {
  const t = await getTranslations({ locale, namespace: "Header" });
  const navItems = buildNavItems(locale, t);

  return (
    <HeaderInteractive
      navItems={navItems}
      locale={locale}
      authorName={authorName}
      ctaLabel={t("cta")}
      contactChannels={contactChannels}
      availabilityStatus={availabilityStatus}
      availabilityText={availabilityText}
    />
  );
}
