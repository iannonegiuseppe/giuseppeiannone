import type { MetadataRoute } from "next";
import { sanityFetchPublished } from "@/sanity/client";
import { getSiteUrl } from "@/sanity/metadata";
import type { AlternateEntry, Locale } from "@/sanity/paths";
import {
  homePath,
  pillarLocalizedPaths,
  subtopicLocalizedPaths,
} from "@/sanity/paths";
import {
  sitemapHomePagesQuery,
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

  const [homePages, pillars, subtopics] = await Promise.all([
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
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // TEMPORARY EN GATE (see src/app/[locale]/page.tsx's own comment): the
  // EN homepage redirects to the IT root while its copy is still
  // hardcoded Italian, so it's excluded from the sitemap entirely here —
  // not just given a reciprocal hreflang, an actual redirecting URL has
  // no business being submitted for indexing. The IT entry's own
  // alternates omit `en` too, matching generateMetadata's identical
  // suppression. Remove this special-case (fall back to the loop's
  // normal per-locale behavior, same as pillars/subtopics below) once
  // real EN copy exists and the gate itself is lifted.
  for (const doc of homePages) {
    if (!isLocale(doc.language) || doc.language === "en") continue;

    entries.push({
      url: `${siteUrl}${homePath(doc.language)}`,
      lastModified: doc._updatedAt,
      alternates: {
        languages: toAbsoluteLanguages(siteUrl, { it: homePath("it") }),
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

  return entries;
}
