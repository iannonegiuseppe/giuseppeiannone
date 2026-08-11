import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import type { Image as SanityImage } from "sanity";
import { ContactBlock } from "@/components/ContactBlock";
import { LightPortraitHero } from "@/components/LightPortraitHero";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { sanityFetch } from "@/sanity/client";
import {
  getArticlesPage,
  getBlogIndex,
  getHeroPortrait,
  type ArticleListItem,
} from "@/sanity/articles";
import { imageDimensions, urlFor } from "@/sanity/image";
import { articlePath, articlesPath, type Locale } from "@/sanity/paths";
import { contactSectionQuery } from "@/sanity/queries";
import { getSiteSettings } from "@/sanity/seo";
import { BLOG_LIST_SECTION_ID, BlogPaginationScrollReset } from "./BlogPaginationScrollReset";
import {
  blogEditorialPortableTextComponents,
  splitEditorialIntoColumns,
  type EditorialBlock,
} from "./blogEditorialPortableText";
import styles from "./blogIndex.module.scss";

interface ContactSectionCopy {
  contactSection?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    photoCaption?: string;
  };
  googleProfileLabel?: string;
}

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

// Same photo the homepage's own ContactBlock invocation and the article
// page's end-of-article ContactBlock both use — see article page.tsx's
// own comment for why this hardcoded design-lab path (not a Sanity image)
// is the honest, non-forked choice here too.
const CONTACT_PHOTO_URL = "/design-lab/photos/09.webp";
const CONTACT_PHOTO_ALT = "Giuseppe Iannone, ritratto.";

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
  const dims = article.cover ? imageDimensions(article.cover as SanityImage) : null;
  const date = formatDate(article.publishedAt, locale);
  const href = articlePath(locale, article.slug);

  if (large) {
    // Item 4 — was two separate nested <Link>s (cover + title, each its
    // own hover target, plus a THIRD nested link for "Read article" —
    // invalid HTML, an <a> can't contain another <a>). One outer Link now
    // wraps the whole item, same single-hover-target shape the grid cards
    // already use — hovering the image side triggers the title colour and
    // image scale exactly like hovering the text side does, because both
    // are just descendants of the one hoverable box now. "Read article"
    // is a plain span (not its own link), matching .cardRead below.
    return (
      <RevealOnScroll>
        <Link href={href} className={styles.featured}>
          <div className={styles.featuredCover}>
            {article.cover && dims ? (
              <Image
                src={urlFor(article.cover as SanityImage).width(1200).url()}
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
          {article.cover && dims ? (
            <Image
              src={urlFor(article.cover as SanityImage).width(800).url()}
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

function Pagination({
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

  // Bounded window of page numbers around the current one — a flat list
  // of up to `totalPages` links (24 at the current article count) would
  // be unusable; caps at 5 visible numbers, same idea as the reference's
  // own compact « 1 2 3 » treatment.
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

// Item 2 (round 4) — full-width, two reading columns at lg (one below).
// splitEditorialIntoColumns (blogEditorialPortableText.tsx) does the
// actual grouping/splitting so a heading can never be orphaned from its
// own paragraphs at the column break — see that function's own comment.
// The .container global class is applied on the SAME element as the
// column grid (styles.editorialColumns), not a separate wrapper.
function EditorialSection({ editorial }: { editorial: EditorialBlock[] }) {
  const { columnOne, columnTwo } = splitEditorialIntoColumns(editorial);

  return (
    <section className={styles.editorial}>
      <RevealOnScroll className={`container ${styles.editorialColumns}`}>
        <div className={styles.editorialColumn}>
          <PortableText value={columnOne as never} components={blogEditorialPortableTextComponents} />
        </div>
        <div className={styles.editorialColumn}>
          <PortableText value={columnTwo as never} components={blogEditorialPortableTextComponents} />
        </div>
      </RevealOnScroll>
    </section>
  );
}

export async function BlogIndexView({
  locale,
  pageNumber,
}: {
  locale: string;
  pageNumber: number;
}) {
  const typedLocale = locale as Locale;

  const [{ articles, totalPages }, blogIndex, heroPortrait, contactCopy, siteSettings] =
    await Promise.all([
      getArticlesPage(locale, pageNumber),
      getBlogIndex(locale),
      getHeroPortrait(locale),
      getContactSectionCopy(locale),
      getSiteSettings(locale),
    ]);

  // Item — featured article is the single most recent article, page 1
  // only (order is already publishedAt desc, so articles[0] IS the most
  // recent on page 1; on later pages there is no "most recent" article to
  // feature, so the dark section goes straight into the grid). Sliced
  // once here so the featured article can never also render in the grid.
  const featured = pageNumber === 1 ? articles[0] : undefined;
  const gridArticles = pageNumber === 1 ? articles.slice(1) : articles;

  const contactSection = contactCopy?.contactSection;

  return (
    <>
      <BlogPaginationScrollReset />
      <main className={styles.page}>
        {/* 1. HERO — light ivory. Extracted to LightPortraitHero.tsx
            (/faq build pass, shared with that page) — see that file's own
            top comment for exactly what did and didn't change. */}
        <LightPortraitHero
          kicker={blogIndex?.kicker ?? "Blog"}
          heading={blogIndex?.heading ?? "Blog"}
          headingEmphasisWord={blogIndex?.headingEmphasisWord}
          intro={blogIndex?.intro}
          photo={heroPortrait?.photo}
          priority
        />

        {/* 2. DARK SECTION — featured + grid + pagination */}
        <section id={BLOG_LIST_SECTION_ID} className={styles.listSection}>
          <div className="container">
            {featured ? <ArticleCard article={featured} locale={typedLocale} large /> : null}
            {gridArticles.length > 0 ? (
              <div className={styles.grid}>
                {gridArticles.map((article) => (
                  <ArticleCard key={article._id} article={article} locale={typedLocale} />
                ))}
              </div>
            ) : null}
            {totalPages > 1 ? (
              <Pagination locale={typedLocale} pageNumber={pageNumber} totalPages={totalPages} />
            ) : null}
          </div>
        </section>

        {/* 3. CONTACT FORM — full width, the real shared ContactBlock */}
        <ContactBlock
          kicker={contactSection?.kicker ?? ""}
          heading={contactSection?.heading ?? ""}
          headingEmphasisWord={contactSection?.headingEmphasisWord}
          photoCaption={contactSection?.photoCaption ?? ""}
          googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
          googleProfileUrl={siteSettings?.googleProfileUrl}
          locale={typedLocale}
          photoUrl={CONTACT_PHOTO_URL}
          photoAlt={CONTACT_PHOTO_ALT}
        />

        {/* 4. EDITORIAL BLOCK — light ivory, full container width, two columns at lg */}
        {blogIndex?.editorial ? (
          <EditorialSection editorial={blogIndex.editorial as EditorialBlock[]} />
        ) : null}
      </main>
    </>
  );
}
