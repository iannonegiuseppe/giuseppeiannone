import type { MetadataRoute } from "next";
import { sanityFetchPublished } from "@/sanity/client";
import { getSiteUrl } from "@/sanity/metadata";
import type { AlternateEntry, Locale } from "@/sanity/paths";
import {
  articleLocalizedPaths,
  articlePath,
  articlesPath,
  homePath,
  pageLocalizedPaths,
  pagePath,
  pillarLocalizedPaths,
  subtopicLocalizedPaths,
} from "@/sanity/paths";
import {
  sitemapArticlesQuery,
  sitemapBlogIndexQuery,
  sitemapHomePagesQuery,
  sitemapPagesQuery,
  sitemapPillarsQuery,
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

  const [homePages, pillars, subtopics, articles, blogIndexPages, pages] =
    await Promise.all([
      sanityFetchPublished<{ language: string; _updatedAt: string }[]>(
        sitemapHomePagesQuery,
        {},
        ["homePage"],
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
      sanityFetchPublished<{ language: string; _updatedAt: string }[]>(
        sitemapBlogIndexQuery,
        {},
        ["blogIndexSection"],
      ),
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

  // Every locale this document exists in, for real — the EN gate that
  // used to hand-exclude "en" here is gone everywhere else (page.tsx,
  // proxy.ts) and this special case was the one piece of it left
  // undone; see this pass's own report.
  for (const doc of homePages) {
    if (!isLocale(doc.language)) continue;

    entries.push({
      url: `${siteUrl}${homePath(doc.language)}`,
      lastModified: doc._updatedAt,
      alternates: {
        languages: toAbsoluteLanguages(siteUrl, {
          it: homePath("it"),
          en: homePath("en"),
        }),
      },
    });
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

  // The /blog, /en/blog listing itself (page 1) — the canonical entry
  // point to the blog, not one of the excluded pagination pages.
  // lastModified comes from blogIndexSection's own _updatedAt (the
  // document that owns this URL's hero/editorial copy), not from
  // whichever article happens to be newest — same "the document IS the
  // page" reasoning homePage's own entry above uses.
  for (const doc of blogIndexPages) {
    if (!isLocale(doc.language)) continue;

    entries.push({
      url: `${siteUrl}${articlesPath(doc.language)}`,
      lastModified: doc._updatedAt,
      alternates: {
        languages: toAbsoluteLanguages(siteUrl, {
          it: articlesPath("it"),
          en: articlesPath("en"),
        }),
      },
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
