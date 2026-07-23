import type { Locale } from "@/sanity/paths";
import styles from "./ResourcesSection.module.scss";

export type ResourceArticle = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string; // ISO date string
  category: string;
  // Mock-only for now — the article schema has no excerpt/summary field
  // (see ResourcesSection.tsx's own top-of-file HONESTY-RULE FLAG).
  // Undefined for real articles; the excerpt paragraph simply doesn't
  // render in that case, rather than showing an empty line.
  excerpt?: string;
  // Featured pass — HONESTY-RULE FLAG: read the article schema again
  // before adding this (src/sanity/schemaTypes/documents/article.ts) —
  // there is still no image field on it. Undefined for real articles for
  // the same reason category/excerpt can't be sourced from one; mocks
  // also leave it empty per this pass's own instruction (no stock photos,
  // no /design-lab reuse). Only FeaturedResource.tsx ever reads this —
  // ResourceColumn (the plain 3-column layout) never renders an image.
  image?: string;
};

// Variant D rebuild — this locale-aware formatter replaces the old
// ArticlePanel's own formatItalianDate, which was hardcoded to "it-IT"
// regardless of the actual site locale (a pre-existing bug: real
// articles/mocks always rendered Italian-formatted dates even on /en,
// since that function never took a locale argument at all). Searched the
// codebase for a separate shared date-formatting utility to reuse instead
// of just patching this one — there isn't one; this was the only
// implementation anywhere. Fixed in place rather than extracted to a new
// shared file, since this is still its only caller. Featured pass:
// exported now that FeaturedResource.tsx needs the exact same formatting
// (same meta-line treatment as the columns, per that pass's own spec).
export function formatArticleDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// Variant D rebuild — replaces the old full-bleed image panel entirely
// (renamed from ArticlePanel.tsx: nothing panel/photo-shaped survives —
// no cover image, no scrim, no absolute-positioned content block). One
// real <a> (the title) with a stretched-link ::after expanding its
// clickable area to the whole column — meta/excerpt stay plain text
// outside the anchor, so there's exactly one interactive element per
// column (no nested links/buttons) and the anchor's own accessible name
// stays just the title text, not the whole card's content.
export function ResourceColumn({
  article,
  href,
  locale,
}: {
  article: ResourceArticle;
  href: string;
  locale: Locale;
}) {
  return (
    <article className={styles.resourceColumn}>
      <p className={styles.resourceMeta}>
        {article.category} · {formatArticleDate(article.publishedAt, locale)}
      </p>
      <h3 className={styles.resourceTitle}>
        <a href={href} className={styles.resourceTitleLink}>
          {article.title}
        </a>
      </h3>
      {article.excerpt ? <p className={styles.resourceExcerpt}>{article.excerpt}</p> : null}
    </article>
  );
}
