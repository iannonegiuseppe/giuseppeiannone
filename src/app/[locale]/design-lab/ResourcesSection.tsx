import { articlePath, articlesPath, type Locale } from "@/sanity/paths";
import { ArticlePanel, type ResourceArticle } from "./ArticlePanel";
import styles from "./design-lab.module.scss";

export type RealArticle = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
};

// LAB MOCK — remove when the article schema has real cover/category
// fields (currently absent entirely — see this pass's final report,
// schema changes are out of scope here) and real published articles
// exist behind them. Verified against the actual Sanity dataset: the
// live query (latestArticlesQuery) currently returns 0 published
// "article" documents, so this full mock set stands in entirely, per
// spec's own "0 posts -> mock" fallback. Uses existing repo images only.
const MOCK_COVERS = ["/design-lab/06.webp", "/design-lab/08.webp", "/design-lab/13.webp"];
const MOCK_CATEGORIES = ["Ansia", "Stress", "Cambiamenti di vita"];

const FULL_MOCK_ARTICLES: ResourceArticle[] = [
  {
    _id: "mock-1",
    title: "Riconoscere i primi segnali dell'ansia",
    slug: "riconoscere-i-primi-segnali-dellansia",
    publishedAt: "2026-01-30",
    cover: MOCK_COVERS[0]!,
    category: MOCK_CATEGORIES[0]!,
  },
  {
    _id: "mock-2",
    title: "Quando lo stress diventa cronico",
    slug: "quando-lo-stress-diventa-cronico",
    publishedAt: "2026-01-27",
    cover: MOCK_COVERS[1]!,
    category: MOCK_CATEGORIES[1]!,
  },
  {
    _id: "mock-3",
    title: "Affrontare un cambiamento di vita importante",
    slug: "affrontare-un-cambiamento-di-vita",
    publishedAt: "2026-01-24",
    cover: MOCK_COVERS[2]!,
    category: MOCK_CATEGORIES[2]!,
  },
];

// Real articles (if any exist) get a cycled mock cover/category attached
// — the schema has nowhere real to source those from yet. Only when
// there are ZERO real articles does the fully-fake mock set (fake
// title/slug/date too) stand in, matching the spec's literal "0 posts"
// fallback rule.
function resolveResourceArticles(realArticles: RealArticle[]): {
  articles: ResourceArticle[];
  usedFullMock: boolean;
} {
  if (realArticles.length === 0) {
    return { articles: FULL_MOCK_ARTICLES, usedFullMock: true };
  }
  return {
    articles: realArticles.map((article, i) => ({
      _id: article._id,
      title: article.title,
      slug: article.slug,
      publishedAt: article.publishedAt ?? FULL_MOCK_ARTICLES[0]!.publishedAt,
      cover: MOCK_COVERS[i % MOCK_COVERS.length]!,
      category: MOCK_CATEGORIES[i % MOCK_CATEGORIES.length]!,
    })),
    usedFullMock: false,
  };
}

// Single-block refinement pass: replaces the old ivory 3-card GroupBCard
// grid with a full-bleed article triptych sourced from live Sanity data
// (see queries.ts's latestArticlesQuery). Degradation is structural, not
// just visual: 3/2/1 real articles render 3/2/1 panels at proportional
// widths (a CSS grid with grid-auto-columns: 1fr does this without
// per-count rules); 0 renders nothing at all (no header, no band) — see
// the early return below.
export function ResourcesSection({
  kicker,
  heading,
  locale,
  realArticles,
  allArticlesLabel,
}: {
  kicker: string;
  heading: string;
  locale: string;
  realArticles: RealArticle[];
  allArticlesLabel: string;
}) {
  const typedLocale = locale as Locale;
  const { articles } = resolveResourceArticles(realArticles);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className={styles.resourcesSection} data-lab-section="resources">
      <div className={styles.resourcesHeader}>
        <p className={styles.resourcesKicker}>
          <span className={styles.resourcesKickerRule} aria-hidden="true" />
          {kicker}
          <span className={styles.resourcesKickerRule} aria-hidden="true" />
        </p>
        <h2 className={styles.resourcesHeading}>{heading}</h2>
      </div>
      <div className={styles.resourcesTriptych} data-panel-count={articles.length}>
        {articles.map((article) => (
          <ArticlePanel key={article._id} article={article} href={articlePath(typedLocale, article.slug)} />
        ))}
      </div>
      <div className={styles.resourcesAllButtonWrap}>
        {/* The listing page itself doesn't exist yet — this 404s in the
            lab for now, same policy as the individual article links
            above (no "#" placeholder), per spec. */}
        {/* .btnSecondary alone, no dedicated modifier class — every bit
            of positioning (centered, 48px gap) lives on the wrapper div
            above, so there's nothing left for a per-button rule to do. */}
        <a href={articlesPath(typedLocale)} className={styles.btnSecondary}>
          {allArticlesLabel}
        </a>
      </div>
    </section>
  );
}
