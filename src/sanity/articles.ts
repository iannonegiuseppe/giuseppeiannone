import { sanityFetch, sanityFetchPublished } from "./client";
import {
  articleBySlugQuery,
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
