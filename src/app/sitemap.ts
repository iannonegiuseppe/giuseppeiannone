import type { MetadataRoute } from "next";
import { sanityFetchPublished } from "@/sanity/client";
import { getSiteUrl } from "@/sanity/metadata";
import type { AlternateEntry, Locale } from "@/sanity/paths";
import {
  articleLocalizedPaths,
  articlePath,
  pageLocalizedPaths,
  pagePath,
  pillarLocalizedPaths,
  SINGLETON_ROUTES,
  subtopicLocalizedPaths,
} from "@/sanity/paths";
import {
  sitemapArticlesQuery,
  sitemapPagesQuery,
  sitemapPillarsQuery,
  sitemapSingletonQuery,
  sitemapSubtopicsQuery,
} from "@/sanity/queries";

function isLocale(value: string): value is Locale {
  return value === "it" || value === "en";
}

function toAbsoluteLanguages(
  siteUrl: string,
  localizedPaths: Partial<Record<Locale, string>>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(localizedPaths).map(([locale, path]) => [
      locale,
      `${siteUrl}${path}`,
    ]),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [singletons, pillars, subtopics, articles, pages] =
    await Promise.all([
      // Singleton pass — one fetch per SINGLETON_ROUTES entry (home,
      // chi-sono, metodo, prezzi, blog listing, libri, faq, contatti,
      // privacy, cookie policy), run in parallel. Replaces the two
      // one-off queries this used to hand-write (home, blog index) plus
      // the five that were simply never written (chi-sono, metodo,
      // prezzi, faq, contatti) and the one that didn't exist yet when
      // this file was last touched (libri) — see paths.ts's own comment
      // on SINGLETON_ROUTES for why a hand-typed second list was the bug.
      Promise.all(
        SINGLETON_ROUTES.map((route) =>
          sanityFetchPublished<
            { language: string; _updatedAt: string; noIndex?: boolean }[]
          >(sitemapSingletonQuery, { documentType: route.documentType }, [
            route.documentType,
          ]).then((docs) => ({ route, docs })),
        ),
      ),
      sanityFetchPublished<
        {
          language: string;
          slug?: string;
          _updatedAt: string;
          alternates?: AlternateEntry[];
        }[]
      >(sitemapPillarsQuery, {}, ["pillarPage"]),
      sanityFetchPublished<
        {
          language: string;
          slug?: string;
          parentSlug?: string;
          _updatedAt: string;
          alternates?: AlternateEntry[];
        }[]
      >(sitemapSubtopicsQuery, {}, ["subtopicPage"]),
      sanityFetchPublished<
        {
          language: string;
          slug?: string;
          _updatedAt: string;
          alternates?: AlternateEntry[];
        }[]
      >(sitemapArticlesQuery, {}, ["article"]),
      sanityFetchPublished<
        {
          language: string;
          slug?: string;
          _updatedAt: string;
          alternates?: AlternateEntry[];
        }[]
      >(sitemapPagesQuery, {}, ["page"]),
    ]);

  const entries: MetadataRoute.Sitemap = [];

  // Singleton pass — one loop covers every fixed-route type at once
  // (home, chi-sono, metodo, prezzi, blog listing, libri, faq, contatti,
  // privacy, cookie policy). Deliberately NOT a fixed both-locales
  // hreflang block: only a language that is ITSELF not noIndex gets a
  // <url> entry, and the alternates map is built only from languages that
  // survived that same filter — a language cleared for indexing never
  // links to a sibling that's still noindexed, avoiding the exact broken-
  // alternate trap sitemapSingletonQuery's own comment describes.
  for (const { route, docs } of singletons) {
    const indexable = docs.filter(
      (doc): doc is typeof doc & { language: Locale } =>
        isLocale(doc.language) && doc.noIndex !== true,
    );
    if (indexable.length === 0) continue;

    const localizedPaths = Object.fromEntries(
      indexable.map((doc) => [doc.language, route.pathFn(doc.language)]),
    ) as Partial<Record<Locale, string>>;

    for (const doc of indexable) {
      entries.push({
        url: `${siteUrl}${route.pathFn(doc.language)}`,
        lastModified: doc._updatedAt,
        alternates: { languages: toAbsoluteLanguages(siteUrl, localizedPaths) },
      });
    }
  }

  for (const doc of pillars) {
    if (!doc.slug || !isLocale(doc.language)) continue;

    const localizedPaths = pillarLocalizedPaths(doc.alternates);
    const path = localizedPaths[doc.language];
    if (!path) continue;

    entries.push({
      url: `${siteUrl}${path}`,
      lastModified: doc._updatedAt,
      alternates: { languages: toAbsoluteLanguages(siteUrl, localizedPaths) },
    });
  }

  for (const doc of subtopics) {
    if (!doc.slug || !doc.parentSlug || !isLocale(doc.language)) continue;

    const localizedPaths = subtopicLocalizedPaths(doc.alternates);
    const path = localizedPaths[doc.language];
    if (!path) continue;

    entries.push({
      url: `${siteUrl}${path}`,
      lastModified: doc._updatedAt,
      alternates: { languages: toAbsoluteLanguages(siteUrl, localizedPaths) },
    });
  }

  // Sitemap pass — the 468 migrated articles plus any Studio-authored
  // ones going forward. Deliberately does NOT include /blog/page/2..N —
  // see this pass's own report for why pagination pages are excluded
  // (no single document owns their lastModified, and Google discovers
  // them by crawling page 1's own pagination links regardless).
  for (const doc of articles) {
    if (!doc.slug || !isLocale(doc.language)) continue;

    // Unlike pillarPage/subtopicPage, articles don't reliably have a
    // translation.metadata pairing — confirmed live: all 468 migrated
    // WordPress articles are IT-only with NO metadata document at all
    // (alternatesProjection resolves to null for every one). Building
    // the path from alternates the way pillars/subtopics do would skip
    // every article with no pair — which was the actual bug here,
    // caught by live-testing this file rather than trusting the pattern
    // to generalize. The document's own path is built directly from its
    // own language/slug instead; alternates only ADD cross-language
    // hreflang entries on top, for the rare article that does have one.
    const path = articlePath(doc.language, doc.slug);
    const localizedPaths = articleLocalizedPaths(doc.alternates);
    localizedPaths[doc.language] = path;

    entries.push({
      url: `${siteUrl}${path}`,
      lastModified: doc._updatedAt,
      alternates: { languages: toAbsoluteLanguages(siteUrl, localizedPaths) },
    });
  }

  // The universal page type (root-namespace pass) — 0 documents today,
  // wired up now so a page Giuseppe creates later appears automatically,
  // no further sitemap change needed. Same defensive shape as articles
  // above (own path built directly, not gated on having a translation
  // pair) — a page has no more guarantee of one than an article does.
  for (const doc of pages) {
    if (!doc.slug || !isLocale(doc.language)) continue;

    const path = pagePath(doc.language, doc.slug);
    const localizedPaths = pageLocalizedPaths(doc.alternates);
    localizedPaths[doc.language] = path;

    entries.push({
      url: `${siteUrl}${path}`,
      lastModified: doc._updatedAt,
      alternates: { languages: toAbsoluteLanguages(siteUrl, localizedPaths) },
    });
  }

  return entries;
}
