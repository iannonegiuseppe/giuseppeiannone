import { sanityFetch, sanityFetchPublished } from "./client";
import {
  articleBySlugQuery,
  articleCounterpartQuery,
  articlesByAreaCountQuery,
  articlesByAreaQuery,
  articlesCountQuery,
  articlesPageQuery,
  articleSlugsQuery,
  blogIndexQuery,
  heroPortraitQuery,
} from "./queries";
import type { SeoFields } from "./seo";
import type { Image as SanityImage } from "sanity";

// Blog index redesign pass, item 5 — asymmetric pagination: page 1 holds
// the featured article (BlogIndexView's own articles[0]) PLUS
// BLOG_GRID_PAGE_SIZE grid cards below it; every later page holds
// BLOG_GRID_PAGE_SIZE grid cards only, no featured slot (there is no
// "most recent" article left to feature once page 1's already shown it).
// So page 1 fetches BLOG_FEATURED_COUNT + BLOG_GRID_PAGE_SIZE articles,
// every later page fetches BLOG_GRID_PAGE_SIZE. BlogIndexView's own
// featured/grid split (articles[0] vs articles.slice(1), only on page 1)
// is unchanged by this — it already assumed exactly this shape.
export const BLOG_GRID_PAGE_SIZE = 18;
export const BLOG_FEATURED_COUNT = 1;
const BLOG_PAGE_1_SIZE = BLOG_FEATURED_COUNT + BLOG_GRID_PAGE_SIZE; // 19

export interface ArticleListItem {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  cover?: unknown;
  excerpt?: string;
}

export interface ArticlesPageResult {
  articles: ArticleListItem[];
  page: number;
  totalPages: number;
  totalCount: number;
}

function blogTotalPages(totalCount: number): number {
  if (totalCount <= BLOG_PAGE_1_SIZE) return 1;
  return 1 + Math.ceil((totalCount - BLOG_PAGE_1_SIZE) / BLOG_GRID_PAGE_SIZE);
}

// [start, end) is a GROQ array slice — 0-indexed, end-exclusive. Page 1:
// [0, 19). Page 2: [19, 37). Page 3: [37, 55). Etc.
function blogPageRange(page: number): { start: number; end: number } {
  if (page <= 1) return { start: 0, end: BLOG_PAGE_1_SIZE };
  const start = BLOG_PAGE_1_SIZE + (page - 2) * BLOG_GRID_PAGE_SIZE;
  return { start, end: start + BLOG_GRID_PAGE_SIZE };
}

export async function getArticlesPage(
  locale: string,
  page: number,
): Promise<ArticlesPageResult> {
  const totalCount = await sanityFetch<number>(articlesCountQuery, { locale }, [
    "article",
  ]);
  const totalPages = blogTotalPages(totalCount);
  const { start, end } = blogPageRange(page);

  const articles = await sanityFetch<ArticleListItem[]>(
    articlesPageQuery,
    { locale, start, end },
    ["article"],
  );

  return { articles, page, totalPages, totalCount };
}

// Blog category-chip pass — filtered card data for one pillar, fetched
// on demand by the /api/blog-by-area route handler when a chip is
// clicked (never at initial page load — see areaChipCountsQuery's own
// comment for why the chip row itself only ever ships counts). Flat
// page size, no featured slot: unlike getArticlesPage's page 1, a
// filtered view has no "most recent across the whole blog" article to
// single out — it's already a subset.
export async function getArticlesByArea(
  locale: string,
  areaId: string,
  page: number,
): Promise<ArticlesPageResult> {
  const totalCount = await sanityFetch<number>(
    articlesByAreaCountQuery,
    { locale, areaId },
    ["article"],
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / BLOG_GRID_PAGE_SIZE));
  const start = (page - 1) * BLOG_GRID_PAGE_SIZE;
  const end = start + BLOG_GRID_PAGE_SIZE;

  const articles = await sanityFetch<ArticleListItem[]>(
    articlesByAreaQuery,
    { locale, areaId, start, end },
    ["article"],
  );

  return { articles, page, totalPages, totalCount };
}

export function getArticleBySlug(locale: string, slug: string) {
  return sanityFetch<
    | (ArticleListItem & {
        body: unknown;
        tags?: string[];
        seo?: unknown;
        alternates?: unknown;
      })
    | null
  >(articleBySlugQuery, { locale, slug }, ["article", `article:${slug}`]);
}

// Language-switching pass — true iff an article exists with this exact
// slug in otherLocale. See articleCounterpartQuery's own comment for why
// this is a slug match, not a translation.metadata lookup. Tagged
// ["article"] like every other article read, so the revalidation webhook
// invalidates it too (e.g. once a new counterpart is published).
export async function getArticleHasCounterpart(
  otherLocale: string,
  slug: string,
): Promise<boolean> {
  const row = await sanityFetch<{ slug: string } | null>(
    articleCounterpartQuery,
    { otherLocale, slug },
    ["article"],
  );
  return row !== null;
}

export async function getArticleSlugs(locale: string): Promise<string[]> {
  const rows = await sanityFetchPublished<{ slug: string }[]>(
    articleSlugsQuery,
    { locale },
    ["article"],
  );
  return rows.map((row) => row.slug);
}

export async function getArticlesTotalPages(locale: string): Promise<number> {
  const totalCount = await sanityFetchPublished<number>(
    articlesCountQuery,
    { locale },
    ["article"],
  );
  return blogTotalPages(totalCount);
}

export interface BlogIndexData {
  kicker?: string;
  heading?: string;
  headingEmphasisWord?: string;
  intro?: string;
  editorial?: unknown;
  seo?: SeoFields;
}

export function getBlogIndex(locale: string) {
  return sanityFetch<BlogIndexData | null>(blogIndexQuery, { locale }, [
    "blogIndexSection",
  ]);
}

export interface HeroPortraitData {
  photo?: (SanityImage & { alt?: string }) | undefined;
}

// Blog index hero pass — reuses homePage.hero.photo (see heroPortraitQuery's
// own comment for why this, not a separate "contact block" asset).
export function getHeroPortrait(locale: string) {
  return sanityFetch<HeroPortraitData | null>(heroPortraitQuery, { locale }, [
    "homePage",
  ]);
}
