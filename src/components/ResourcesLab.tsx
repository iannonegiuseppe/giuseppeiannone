import Image from "next/image";
import type { Image as SanityImage } from "sanity";
import { articlePath, articlesPath, type Locale } from "@/sanity/paths";
import { urlFor } from "@/sanity/image";
import { plainTextFromPortableText } from "@/sanity/jsonLd";
import styles from "./resourcesLab.module.scss";

// Forked from src/components/ResourcesSection.tsx + ResourceColumn.tsx +
// FeaturedResource.tsx (all three shared with production, rendered
// directly and unforked on /design-lab before the original overlay-hero
// pass — confirmed by reading DesignLabHomepage.tsx's own previous
// import). None of the three real files are touched: this is a new,
// independent component tree. The real files' own field gaps (no cover,
// no excerpt, no category on the article schema) are why this pass had
// to add `cover` to the real schema (additive only, approved) and derive
// the excerpt from `body` via the existing, unmodified
// plainTextFromPortableText (src/sanity/jsonLd.ts) rather than a new
// field — "pulled automatically from the opening lines," per spec.
//
// Three-cards-only pass: the overlay hero (featured article, scrim,
// hero-sized cover) is gone entirely — see this pass's own report. The
// block is now the header row plus up to three cards, most-recent-first.

export type RealArticleLab = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  cover?: SanityImage;
  body?: unknown;
};

type ResolvedArticle = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  category: string;
  excerpt?: string;
  cover?: SanityImage;
};

// Still real and still needed: articles have no stored category field, so
// this rotates a locale-appropriate label across whichever real articles
// resolveArticles is given. Not part of the removed mock-article fallback
// below — that was a separate thing (fake articles standing in for missing
// ones), this is a display label for genuinely real ones.
const MOCK_CATEGORIES: Record<Locale, [string, string, string, string]> = {
  it: ["Ansia", "Stress", "Cambiamenti di vita", "Rapporti"],
  en: ["Anxiety", "Stress", "Life changes", "Relationships"],
};

// Excerpt cap — plainTextFromPortableText returns the WHOLE body as text;
// nothing needs more than ~300 characters before line-clamp takes over
// visually anyway, so this keeps the payload sent to the client small
// rather than shipping a full article's text just to clip it in CSS.
const EXCERPT_CHAR_CAP = 300;

function deriveExcerpt(body: unknown): string | undefined {
  const text = plainTextFromPortableText(body).trim();
  if (!text) return undefined;
  if (text.length <= EXCERPT_CHAR_CAP) return text;
  return text.slice(0, EXCERPT_CHAR_CAP).trimEnd() + "…";
}

function resolveArticles(realArticles: RealArticleLab[], locale: Locale): ResolvedArticle[] {
  const categories = MOCK_CATEGORIES[locale];
  return realArticles.map((article, i) => ({
    _id: article._id,
    title: article.title,
    slug: article.slug,
    publishedAt: article.publishedAt,
    category: categories[i % categories.length]!,
    excerpt: deriveExcerpt(article.body),
    cover: article.cover,
  }));
}

// null publishedAt is a real, if rare, possibility — the article schema
// doesn't require it — and there's no honest date to invent for one now
// that the mock article this used to fall back to is gone. Card below
// just omits the date rather than showing a fabricated one.
function formatArticleDate(iso: string | null, locale: Locale): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// Card-sized cover request only now — the hero-sized cap (2000px, for
// the full-width overlay image) is gone along with the hero itself.
// Next's own responsive pipeline (sizes prop below, already configured
// in next.config for cdn.sanity.io) generates the actual per-viewport
// variant from this capped source — the cap is the ceiling Sanity itself
// resizes to, not the final delivered size.
const CARD_COVER_WIDTH = 800;

function coverUrl(cover: SanityImage | undefined, width: number): string | undefined {
  if (!cover) return undefined;
  return urlFor(cover).width(width).format("webp").quality(80).url();
}

function Card({ locale, article, href }: { locale: Locale; article: ResolvedArticle; href: string }) {
  const src = coverUrl(article.cover, CARD_COVER_WIDTH);
  const date = formatArticleDate(article.publishedAt, locale);

  return (
    <a href={href} className={styles.card} aria-label={article.title}>
      {src ? (
        <div className={styles.cardImageWrap}>
          <Image src={src} alt="" fill sizes="(min-width: 48rem) 33vw, 100vw" className={styles.cardImage} />
        </div>
      ) : (
        <div className={styles.cardImagePlaceholder} aria-hidden="true">
          <span>{locale === "it" ? "Immagine [segnaposto]" : "Image [placeholder]"}</span>
        </div>
      )}
      <p className={styles.cardMeta}>
        {date ? `${article.category} · ${date}` : article.category}
      </p>
      <h3 className={styles.cardTitle}>{article.title}</h3>
      {article.excerpt ? <p className={styles.cardExcerpt}>{article.excerpt}</p> : null}
    </a>
  );
}

export function ResourcesLab({
  kicker,
  heading,
  locale,
  realArticles,
  allArticlesLabel,
}: {
  kicker: string;
  heading: string;
  locale: string;
  realArticles: RealArticleLab[];
  allArticlesLabel: string;
}) {
  const typedLocale = locale as Locale;
  // Three most recent only — no CMS pick, no featured flag. Any fourth or
  // later real article simply doesn't render here; "Tutte le risorse" is
  // what leads to the rest.
  const cards = resolveArticles(realArticles, typedLocale).slice(0, 3);

  // A locale with zero real articles renders nothing at all — no heading,
  // no empty grid, no "coming soon" placeholder. This used to fall back
  // to FULL_MOCK_ARTICLES (four invented articles, [placeholder] excerpts
  // and all) instead of hitting this case; that fallback is gone, not
  // routed around.
  if (cards.length === 0) return null;

  return (
    <section className={styles.resourcesSection} data-lab-section="resources-lab">
      <div className={styles.resourcesHeader}>
        <p className={styles.resourcesKicker}>
          <span className={styles.resourcesKickerRule} aria-hidden="true" />
          {kicker}
        </p>
        <h2 className={styles.resourcesHeading}>{heading}</h2>
        <a href={articlesPath(typedLocale)} className={styles.resourcesAllLink}>
          {allArticlesLabel}
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className={styles.cardsGrid} data-card-count={cards.length}>
        {cards.map((article) => (
          <Card key={article._id} locale={typedLocale} article={article} href={articlePath(typedLocale, article.slug)} />
        ))}
      </div>
    </section>
  );
}
