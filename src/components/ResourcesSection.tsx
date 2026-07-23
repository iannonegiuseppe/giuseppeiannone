import { articlePath, articlesPath, type Locale } from "@/sanity/paths";
import { FeaturedResource } from "./FeaturedResource";
import { ResourceColumn, type ResourceArticle } from "./ResourceColumn";
import styles from "./ResourcesSection.module.scss";

export type RealArticle = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
};

// Variant D rebuild — HONESTY-RULE FLAG: read the article schema directly
// before writing any of this (src/sanity/schemaTypes/documents/article.ts)
// — it has title/slug/publishedAt/body/seo/language only, no excerpt or
// category field. Per this pass's own explicit instruction ("if not,
// report — do not invent a field silently"), neither is added here:
// category keeps the exact same cycled-mock behavior real articles
// already had (see resolveResourceArticles below), and excerpt is
// mock-only — undefined for real articles until the schema actually
// grows one (see ResourceColumn.tsx's own conditional render). Flagged
// again in this pass's final report as a real follow-up, not something
// silently worked around.
//
// Locale-aware mock set — the OLD full-mock fallback was Italian-only
// regardless of `locale` (a pre-existing gap, not introduced by this
// pass — the component never even read locale before choosing mock
// copy), so it rendered the same Italian titles/categories on /en too.
// This pass's own spec explicitly asks for Italian excerpts AND "EN
// equivalents," which can't honestly be done half-way (a bilingual
// excerpt sitting under an Italian-only title/category would read as
// broken on /en) — so the whole mock set is now keyed by locale, fixing
// that gap as a side effect rather than compounding it.
// Featured pass: a 4th entry was added below (featured + 3 columns needs
// 4 total) — one more category slot to go with it. "Rapporti" ("Rapporti
// interpersonali" would run long as a meta-line category tag at this
// size, matching how the other three are already short single/double
// words) / "Relationships" for the EN mock.
const MOCK_CATEGORIES: Record<Locale, [string, string, string, string]> = {
  it: ["Ansia", "Stress", "Cambiamenti di vita", "Rapporti"],
  en: ["Anxiety", "Stress", "Life changes", "Relationships"],
};

const FULL_MOCK_ARTICLES: Record<Locale, ResourceArticle[]> = {
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
    // Featured pass: 4th entry — featured (1) + columns (3) needs at
    // least 4 total to show a complete, non-empty layout; the old set
    // only ever had 3.
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

// Real articles (if any exist) get a cycled mock category attached — the
// schema has nowhere real to source one from yet (same gap as before this
// pass). Only when there are ZERO real articles does the fully-fake mock
// set (fake title/slug/date/excerpt too) stand in, matching the "0 posts"
// fallback rule this component has always used.
function resolveResourceArticles(realArticles: RealArticle[], locale: Locale): ResourceArticle[] {
  if (realArticles.length === 0) {
    return FULL_MOCK_ARTICLES[locale];
  }
  const categories = MOCK_CATEGORIES[locale];
  return realArticles.map((article, i) => ({
    _id: article._id,
    title: article.title,
    slug: article.slug,
    publishedAt: article.publishedAt ?? FULL_MOCK_ARTICLES[locale][0]!.publishedAt,
    category: categories[i % categories.length]!, // mathematically in-bounds (i % length)
    // No excerpt source yet on a real article — see this file's own
    // top-of-file HONESTY-RULE FLAG.
  }));
}

// Variant D — three-column typographic editorial index. Replaces the old
// full-bleed image triptych entirely (no images, no overlays, no
// full-bleed — see git history for that lineage). Contained within the
// standard page container, same section rhythm as its FAQ/Contact
// neighbors (padding-block: var(--space-band-y), not the older
// var(--space-section) this section used to carry on its own).
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
  const articles = resolveResourceArticles(realArticles, typedLocale);

  if (articles.length === 0) {
    return null;
  }

  // Featured pass: the newest article (index 0, same "newest first"
  // ordering the query/mock data already provide) is pulled out and
  // rendered above the three columns instead of as the first of them —
  // `.slice(1, 4)` both drops it AND caps the columns at 3, so it can
  // never appear twice even if more than 4 articles exist someday.
  const [featured, ...rest] = articles;
  const columns = rest.slice(0, 3);

  return (
    <section className={styles.resourcesSection} data-lab-section="resources">
      <div className={styles.resourcesHeader}>
        <p className={styles.resourcesKicker}>
          <span className={styles.resourcesKickerRule} aria-hidden="true" />
          {kicker}
        </p>
        <h2 className={styles.resourcesHeading}>{heading}</h2>
        {/* The listing page itself doesn't exist yet — this 404s in the
            lab for now, same policy as the individual article links
            below (no "#" placeholder). Arrow is a decorative glyph, not
            CMS content — allArticlesLabel itself is plain text ("Tutte le
            risorse" / "All resources"), same pattern as AreeSection's own
            aria-hidden arrow span. */}
        <a href={articlesPath(typedLocale)} className={styles.resourcesAllLink}>
          {allArticlesLabel}
          <span aria-hidden="true">→</span>
        </a>
      </div>
      {featured ? (
        <FeaturedResource
          article={featured}
          href={articlePath(typedLocale, featured.slug)}
          locale={typedLocale}
        />
      ) : null}
      {columns.length > 0 ? (
        // data-column-count drives grid-template-columns in CSS — N
        // actual items always map to exactly N equal tracks (1/2/3), so
        // a degraded count (e.g. only 2 total articles, 1 column) never
        // leaves an empty leftover track the way a fixed repeat(3, 1fr)
        // would.
        <div className={styles.resourcesGrid} data-column-count={columns.length}>
          {columns.map((article) => (
            <ResourceColumn
              key={article._id}
              article={article}
              href={articlePath(typedLocale, article.slug)}
              locale={typedLocale}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
