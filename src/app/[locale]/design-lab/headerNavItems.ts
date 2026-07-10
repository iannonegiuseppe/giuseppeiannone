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

// [segnaposto] "Aree" children: Ansia/Depressione/Stress/Cambiamenti di vita
// point at pillarPath() with PLACEHOLDER slugs — a real pillar page exists
// today only for "disturbi-d-ansia" (Sanity-driven; confirmed via
// generateStaticParams' own sample output). The other three slugs below
// are invented for illustration and do NOT necessarily match the eventual
// real pillar documents. Also note pillarPath(locale, slug) uses the SAME
// slug for both locales, unlike a real pillar's actual per-locale slug
// pair (e.g. disturbi-d-ansia/anxiety-disorders, resolved via
// pillarLocalizedPaths from Sanity `alternates`) — this placeholder nav
// has no such per-locale mapping available, so its EN hrefs will not
// match the real Ansia pillar's true English URL. Publishing this "Aree"
// submenu at all — and finalizing which slugs/locale pairs it actually
// points to — is a merge-time decision for whoever wires this header
// into the real, shared Header.tsx, not something this design-lab pass
// can settle on its own.
function buildNavItems(locale: Locale): HeaderNavItem[] {
  return [
    // Revision round 1, item 2a: "Home" nav item removed — the wordmark
    // (see DesignLabHeader.tsx) is already the home link, matching the
    // real Header's own wordmark-links-home pattern; a separate "Home"
    // item duplicated it.
    { label: "Chi sono", href: aboutPath(locale) },
    { label: "Metodo", href: methodPath(locale) },
    {
      label: "Aree",
      children: [
        { label: "Ansia", href: pillarPath(locale, "disturbi-d-ansia") },
        { label: "Depressione", href: pillarPath(locale, "depressione") },
        { label: "Stress", href: pillarPath(locale, "stress") },
        { label: "Cambiamenti di vita", href: pillarPath(locale, "cambiamenti-di-vita") },
      ],
    },
    { label: "Prezzi", href: pricePath(locale) },
    { label: "FAQ", href: faqPath(locale) },
    { label: "Contatti", href: contactPath(locale) },
  ];
}

export { buildNavItems };
