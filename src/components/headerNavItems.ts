import {
  aboutPath,
  contactPath,
  faqPath,
  methodPath,
  pillarPath,
  pricePath,
  type Locale,
} from "@/sanity/paths";

export type HeaderNavChild = {
  label: string;
  href: string;
};

export type HeaderNavItem = {
  label: string;
  href?: string; // absent when the item is a submenu-only parent (a <button>, not a link)
  children?: HeaderNavChild[];
};

// Minimal shape of next-intl's scoped translator (namespace: "Header") —
// typed structurally rather than importing next-intl's own generic
// awaited-return type, which is heavier than this file needs.
type HeaderTranslator = (key: string) => string;

// "Aree" children: Ansia points at the one real Sanity pillar
// (disturbi-d-ansia/anxiety-disorders); Depressione/Stress/Cambiamenti di
// vita are PLACEHOLDER slugs with no real pillar document behind them yet
// — published anyway per the owner's own "ship structure now, 404 until
// built" policy for this promotion (confirmed decision, not a guess).
// pillarPath(locale, slug) assumes the SAME slug for both locales, which
// is only true for Ansia by coincidence of it being fixed here explicitly
// — the other three don't have a real per-locale pair to get right yet.
function buildAreasChildren(locale: Locale, t: HeaderTranslator): HeaderNavChild[] {
  return [
    {
      label: t("areasSubmenu.anxiety"),
      href: locale === "it" ? "/disturbi-d-ansia" : "/en/anxiety-disorders",
    },
    { label: t("areasSubmenu.depression"), href: pillarPath(locale, "depressione") },
    { label: t("areasSubmenu.stress"), href: pillarPath(locale, "stress") },
    { label: t("areasSubmenu.lifeChanges"), href: pillarPath(locale, "cambiamenti-di-vita") },
  ];
}

// "Home" is deliberately absent — the wordmark already links home (see
// HeaderInteractive.tsx), matching the design-lab review's own resolved
// information architecture; a separate "Home" item would just duplicate it.
export function buildNavItems(locale: Locale, t: HeaderTranslator): HeaderNavItem[] {
  return [
    { label: t("nav.about"), href: aboutPath(locale) },
    { label: t("nav.method"), href: methodPath(locale) },
    { label: t("nav.areas"), children: buildAreasChildren(locale, t) },
    { label: t("nav.price"), href: pricePath(locale) },
    { label: t("nav.faq"), href: faqPath(locale) },
    { label: t("nav.contact"), href: contactPath(locale) },
  ];
}
