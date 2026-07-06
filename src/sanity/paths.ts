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

// Every fixed (non-slug-driven) path function, in nav order — the single
// source the locale switcher's static reverse-lookup iterates over. Add a
// new singleton path function here when one is introduced.
export const singletonPathFns: Array<(locale: Locale) => string> = [
  homePath,
  aboutPath,
  methodPath,
  pricePath,
  faqPath,
  contactPath,
  privacyPath,
  cookiePolicyPath,
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

  return prefix || "/";
}
