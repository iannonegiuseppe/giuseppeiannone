import type { ReactNode } from "react";
import type { TocHeading } from "@/sanity/headings";
import { ScrollTrackingToc } from "./ScrollTrackingToc";
import styles from "./ReadingArea.module.scss";

// Extracted from the blog article route (article.module.scss/page.tsx —
// the reference this shares came from verbatim; see ReadingArea.module.
// scss's own comment for the exact provenance of each value) so the
// article and the pillar route stop maintaining two copies of the same
// container/grid/TOC/body-typography rules that had already drifted once
// (the pillar's extra readingArea padding-block, fixed by removing it
// here rather than re-adding it).
//
// Deliberately narrow: owns the container, the two-column grid, the
// sticky TOC and its vertical start, and the body's typographic rhythm —
// nothing else. It does NOT render PortableText itself and does not know
// which component map a caller uses — each route keeps calling its own
// <PortableText components={...}/> and passes the result in as children,
// so the article's minimal renderer and the pillar's fuller one (keyTakeaways/
// FAQ/CTA/cards) never need to be merged into one map. `afterBody` is the
// one other per-route slot: content that belongs inside the reading
// column, after the body, but isn't part of the body itself (the
// article's end-of-article author block) — optional, so the pillar simply
// omits it.
export function ReadingArea({
  headings,
  // --header-height-collapsed (_tokens.scss) — the ONE declared collapsed-
  // header-height value (see that token's own comment for why it's a
  // token, not a hardcoded literal). This is the correct default for
  // BOTH routes, not just the article: a sticky TOC is only ever visibly
  // pinned after scrolling well past the header's collapse threshold, so
  // by the time this offset actually matters, the header is always in
  // its collapsed state — permanently on the article route (forceCollapsed),
  // and in practice on the pillar route too (its reading area starts
  // thousands of pixels down the page, long past the 150px scroll-collapse
  // threshold — see this pass's own diagnosis report). Neither route needs
  // to pass topOffset explicitly anymore; a future route with a genuinely
  // different header (no fixed header at all, say) still can.
  topOffset = "var(--header-height-collapsed)",
  bodyId,
  afterBody,
  children,
}: {
  headings: TocHeading[];
  topOffset?: string;
  // Article-only: lets ArticleProgress find the body via
  // document.getElementById. The pillar has no reading-progress bar, so
  // it omits this and the body renders with no id.
  bodyId?: string;
  afterBody?: ReactNode;
  children: ReactNode;
}) {
  // Chi sono pass — chiSonoSection's body is plain prose with no h2/h3
  // structure at all, so headings is always empty there, and
  // ScrollTrackingToc already refuses to render under 3 (its own
  // `if (headings.length < 3) return null`). Left alone, that meant an
  // empty .tocWrapper still occupying the grid's 15rem column — no TOC,
  // but a dead gutter to the left of the text. hasToc mirrors that same
  // threshold here so the GRID itself can be skipped, not just the nav
  // inside it: .readingArea drops to a plain (still containered, still
  // lg+-centered) block, and .column's own existing max-width + auto
  // inline margins center it in the freed space — the same behavior
  // .column already has below lg, just extended upward. Article and
  // pillar both always pass 3+ headings today, so data-toc="true" (the
  // existing grid) is what they've always gotten — unaffected.
  const hasToc = headings.length >= 3;

  return (
    <div className={styles.readingArea} data-toc={hasToc ? "true" : undefined}>
      {hasToc ? (
        <div className={styles.tocWrapper}>
          <ScrollTrackingToc headings={headings} topOffset={topOffset} />
        </div>
      ) : null}
      <div className={styles.column}>
        <div className={styles.body} id={bodyId}>
          {children}
        </div>
        {afterBody}
      </div>
    </div>
  );
}
