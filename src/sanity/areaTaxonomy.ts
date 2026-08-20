import { sanityFetch } from "./client";
import { pillarPath, subtopicPath, type Locale } from "./paths";
import { areaChipCountsQuery, areaTaxonomyQuery } from "./queries";

interface PillarTaxonomyDoc {
  _id: string;
  title: string;
  slug: string;
  subtopics: { title: string; slug: string }[];
}

export interface AreaSubtopicLink {
  title: string;
  href: string;
}

export interface AreaGroup {
  title: string;
  href: string;
  subtopics: AreaSubtopicLink[];
}

// Deliberate display order (owner's own brief, given in full twice) — no
// CMS field carries this today, same "fixed order lives in code, not
// content" precedent structure.ts's own desk-tree pillar list already
// uses. Matched against each document's _id with the locale suffix
// stripped, so it works for both "pillarPage-anxiety-it" and
// "-anxiety-en" from one list. Any pillar not in this list (none exist
// today) sorts after the named ones, alphabetically by title — a safety
// net, not a silent drop.
const PILLAR_ORDER = [
  "anxiety",
  "panic",
  "sessuali",
  "stress",
  "relazioni",
  "coppia",
  "trauma",
];

function pillarOrderKey(id: string, locale: Locale): number {
  const base = id.replace(/^pillarPage-/, "").replace(new RegExp(`-${locale}$`), "");
  const index = PILLAR_ORDER.indexOf(base);
  return index === -1 ? PILLAR_ORDER.length : index;
}

export async function getAreaTaxonomy(locale: Locale): Promise<AreaGroup[]> {
  const pillars = await sanityFetch<PillarTaxonomyDoc[]>(
    areaTaxonomyQuery,
    { locale },
    ["pillarPage", "subtopicPage"],
  );

  return [...pillars]
    .sort((a, b) => {
      const orderDiff = pillarOrderKey(a._id, locale) - pillarOrderKey(b._id, locale);
      return orderDiff !== 0 ? orderDiff : a.title.localeCompare(b.title);
    })
    .map((pillar) => ({
      title: pillar.title,
      href: pillarPath(locale, pillar.slug),
      subtopics: pillar.subtopics.map((s) => ({
        title: s.title,
        href: subtopicPath(locale, pillar.slug, s.slug),
      })),
    }));
}

interface AreaCountDoc {
  _id: string;
  title: string;
  slug: string;
  count: number;
}

interface AreaChipCountsResult {
  total: number;
  areas: AreaCountDoc[];
}

export interface BlogAreaChip {
  id: string;
  slug: string;
  title: string;
  count: number;
}

export interface BlogAreaCounts {
  total: number;
  other: number;
  areas: BlogAreaChip[];
}

// Blog category-chip pass — the counts-only twin of getAreaTaxonomy above,
// same PILLAR_ORDER and same _id-suffix matching, but never fetches or
// ships article data (see areaChipCountsQuery's own comment). Pillars
// with zero articles in this locale are dropped entirely, not returned
// with count: 0 — the chip row is built directly from this list, so a
// pillar that isn't here simply doesn't get a chip (empty chips must not
// render). "other" is total minus the sum of what's left after that
// drop, since a dropped pillar's articles still count toward "other" the
// same as any area-less/areaOther article does.
export async function getAreaChipCounts(locale: Locale): Promise<BlogAreaCounts> {
  const result = await sanityFetch<AreaChipCountsResult>(
    areaChipCountsQuery,
    { locale },
    ["article", "pillarPage"],
  );

  const areas = result.areas
    .filter((pillar) => pillar.count > 0)
    .sort((a, b) => {
      const orderDiff = pillarOrderKey(a._id, locale) - pillarOrderKey(b._id, locale);
      return orderDiff !== 0 ? orderDiff : a.title.localeCompare(b.title);
    })
    .map((pillar) => ({
      id: pillar._id,
      slug: pillar.slug,
      title: pillar.title,
      count: pillar.count,
    }));

  const other = result.total - areas.reduce((sum, a) => sum + a.count, 0);

  return { total: result.total, other, areas };
}
