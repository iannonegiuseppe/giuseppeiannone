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
