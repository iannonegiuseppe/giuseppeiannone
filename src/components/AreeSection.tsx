import { areaPath, type Locale } from "@/sanity/paths";
import styles from "./AreeSection.module.scss";

export type AreaRow = {
  _id: string;
  title: string;
  descriptor: string;
  slug?: string;
};

// Aree section — full-width typographic list of intervention areas,
// between Chi sono and Diplomi. Supersedes ConcernsSection.tsx/
// homePage.diCosa (the older "Di cosa mi occupo" card-grid pairing) —
// see area.ts's own comment for that precedent. Server component: no
// data resolution beyond the plain title/descriptor/slug already
// projected by areasQuery, so no client-side interactivity is needed
// beyond CSS-only :hover/:focus-visible (no JS state at all).
//
// Conditional interactivity, three states per row:
// - slug set -> real <a> (matches ChiSonoSection.tsx's own storyLink
//   pattern: plain <a>, not next/link, for a route that doesn't exist
//   yet; see areaPath's own comment in sanity/paths.ts). Full link
//   behavior: cursor, focus ring, hover, arrow.
// - no slug, previewHover true -> a plain <div> (no href/role/tabindex,
//   cursor: default) that STILL shows the same hover visual (title
//   accent+italic, arrow reveal) via CSS only, scoped to
//   `@media (hover: hover)` so touch devices never get a stuck-hover
//   state. Temporary/demo — see areeSection.ts's own field comment.
// - no slug, previewHover false -> fully plain row, no arrow rendered at
//   all, no hover state, no cursor change.
export function AreeSection({
  kicker,
  title,
  intro,
  areas,
  previewHover,
  locale,
}: {
  kicker: string;
  title: string;
  intro?: string;
  areas?: AreaRow[];
  previewHover?: boolean;
  locale: Locale;
}) {
  return (
    <section
      className={styles.areeSection}
      data-lab-section="aree"
      aria-labelledby="aree-heading"
    >
      <div className={styles.areeHeader}>
        <p className={styles.areeKicker}>
          <span className={styles.areeKickerRule} aria-hidden="true" />
          {kicker}
        </p>
        <h2 id="aree-heading" className={styles.areeTitle}>
          {title}
        </h2>
        {intro ? <p className={styles.areeIntro}>{intro}</p> : null}
      </div>

      <ul className={styles.areeList} role="list">
        {areas?.map((area) => {
          const isLink = Boolean(area.slug);
          const showArrow = isLink || Boolean(previewHover);

          const rowContent = (
            <>
              <span className={styles.areeRowText}>
                <span className={styles.areeRowTitle}>{area.title}</span>
                <span className={styles.areeRowDescriptor}>{area.descriptor}</span>
              </span>
              {showArrow ? (
                <span className={styles.areeRowArrow} aria-hidden="true">
                  →
                </span>
              ) : null}
            </>
          );

          return (
            <li key={area._id} className={styles.areeRow} role="listitem">
              {isLink ? (
                // aria-label overrides the default (title + visible
                // descriptor) accessible name down to just the title, per
                // this pass's own a11y spec — the descriptor stays fully
                // present/readable in normal document flow, this only
                // affects how the LINK itself is announced (e.g. when
                // tabbing link-to-link or browsing a screen reader's
                // link rotor).
                <a
                  href={areaPath(locale, area.slug!)}
                  aria-label={area.title}
                  className={styles.areeRowLink}
                >
                  {rowContent}
                </a>
              ) : previewHover ? (
                <div className={styles.areeRowPreview}>{rowContent}</div>
              ) : (
                <div className={styles.areeRowPlain}>{rowContent}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
