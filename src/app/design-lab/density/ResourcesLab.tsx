import Image from "next/image";
import type { Image as SanityImage } from "sanity";
import { articlePath, articlesPath, type Locale } from "@/sanity/paths";
import { urlFor } from "@/sanity/image";
import { plainTextFromPortableText } from "@/sanity/jsonLd";
import styles from "./resourcesLab.module.scss";

// Overlay-hero pass — forked from src/components/ResourcesSection.tsx +
// ResourceColumn.tsx + FeaturedResource.tsx (all three shared with
// production, rendered directly and unforked on /design-lab before this
// pass — confirmed by reading DesignLabHomepage.tsx's own previous
// import). None of the three real files are touched: this is a new,
// independent component tree. The real files' own field gaps (no cover,
// no excerpt, no category on the article schema) are why this pass had
// to add `cover` to the real schema (additive only, approved) and derive
// the excerpt from `body` via the existing, unmodified
// plainTextFromPortableText (src/sanity/jsonLd.ts) rather than a new
// field — "pulled automatically from the opening lines," per spec.

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
  publishedAt: string;
  category: string;
  excerpt?: string;
  cover?: SanityImage;
};

const MOCK_CATEGORIES: Record<Locale, [string, string, string, string]> = {
  it: ["Ansia", "Stress", "Cambiamenti di vita", "Rapporti"],
  en: ["Anxiety", "Stress", "Life changes", "Relationships"],
};

// Same four mock entries ResourcesSection.tsx already carries (title/
// slug/date/excerpt copy is IDENTICAL, including every [segnaposto]/
// [placeholder] marker — not touched, per explicit instruction). No cover
// assigned: there is no honest photo to attach to invented mock content
// — see this pass's own report on why the preview currently shows the
// greige fallback for all four, and that this is a fact about the
// dataset (zero real articles exist at all), not a layout choice.
const FULL_MOCK_ARTICLES: Record<Locale, ResolvedArticle[]> = {
  it: [
    {
      _id: "mock-1",
      title: "Riconoscere i primi segnali dell'ansia",
      slug: "riconoscere-i-primi-segnali-dellansia",
      publishedAt: "2026-01-30",
      category: MOCK_CATEGORIES.it[0],
      excerpt:
        "[segnaposto] Come distinguere una preoccupazione passeggera da un campanello d'allarme che merita attenzione, con qualche primo passo pratico.",
    },
    {
      _id: "mock-2",
      title: "Quando lo stress diventa cronico",
      slug: "quando-lo-stress-diventa-cronico",
      publishedAt: "2026-01-27",
      category: MOCK_CATEGORIES.it[1],
      excerpt:
        "[segnaposto] I segnali fisici ed emotivi che indicano che lo stress non è più solo una fase passeggera, e cosa fare a riguardo.",
    },
    {
      _id: "mock-3",
      title: "Affrontare un cambiamento di vita importante",
      slug: "affrontare-un-cambiamento-di-vita",
      publishedAt: "2026-01-24",
      category: MOCK_CATEGORIES.it[2],
      excerpt:
        "[segnaposto] Strumenti pratici per attraversare una transizione importante senza perdere il proprio equilibrio.",
    },
    {
      _id: "mock-4",
      title: "Comunicare i propri bisogni senza sensi di colpa",
      slug: "comunicare-i-propri-bisogni-senza-sensi-di-colpa",
      publishedAt: "2026-01-20",
      category: MOCK_CATEGORIES.it[3],
      excerpt:
        "[segnaposto] Perché dire di no è spesso più difficile del previsto, e come farlo restando in relazione con l'altro.",
    },
  ],
  en: [
    {
      _id: "mock-1",
      title: "Recognizing the first signs of anxiety",
      slug: "recognizing-the-first-signs-of-anxiety",
      publishedAt: "2026-01-30",
      category: MOCK_CATEGORIES.en[0],
      excerpt:
        "[placeholder] How to tell a passing worry apart from a warning sign worth paying attention to, with a few practical first steps.",
    },
    {
      _id: "mock-2",
      title: "When stress becomes chronic",
      slug: "when-stress-becomes-chronic",
      publishedAt: "2026-01-27",
      category: MOCK_CATEGORIES.en[1],
      excerpt:
        "[placeholder] The physical and emotional signs that stress is no longer just a passing phase, and what to do about it.",
    },
    {
      _id: "mock-3",
      title: "Facing a major life change",
      slug: "facing-a-major-life-change",
      publishedAt: "2026-01-24",
      category: MOCK_CATEGORIES.en[2],
      excerpt:
        "[placeholder] Practical tools for getting through a major transition without losing your own footing.",
    },
    {
      _id: "mock-4",
      title: "Saying what you need without the guilt",
      slug: "saying-what-you-need-without-the-guilt",
      publishedAt: "2026-01-20",
      category: MOCK_CATEGORIES.en[3],
      excerpt:
        "[placeholder] Why saying no is often harder than it should be, and how to do it without losing the relationship.",
    },
  ],
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
  if (realArticles.length === 0) {
    return FULL_MOCK_ARTICLES[locale];
  }
  const categories = MOCK_CATEGORIES[locale];
  return realArticles.map((article, i) => ({
    _id: article._id,
    title: article.title,
    slug: article.slug,
    publishedAt: article.publishedAt ?? FULL_MOCK_ARTICLES[locale][0]!.publishedAt,
    category: categories[i % categories.length]!,
    excerpt: deriveExcerpt(article.body),
    cover: article.cover,
  }));
}

function formatArticleDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// Cover request caps — deliberately different per slot (hero is full-
// width, cards are a third): requesting the SAME source size for both
// would either under-serve the hero or over-serve the cards. Next's own
// responsive pipeline (sizes prop below, already configured in
// next.config for cdn.sanity.io) generates the actual per-viewport
// variant from whichever of these two capped sources it's given — this
// cap is the ceiling Sanity itself resizes to, not the final delivered
// size.
const HERO_COVER_WIDTH = 2000;
const CARD_COVER_WIDTH = 800;

function coverUrl(cover: SanityImage | undefined, width: number): string | undefined {
  if (!cover) return undefined;
  return urlFor(cover).width(width).format("webp").quality(80).url();
}

function HeroFallback({ locale, article, href }: { locale: Locale; article: ResolvedArticle; href: string }) {
  return (
    <a href={href} className={styles.heroFallback} aria-label={article.title}>
      <div className={styles.heroFallbackImage} aria-hidden="true">
        <span>{locale === "it" ? "Immagine [segnaposto]" : "Image [placeholder]"}</span>
      </div>
      <div className={styles.heroFallbackText}>
        <p className={styles.heroMeta}>
          {article.category} · {formatArticleDate(article.publishedAt, locale)}
        </p>
        <h3 className={styles.heroTitle}>{article.title}</h3>
        {article.excerpt ? <p className={styles.heroExcerpt}>{article.excerpt}</p> : null}
      </div>
    </a>
  );
}

function Hero({ locale, article, href }: { locale: Locale; article: ResolvedArticle; href: string }) {
  const src = coverUrl(article.cover, HERO_COVER_WIDTH);
  if (!src) return <HeroFallback locale={locale} article={article} href={href} />;

  return (
    <a href={href} className={styles.hero} aria-label={article.title}>
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className={styles.heroImage}
      />
      <div className={styles.heroTextOverlay}>
        <p className={styles.heroMeta}>
          {article.category} · {formatArticleDate(article.publishedAt, locale)}
        </p>
        <h3 className={styles.heroTitle}>{article.title}</h3>
        {article.excerpt ? <p className={styles.heroExcerpt}>{article.excerpt}</p> : null}
        <span className={styles.heroReadMore} aria-hidden="true">
          {locale === "it" ? "Leggi l'articolo" : "Read the article"}
          <span>→</span>
        </span>
      </div>
    </a>
  );
}

function Card({ locale, article, href }: { locale: Locale; article: ResolvedArticle; href: string }) {
  const src = coverUrl(article.cover, CARD_COVER_WIDTH);

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
        {article.category} · {formatArticleDate(article.publishedAt, locale)}
      </p>
      <h3 className={styles.cardTitle}>{article.title}</h3>
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
  const articles = resolveArticles(realArticles, typedLocale);
  if (articles.length === 0) return null;

  const [featured, ...rest] = articles;
  const cards = rest.slice(0, 3);

  return (
    <section className={styles.resourcesSection} data-lab-section="resources-lab">
      {/* Header row — unchanged from ResourcesSection.tsx's own layout,
          reproduced (not imported) since this whole tree is now
          independent. */}
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

      {featured ? <Hero locale={typedLocale} article={featured} href={articlePath(typedLocale, featured.slug)} /> : null}

      {cards.length > 0 ? (
        <div className={styles.cardsGrid} data-card-count={cards.length}>
          {cards.map((article) => (
            <Card key={article._id} locale={typedLocale} article={article} href={articlePath(typedLocale, article.slug)} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
