import { sanityFetch, sanityFetchPublished } from "./client";
import {
  articleBySlugQuery,
  articlesCountQuery,
  articlesPageQuery,
  articleSlugsQuery,
} from "./queries";

// 20/page keeps each static page's payload light (cover + excerpt only,
// no body) while keeping the total page count reasonable for
// generateStaticParams — 468 articles is 24 pages at this size, not
// hundreds of single-article pages like a smaller size would produce.
export const ARTICLES_PAGE_SIZE = 20;

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

// $start/$end are a GROQ array slice: 0-indexed, end-exclusive.
export async function getArticlesPage(
  locale: string,
  page: number,
): Promise<ArticlesPageResult> {
  const totalCount = await sanityFetch<number>(articlesCountQuery, { locale }, [
    "article",
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / ARTICLES_PAGE_SIZE));
  const start = (page - 1) * ARTICLES_PAGE_SIZE;
  const end = start + ARTICLES_PAGE_SIZE;

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
  return Math.max(1, Math.ceil(totalCount / ARTICLES_PAGE_SIZE));
}
