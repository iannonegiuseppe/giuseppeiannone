import Image from "next/image";
import type { Locale } from "@/sanity/paths";
import { formatArticleDate, type ResourceArticle } from "./ResourceColumn";
import styles from "./ResourcesSection.module.scss";

// Preview only — remove when real cover images ship. A component-level
// constant (not a prop/CMS field) so removing this feature later is a
// one-line deletion plus dropping the branch below, nothing threaded
// through ResourcesSection.tsx or Sanity. While on, a featured article
// with no real image gets a placeholder frame instead of the full-width
// text layout, so the eventual two-column composition (image left, text
// right) is visible in previews before any real cover image exists.
const SHOW_IMAGE_PLACEHOLDER = true;

// Featured pass — the newest article gets its own block above the three
// columns (see ResourcesSection.tsx for how it's split off so it never
// also appears among them). Same stretched-link/single-tab-stop/focus-
// ring mechanics as ResourceColumn, just at a bigger type size and with
// room for an image that doesn't exist yet (see article's own comment on
// ResourceArticle.image). Meta line and excerpt clamp literally REUSE
// .resourceMeta/.resourceExcerpt from ResourcesSection.module.scss rather
// than duplicating those rules, so "same treatment as the columns" is
// guaranteed by construction, not just by copying values that could
// later drift apart.
//
// Deliberately does NOT get its own hover-reactive rule (see Part 2's
// accent-highlight on the three columns' top rules) — this block's own
// separator is a plain, static hairline below it, not a per-item "which
// one is newest" rule the way each column's top border is. Highlighting
// it on hover would have nothing coherent to contrast against (it's
// already singled out by being the one featured item), so only its title
// recolors on hover/focus, matching the columns' non-rule hover behavior.
export function FeaturedResource({
  article,
  href,
  locale,
}: {
  article: ResourceArticle;
  href: string;
  locale: Locale;
}) {
  const hasImage = Boolean(article.image);
  const showPlaceholder = !hasImage && SHOW_IMAGE_PLACEHOLDER;
  // Drives the two-column vs full-width grid — a real image and the
  // preview placeholder both need the same geometry, so both set this.
  const hasImageArea = hasImage || showPlaceholder;

  return (
    <article className={styles.featured} data-has-image={hasImageArea}>
      {hasImage ? (
        <div className={styles.featuredImageWrap}>
          <Image
            src={article.image!}
            alt=""
            fill
            sizes="(min-width: 64rem) 300px, 100vw"
            className={styles.featuredImage}
          />
        </div>
      ) : showPlaceholder ? (
        // Quiet neutral surface, not a "broken image" look — --color-
        // greige is this codebase's own established fallback-backdrop
        // token for imagery that isn't there yet (see VideoPlayer.module.
        // scss/SedesSection.module.scss's own "fallback backdrop" use of
        // it), reused here rather than inventing a new surface color.
        <div className={styles.featuredImagePlaceholder}>
          <span>{locale === "it" ? "Immagine [segnaposto]" : "Image [placeholder]"}</span>
        </div>
      ) : null}
      <div className={styles.featuredText}>
        <p className={styles.resourceMeta}>
          {article.category} · {formatArticleDate(article.publishedAt, locale)}
        </p>
        <h3 className={styles.featuredTitle}>
          <a href={href} className={styles.featuredTitleLink}>
            {article.title}
          </a>
        </h3>
        {article.excerpt ? (
          <p className={`${styles.resourceExcerpt} ${styles.featuredExcerpt}`}>{article.excerpt}</p>
        ) : null}
      </div>
    </article>
  );
}
