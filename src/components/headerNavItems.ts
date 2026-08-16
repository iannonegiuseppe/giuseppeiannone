import { homePath, hrefFor, NAV_ROUTE_KEYS, type Locale } from "@/sanity/paths";
import type { NavLinkData } from "@/sanity/seo";

export type HeaderNavChild = {
  label: string;
  href: string;
};

export type HeaderNavItem = {
  label: string;
  href?: string; // absent when the item is a submenu-only parent (a <button>, not a link)
  children?: HeaderNavChild[];
  // Header nav restructure pass — additive, meaningless/absent for every
  // item except the one CMS-flagged "Aree" (navLink.isPillarTaxonomy).
  // Deliberately NOT a third HeaderNavChild tier: only one item ever needs
  // grouped content, and that content is queried live (AreaGroup[], see
  // src/sanity/areaTaxonomy.ts), not CMS-authored — forcing every consumer
  // of this shared, editor-driven type (the mobile menu, the flat submenu)
  // to understand groups would be real over-engineering for a feature
  // exactly one entry needs. The renderer checks this flag and switches to
  // a separate grouped-panel component/data path instead.
  usesPillarTaxonomy?: boolean;
};

// CMS-driven header/footer pass: replaces the old next-intl-catalog-driven
// buildNavItems/buildAreasChildren entirely — nav content now comes from
// headerSettings.navItems / footerSettings.navItems+legalNavItems (both
// arrays of the shared `navLink` Sanity object type), resolved here into
// the SAME HeaderNavItem/HeaderNavChild shape HeaderNavItemWithSubmenu.tsx
// and MobileMenuOverlay.tsx already consume — neither of those files
// changes. Footer.tsx reuses these same resolver functions (not just the
// types) for its own nav arrays — the underlying resolution logic isn't
// header-specific, only this file's name is a holdover.

// Per-locale fallback label for a route-type item with no customLabel —
// only a safety net (the seeded nav always sets an explicit customLabel,
// see scripts/seed.ts) for a route item an editor adds later without
// labeling it. NAV_ROUTE_KEYS' own studioLabel is English-only (Studio UI
// stays English regardless of site locale, existing project convention),
// so it can't double as this.
const ROUTE_KEY_DEFAULT_LABELS: Record<Locale, Record<string, string>> = {
  it: {
    home: "Home",
    "chi-sono": "Chi sono",
    metodo: "Metodo",
    prezzi: "Prezzi",
    risorse: "Risorse",
    libri: "Libri",
    faq: "FAQ",
    contatti: "Contatti",
    privacy: "Privacy",
    "cookie-policy": "Cookie policy",
  },
  en: {
    home: "Home",
    "chi-sono": "About",
    metodo: "Method",
    prezzi: "Pricing",
    risorse: "Resources",
    libri: "Books",
    faq: "FAQ",
    contatti: "Contact",
    privacy: "Privacy",
    "cookie-policy": "Cookie policy",
  },
};

const ROUTE_KEY_MAP = new Map(NAV_ROUTE_KEYS.map((entry) => [entry.key, entry]));

// Reference types hrefFor can actually turn into a URL — see paths.ts's
// own hrefFor and navLink.ts's comment on why "service" is deliberately
// not offered as a reference target (no servicePath() convention exists
// yet, so it could never resolve). "page" (the universal page type,
// root-namespace pass) added alongside hrefFor's own new branch.
const RESOLVABLE_REFERENCE_TYPES = new Set(["pillarPage", "subtopicPage", "article", "page"]);

// PREVIEW-GATE (temporary), now empty — reversed for "chi-sono" (Chi sono
// build pass) and for "metodo" (Metodo build pass), the same way: each
// route is real now (src/app/[locale]/chi-sono+about-me,
// src/app/[locale]/metodo+method), so its entry is gone from this map per
// this comment's own previously-stated reversal instructions —
// ROUTE_KEY_MAP's real-route resolution below (aboutPath/methodPath) now
// resolves both, unchanged code, exactly as originally promised.
//
// Correction to the entry this replaces: it called the homepage-anchor
// behavior for "metodo" permanent, not a placeholder — true when written,
// before a real Metodo page was commissioned. It wasn't reversed lightly;
// see this pass's own report. JourneySection's own id="metodo" anchor is
// untouched (still real, still there) — only the header nav link's own
// target changed, same as chi-sono's reversal changed nothing about
// whatever the homepage used to link to under that label either.
const PREVIEW_GATE_ANCHOR_OVERRIDES = new Map<string, string>([]);

function resolveHref(locale: Locale, link: NavLinkData): string | undefined {
  if (link.linkType === "reference") {
    const page = link.page;
    if (page && RESOLVABLE_REFERENCE_TYPES.has(page._type)) {
      return hrefFor(locale, {
        _id: page._id,
        _type: page._type,
        slug: page.slug,
        parentSlug: page.parentSlug,
      });
    }
    return undefined; // deleted/unpublished reference, or an unsupported type — unresolved
  }
  // Default/route type — also the fallback when linkType is unset
  // (shouldn't happen once seeded, but "route" is the schema's own
  // initialValue, so treating a missing linkType as "route" matches
  // what a fresh Studio document would actually contain).
  const routeKey = link.routeKey;
  if (routeKey) {
    // PREVIEW-GATE (temporary) — see this file's own comment above.
    const anchorId = PREVIEW_GATE_ANCHOR_OVERRIDES.get(routeKey);
    if (anchorId) return `${homePath(locale)}#${anchorId}`;

    const entry = ROUTE_KEY_MAP.get(routeKey);
    if (entry) return entry.pathFn(locale);
  }
  return undefined; // no routeKey (or one outside the allow-list, shouldn't happen past validation)
}

function resolveLabel(locale: Locale, link: NavLinkData): string | undefined {
  if (link.customLabel) return link.customLabel;
  if (link.linkType === "reference") return link.page?.title;
  if (link.routeKey) return ROUTE_KEY_DEFAULT_LABELS[locale][link.routeKey];
  return undefined;
}

// One child (submenu item) — no further nesting supported (matches
// HeaderNavChild's own flat shape), so a child with no resolvable href is
// simply dropped rather than rendered as a dead link.
function resolveNavChild(locale: Locale, link: NavLinkData): HeaderNavChild | null {
  const href = resolveHref(locale, link);
  const label = resolveLabel(locale, link);
  if (!href || !label) return null;
  return { label, href };
}

// One top-level item. Per spec: "an item that resolves to nothing renders
// nothing" — covers both a route/reference that can't resolve to a URL
// AND (independently) an item with no label at all. A grouping-only
// parent (no route/reference of its own, per navLink.ts's own field
// description — e.g. "Aree") is valid as long as it has a label and at
// least one resolvable child; it simply renders with href: undefined,
// exactly like the old hardcoded "Aree" parent already did.
function resolveNavLink(locale: Locale, link: NavLinkData): HeaderNavItem | null {
  const href = resolveHref(locale, link);
  const children = (link.children ?? [])
    .map((child) => resolveNavChild(locale, child))
    .filter((child): child is HeaderNavChild => child !== null);
  const label = resolveLabel(locale, link);

  if (!label) return null;
  if (!href && children.length === 0 && !link.isPillarTaxonomy) return null;

  return {
    label,
    ...(href ? { href } : {}),
    ...(children.length > 0 ? { children } : {}),
    ...(link.isPillarTaxonomy ? { usesPillarTaxonomy: true } : {}),
  };
}

export function resolveNavItems(locale: Locale, navItems: NavLinkData[] | undefined): HeaderNavItem[] {
  return (navItems ?? [])
    .map((item) => resolveNavLink(locale, item))
    .filter((item): item is HeaderNavItem => item !== null);
}
