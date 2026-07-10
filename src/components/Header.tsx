import { getTranslations } from "next-intl/server";
import { buildNavItems } from "./headerNavItems";
import { HeaderInteractive } from "./HeaderInteractive";
import type { Locale } from "@/sanity/paths";

// Promoted from design-lab's own DesignLabHeader.tsx (glass-on-scroll,
// two-state collapse, data-driven nav with the "Aree" submenu, channel
// dialog, mobile burger overlay) — see HeaderInteractive.tsx for the
// client-side implementation this wraps. Stays a server component so it
// can fetch translations the same way the pre-promotion Header.tsx did;
// authorName stays a prop (Sanity-driven, wired by layout.tsx) rather than
// hardcoded, since that wiring already existed and this pass doesn't
// remove working infrastructure, just restyles around it.
export async function Header({
  locale,
  authorName,
}: {
  locale: Locale;
  authorName: string;
}) {
  const t = await getTranslations({ locale, namespace: "Header" });
  const navItems = buildNavItems(locale, t);

  return (
    <HeaderInteractive
      navItems={navItems}
      locale={locale}
      authorName={authorName}
      ctaLabel={t("cta")}
    />
  );
}
