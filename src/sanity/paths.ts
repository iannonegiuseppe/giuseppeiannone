export type Locale = "it" | "en";

export interface AlternateEntry {
  language: string;
  slug?: string;
  parentSlug?: string | null;
}

export function homePath(locale: Locale): string {
  return locale === "it" ? "/" : "/en";
}

export function pillarPath(locale: Locale, slug: string): string {
  return locale === "it" ? `/${slug}` : `/en/${slug}`;
}

export function subtopicPath(
  locale: Locale,
  parentSlug: string,
  slug: string,
): string {
  return locale === "it"
    ? `/${parentSlug}/${slug}`
    : `/en/${parentSlug}/${slug}`;
}

// Dedicated prefix (not a flat top-level slug like pillarPath) so a
// location's slug can never collide with a pillar page's — location
// pages themselves don't exist as a route yet (Stage 3 Step 9).
export function locationPath(locale: Locale, slug: string): string {
  return locale === "it" ? `/sedi/${slug}` : `/en/locations/${slug}`;
}

// Aree section pass: same reasoning as locationPath above — namespaced
// rather than a flat top-level slug like pillarPath, since an area's own
// slug (e.g. "ansia") could otherwise collide with an existing/future
// pillarPage slug about the same topic (e.g. "disturbi-d-ansia" already
// exists as one). No individual area page exists yet — this legalizes
// the URL shape now, same "decided in code, not content, ahead of the
// route existing" precedent as articlePath. Deliberately distinct from
// the "Aree" nav GROUPING label, which has no route of its own and links
// to pillarPage children instead — see NAV_ROUTE_KEYS's own
// HONESTY-RULE comment below; this is for an individual area ROW's own
// future page, not that grouping.
export function areaPath(locale: Locale, slug: string): string {
  return locale === "it" ? `/aree/${slug}` : `/en/areas/${slug}`;
}

// Fixed routes for the singleton pages (about/method/price/faq/contact,
// plus the legal pages) — these document types have no slug field (see
// simplePage.ts), so the path is decided in code, not content. None of
// these routes exist yet (built in Steps 5/7); the paths are fixed here
// now so the header/footer/locale switcher can reference the correct
// eventual URL from the start.
export function aboutPath(locale: Locale): string {
  return locale === "it" ? "/chi-sono" : "/en/about";
}

export function methodPath(locale: Locale): string {
  return locale === "it" ? "/metodo" : "/en/method";
}

export function pricePath(locale: Locale): string {
  return locale === "it" ? "/prezzi" : "/en/pricing";
}

export function faqPath(locale: Locale): string {
  return locale === "it" ? "/faq" : "/en/faq";
}

export function contactPath(locale: Locale): string {
  return locale === "it" ? "/contatti" : "/en/contact";
}

export function privacyPath(locale: Locale): string {
  return locale === "it" ? "/privacy" : "/en/privacy";
}

export function cookiePolicyPath(locale: Locale): string {
  return locale === "it" ? "/cookie-policy" : "/en/cookie-policy";
}

// Blog/resources index — same "decided in code, not content" reasoning
// as the singletons above (no dedicated document type for this listing
// page itself). Legalizes what design-lab's ResourcesSection.tsx/
// DesignLabFooter.tsx were each inventing locally as a stopgap (see
// their own now-outdated comments) — those callers are updated to use
// this instead of maintaining a parallel convention. EN is translated
// ("resources"), matching every other singleton's locale handling
// (aboutPath, methodPath, etc.) rather than the stopgaps' own
// deliberately-flagged "not translated" compromise.
export function articlesPath(locale: Locale): string {
  return locale === "it" ? "/risorse" : "/en/resources";
}

// Individual article path — same slug-preservation pattern as
// pillarPath/subtopicPath (the prefix is translated, the slug itself
// isn't). The route doesn't exist yet (built later, once the article
// schema has real content behind it) — this legalizes the URL SHAPE
// now so callers stop hand-rolling it, per this pass's own instruction;
// it may 404 in the meantime, same as pillar/subtopic links already do
// elsewhere in the lab.
export function articlePath(locale: Locale, slug: string): string {
  return locale === "it" ? `/risorse/${slug}` : `/en/resources/${slug}`;
}

// Every fixed (non-slug-driven) path function, in nav order — the single
// source the locale switcher's static reverse-lookup iterates over. Add a
// new singleton path function here when one is introduced.
export const singletonPathFns: Array<(locale: Locale) => string> = [
  homePath,
  aboutPath,
  methodPath,
  pricePath,
  articlesPath,
  faqPath,
  contactPath,
  privacyPath,
  cookiePolicyPath,
];

// CMS-driven header/footer pass: the fixed-route allow-list a headerSettings/
// footerSettings nav item's `routeKey` (Studio dropdown, see navLink.ts) is
// constrained to — reuses the SAME path functions as singletonPathFns
// (same order, same source) rather than a second hand-typed list, so the
// two can't drift apart; add an entry here alongside singletonPathFns
// whenever a new fixed route is introduced. `home` is included per the
// allow-list requirement even though the current seeded nav never uses it
// (the wordmark/logo already links home — see headerNavItems.ts).
//
// HONESTY-RULE NOTE: "aree" is deliberately NOT a key here. Unlike every
// route above, "Aree" has no fixed path function of its own anywhere in
// this file — it has always been a pure grouping label whose children are
// pillarPage links (see headerNavItems.ts's pre-existing buildAreasChildren
// and this pass's own report). Inventing an areePath() with no real route
// behind it would violate "source this list from the route convention" —
// a navLink item can still represent "Aree" correctly with no routeKey/
// page of its own, just a customLabel and children (see navLink.ts).
export interface NavRouteKeyEntry {
  key: string;
  // English, since Studio UI stays English regardless of site locale
  // (existing project convention) — this is the STUDIO dropdown label,
  // not visitor-facing copy. The visitor-facing default (per locale) is
  // ROUTE_KEY_DEFAULT_LABELS in headerNavItems.ts; customLabel overrides
  // either.
  studioLabel: string;
  pathFn: (locale: Locale) => string;
}

export const NAV_ROUTE_KEYS: NavRouteKeyEntry[] = [
  { key: "home", studioLabel: "Home", pathFn: homePath },
  { key: "chi-sono", studioLabel: "About (Chi sono)", pathFn: aboutPath },
  { key: "metodo", studioLabel: "Method (Metodo)", pathFn: methodPath },
  { key: "prezzi", studioLabel: "Pricing (Prezzi)", pathFn: pricePath },
  { key: "risorse", studioLabel: "Resources (Risorse)", pathFn: articlesPath },
  { key: "faq", studioLabel: "FAQ", pathFn: faqPath },
  { key: "contatti", studioLabel: "Contact (Contatti)", pathFn: contactPath },
  { key: "privacy", studioLabel: "Privacy", pathFn: privacyPath },
  { key: "cookie-policy", studioLabel: "Cookie policy", pathFn: cookiePolicyPath },
];

function isLocale(value: string): value is Locale {
  return value === "it" || value === "en";
}

// Builds { it: "/disturbi-d-ansia", en: "/en/anxiety-disorders" } (or
// whichever locales actually have a translation) from a document's
// translation.metadata alternates — shared by generateMetadata's hreflang
// (Step 3), sitemap.xml (Step 5), and breadcrumbs (Step 6).
export function pillarLocalizedPaths(
  alternates: AlternateEntry[] | undefined,
): Partial<Record<Locale, string>> {
  const paths: Partial<Record<Locale, string>> = {};

  for (const alt of alternates ?? []) {
    if (!alt.slug || !isLocale(alt.language)) continue;
    paths[alt.language] = pillarPath(alt.language, alt.slug);
  }

  return paths;
}

export function subtopicLocalizedPaths(
  alternates: AlternateEntry[] | undefined,
): Partial<Record<Locale, string>> {
  const paths: Partial<Record<Locale, string>> = {};

  for (const alt of alternates ?? []) {
    if (!alt.slug || !alt.parentSlug || !isLocale(alt.language)) continue;
    paths[alt.language] = subtopicPath(alt.language, alt.parentSlug, alt.slug);
  }

  return paths;
}

export interface ReferencedDoc {
  _id: string;
  _type: string;
  title?: string;
  slug?: string;
  parentSlug?: string | null;
}

// Shared by the Portable Text renderers (relatedTopics, condition/
// treatmentCard) and the homepage's concerns grid / latest-content
// sections — anywhere a document reference needs to become a URL.
export function hrefFor(locale: Locale, doc: ReferencedDoc): string {
  const prefix = locale === "it" ? "" : `/${locale}`;

  if (doc._type === "pillarPage" && doc.slug) {
    return `${prefix}/${doc.slug}`;
  }
  if (doc._type === "subtopicPage" && doc.slug && doc.parentSlug) {
    return `${prefix}/${doc.parentSlug}/${doc.slug}`;
  }
  // CMS-driven header/footer pass: added for navLink's "reference" link
  // type (see headerNavItems.ts) — articlePath already exists as the
  // established convention, just not previously wired through here.
  if (doc._type === "article" && doc.slug) {
    return articlePath(locale, doc.slug);
  }

  return prefix || "/";
}
