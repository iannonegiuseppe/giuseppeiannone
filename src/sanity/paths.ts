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

// Root-namespace pass — deliberately IDENTICAL output to pillarPath: the
// universal `page` type shares the same root URL segment as pillarPage
// (src/app/[locale]/[slug]/page.tsx resolves both from one route). A
// separate function exists anyway so call sites read as "this is a page
// link" rather than "this is a pillar link" — intent, not a real path
// difference. See reservedSlugs.ts / the unified resolver's own comments
// for how the two types are kept from colliding.
export function pagePath(locale: Locale, slug: string): string {
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
// Chi sono build pass — EN slug changed from the original "/en/about" to
// "/en/about-me". "About" alone reads as generic corporate boilerplate
// (About Us, About the company); this page is a single practitioner's own
// origin story, not an institutional profile — "about-me" says that
// before the visitor even clicks. Safe to change now (not yet launched;
// noIndex still true, no route existed to have been indexed or linked)
// — singletonPathFns/NAV_ROUTE_KEYS/reservedSlugs.ts all derive from this
// function, so nothing else needed updating.
export function aboutPath(locale: Locale): string {
  return locale === "it" ? "/chi-sono" : "/en/about-me";
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

// Libri build pass — fixed singleton route, same convention as every
// other entry above. EN slug is "books" (a direct, literal translation),
// not a soundalike or a repositioned word — checked for collisions
// against every pillarPage/page document and the frozen 468-entry
// WordPress redirect snapshot before choosing it (this pass's own
// report): neither "libri" nor "books" appears anywhere.
export function libriPath(locale: Locale): string {
  return locale === "it" ? "/libri" : "/en/books";
}

// Blog listing — repointed from /risorse, /en/resources (WordPress
// migration pass): those were PREVIEW-GATE placeholder routes for this
// exact listing, but the decided URL structure for the migrated blog is
// /blog, /en/blog. "blog" isn't translated (unlike the other singletons)
// per that decision. Old /risorse, /en/resources URLs redirect to these
// in next.config.ts, since they were live on preview and may be linked.
export function articlesPath(locale: Locale): string {
  return locale === "it" ? "/blog" : "/en/blog";
}

// Individual article path — same slug-preservation pattern as
// pillarPath/subtopicPath (the prefix is translated, the slug itself
// isn't). Repointed alongside articlesPath above, same reasoning.
export function articlePath(locale: Locale, slug: string): string {
  return locale === "it" ? `/blog/${slug}` : `/en/blog/${slug}`;
}

// Every fixed (non-slug-driven) singleton route, in nav order — pairs each
// path function with the Sanity document type that actually backs it, so
// sitemap.ts can generate its URL entries from this SAME array instead of
// a hand-typed, independently-maintained list per document type. This is
// the fix for a real bug: sitemap.ts went 11 days without chi-sono, prezzi,
// faq, metodo, and contatti (and never had libri, which postdated it) —
// each became a real page well after sitemap.ts was last touched, and
// nobody came back to add a query for it. A hand-typed second list has no
// way to fail loudly when a new singleton is forgotten; deriving from this
// one array means adding a route here is the ONLY step, for every
// consumer at once (routing, the locale switcher, reserved-slug
// protection, and the sitemap).
//
// `singletonPathFns` below is kept as the plain function-list projection
// of this array — its own two existing consumers (reservedSlugs.ts,
// LocaleSwitcher.tsx) only ever needed the function itself, never the
// document type, so neither had to change for this.
export const SINGLETON_ROUTES: Array<{
  documentType: string;
  pathFn: (locale: Locale) => string;
}> = [
  { documentType: "homePage", pathFn: homePath },
  { documentType: "chiSonoSection", pathFn: aboutPath },
  { documentType: "methodPage", pathFn: methodPath },
  { documentType: "pricePage", pathFn: pricePath },
  { documentType: "blogIndexSection", pathFn: articlesPath },
  { documentType: "libriPage", pathFn: libriPath },
  { documentType: "faqPage", pathFn: faqPath },
  { documentType: "contactPage", pathFn: contactPath },
  { documentType: "privacyPage", pathFn: privacyPath },
  { documentType: "cookiePolicyPage", pathFn: cookiePolicyPath },
];

export const singletonPathFns: Array<(locale: Locale) => string> =
  SINGLETON_ROUTES.map((route) => route.pathFn);

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
  { key: "libri", studioLabel: "Books (Libri)", pathFn: libriPath },
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

// Sitemap pass — same shape as pillarLocalizedPaths/subtopicLocalizedPaths
// above, for article (used by sitemap.ts; generateMetadata's own
// hreflang for the article route doesn't need this — see that route's
// own comment).
export function articleLocalizedPaths(
  alternates: AlternateEntry[] | undefined,
): Partial<Record<Locale, string>> {
  const paths: Partial<Record<Locale, string>> = {};

  for (const alt of alternates ?? []) {
    if (!alt.slug || !isLocale(alt.language)) continue;
    paths[alt.language] = articlePath(alt.language, alt.slug);
  }

  return paths;
}

// Sitemap pass — same shape as pillarLocalizedPaths above, not a reuse of
// it under a misleading name: pagePath()'s output happens to be
// identical to pillarPath()'s (see pagePath's own comment), but this
// function exists so a sitemap.ts call site reads as "this is a page
// document" rather than "this is a pillar."
export function pageLocalizedPaths(
  alternates: AlternateEntry[] | undefined,
): Partial<Record<Locale, string>> {
  const paths: Partial<Record<Locale, string>> = {};

  for (const alt of alternates ?? []) {
    if (!alt.slug || !isLocale(alt.language)) continue;
    paths[alt.language] = pagePath(alt.language, alt.slug);
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
  // Root-namespace pass: navLink.ts's reference field now allows `page`.
  // pagePath() has identical output to pillarPath() by design — see that
  // function's own comment.
  if (doc._type === "page" && doc.slug) {
    return pagePath(locale, doc.slug);
  }

  return prefix || "/";
}
