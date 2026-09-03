"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Image as SanityImage } from "sanity";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import type { ArticleListItem, ArticlesPageResult } from "@/sanity/articles";
import { articleCoverUrl } from "@/sanity/image";
import { articlePath, articlesPath, type Locale } from "@/sanity/paths";
import { CategoryChips, type CategoryChipData } from "./CategoryChips";
import styles from "./blogIndex.module.scss";

function formatDate(publishedAt: string | null, locale: string) {
  if (!publishedAt) return null;
  return new Date(publishedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ArticleCard({
  article,
  locale,
  large,
}: {
  article: ArticleListItem;
  locale: Locale;
  large?: boolean;
}) {
  // One shared cover source for both card shapes — see articleCoverUrl's
  // own comment. It returns null for exactly the case `dims` was guarding
  // (an asset ref with no parseable dimensions), so guarding on the URL
  // covers both and keeps the two in step.
  const coverSrc = article.cover ? articleCoverUrl(article.cover as SanityImage) : null;
  const date = formatDate(article.publishedAt, locale);
  const href = articlePath(locale, article.slug);

  if (large) {
    return (
      <RevealOnScroll>
        <Link href={href} className={styles.featured}>
          <div className={styles.featuredCover}>
            {coverSrc ? (
              <Image
                src={coverSrc}
                alt=""
                fill
                sizes="(min-width: 64rem) 50vw, 100vw"
                className={styles.featuredCoverImg}
                priority
              />
            ) : null}
          </div>
          <div className={styles.featuredText}>
            <h2 className={styles.featuredTitle}>{article.title}</h2>
            {article.excerpt ? <p className={styles.featuredExcerpt}>{article.excerpt}</p> : null}
            <div className={styles.featuredMeta}>
              {date ? (
                <time dateTime={article.publishedAt ?? undefined}>{date}</time>
              ) : (
                <span />
              )}
              <span className={styles.featuredRead}>
                {locale === "en" ? "Read article" : "Leggi l'articolo"}
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        </Link>
      </RevealOnScroll>
    );
  }

  return (
    <RevealOnScroll>
      <Link href={href} className={styles.card}>
        <div className={styles.cardImage}>
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt=""
              fill
              sizes="(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw"
              className={styles.cardImg}
            />
          ) : null}
        </div>
        <p className={styles.cardTitle}>{article.title}</p>
        {article.excerpt ? <p className={styles.cardExcerpt}>{article.excerpt}</p> : null}
        <div className={styles.cardMeta}>
          {date ? <time dateTime={article.publishedAt ?? undefined}>{date}</time> : <span />}
          <span className={styles.cardRead}>
            {locale === "en" ? "Read" : "Leggi"}
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </RevealOnScroll>
  );
}

// Route-based pagination — unchanged from today, real <Link> navigations,
// only ever shown for the unfiltered ("Tutti"/All) view so the existing
// statically-generated /blog/page/N URLs keep working exactly as they do
// now.
function RoutePagination({
  locale,
  pageNumber,
  totalPages,
}: {
  locale: Locale;
  pageNumber: number;
  totalPages: number;
}) {
  function hrefFor(n: number) {
    return n === 1 ? articlesPath(locale) : `${articlesPath(locale)}/page/${n}`;
  }

  const windowSize = 5;
  let start = Math.max(1, pageNumber - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav aria-label={locale === "en" ? "Pagination" : "Paginazione"} className={styles.pagination}>
      <Link
        href={hrefFor(Math.max(1, pageNumber - 1))}
        aria-disabled={pageNumber === 1}
        className={`${styles.pageArrow} ${pageNumber === 1 ? styles.pageArrowDisabled : ""}`}
        aria-label={locale === "en" ? "Previous page" : "Pagina precedente"}
      >
        ‹
      </Link>
      {pages.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          className={`${styles.pageNumber} ${n === pageNumber ? styles.pageNumberActive : ""}`}
          aria-current={n === pageNumber ? "page" : undefined}
        >
          {n}
        </Link>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, pageNumber + 1))}
        aria-disabled={pageNumber === totalPages}
        className={`${styles.pageArrow} ${pageNumber === totalPages ? styles.pageArrowDisabled : ""}`}
        aria-label={locale === "en" ? "Next page" : "Pagina successiva"}
      >
        ›
      </Link>
    </nav>
  );
}

// Local (client-state) pagination for a filtered view — Prev/Next only,
// no page numbers (filtered sets are small, see the chip counts), never a
// route change: clicking these only updates local state, same rule as the
// chips themselves.
function LocalPagination({
  locale,
  page,
  totalPages,
  onChange,
}: {
  locale: Locale;
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={locale === "en" ? "Pagination" : "Paginazione"} className={styles.pagination}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={`${styles.pageArrow} ${page === 1 ? styles.pageArrowDisabled : ""}`}
        aria-label={locale === "en" ? "Previous page" : "Pagina precedente"}
      >
        ‹
      </button>
      <span className={styles.pageNumberActive} aria-current="page">
        {page}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={`${styles.pageArrow} ${page === totalPages ? styles.pageArrowDisabled : ""}`}
        aria-label={locale === "en" ? "Next page" : "Pagina successiva"}
      >
        ›
      </button>
    </nav>
  );
}

export interface BlogFilterableSectionProps {
  locale: Locale;
  pageNumber: number;
  totalPages: number;
  featured: ArticleListItem | undefined;
  gridArticles: ArticleListItem[];
  chips: CategoryChipData[];
}

export function BlogFilterableSection({
  locale,
  pageNumber,
  totalPages,
  featured,
  gridArticles,
  chips,
}: BlogFilterableSectionProps) {
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);
  const [filteredPage, setFilteredPage] = useState(1);
  const [filteredResult, setFilteredResult] = useState<ArticlesPageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const cacheRef = useRef(new Map<string, ArticlesPageResult>());
  const requestIdRef = useRef(0);

  const allLabel = locale === "en" ? "All" : "Tutti";
  const emptyStateMessage =
    locale === "en" ? "No articles yet in this category." : "Nessun articolo ancora in questa categoria.";

  const fetchFiltered = useCallback(
    async (areaId: string, page: number) => {
      const cacheKey = `${areaId}:${page}`;
      const cached = cacheRef.current.get(cacheKey);
      const requestId = ++requestIdRef.current;

      if (cached) {
        setFilteredResult(cached);
        setLoading(false);
      } else {
        setLoading(true);
        const res = await fetch(
          `/api/blog-by-area?locale=${encodeURIComponent(locale)}&areaId=${encodeURIComponent(areaId)}&page=${page}`,
        );
        if (requestId !== requestIdRef.current) return; // a newer request superseded this one
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data: ArticlesPageResult = await res.json();
        cacheRef.current.set(cacheKey, data);
        setFilteredResult(data);
        setLoading(false);
      }
    },
    [locale],
  );

  useEffect(() => {
    if (activeAreaId === null) {
      setLiveMessage("");
      return;
    }
    fetchFiltered(activeAreaId, filteredPage);
  }, [activeAreaId, filteredPage, fetchFiltered]);

  useEffect(() => {
    if (activeAreaId === null || loading) return;
    const count = filteredResult?.totalCount ?? 0;
    const chipTitle = chips.find((c) => c.id === activeAreaId)?.title ?? "";
    setLiveMessage(
      locale === "en"
        ? `${count} article${count === 1 ? "" : "s"} in ${chipTitle}`
        : `${count} articol${count === 1 ? "o" : "i"} in ${chipTitle}`,
    );
  }, [activeAreaId, filteredResult, loading, chips, locale]);

  function handleSelect(areaId: string | null) {
    setActiveAreaId(areaId);
    setFilteredPage(1);
    if (areaId === null) {
      setFilteredResult(null);
    }
  }

  const isFiltered = activeAreaId !== null;
  const filteredArticles = filteredResult?.articles ?? [];
  const filteredTotalPages = filteredResult?.totalPages ?? 1;

  return (
    <>
      <CategoryChips chips={chips} allLabel={allLabel} activeId={activeAreaId} onSelect={handleSelect} />
      <div id="blog-filter-status" aria-live="polite" className={styles.visuallyHidden}>
        {liveMessage}
      </div>

      {isFiltered ? (
        <div className={styles.filteredWrap} data-loading={loading ? "true" : undefined}>
          {filteredArticles.length > 0 ? (
            <div className={styles.grid}>
              {filteredArticles.map((article) => (
                <ArticleCard key={article._id} article={article} locale={locale} />
              ))}
            </div>
          ) : !loading ? (
            <p className={styles.cardExcerpt}>{emptyStateMessage}</p>
          ) : null}
          <LocalPagination
            locale={locale}
            page={filteredPage}
            totalPages={filteredTotalPages}
            onChange={setFilteredPage}
          />
        </div>
      ) : (
        <>
          {featured ? <ArticleCard article={featured} locale={locale} large /> : null}
          {gridArticles.length > 0 ? (
            <div className={styles.grid}>
              {gridArticles.map((article) => (
                <ArticleCard key={article._id} article={article} locale={locale} />
              ))}
            </div>
          ) : null}
          {totalPages > 1 ? (
            <RoutePagination locale={locale} pageNumber={pageNumber} totalPages={totalPages} />
          ) : null}
        </>
      )}
    </>
  );
}
