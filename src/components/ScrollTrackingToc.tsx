"use client";

import { useMemo } from "react";
import { useActiveScrollId } from "@/components/useActiveScrollId";
import type { TocHeading } from "@/sanity/headings";
import styles from "./ScrollTrackingToc.module.scss";

// Extracted verbatim from the blog article route's own ArticleToc.tsx
// (reading-frame pass) so the pillar page can reuse the exact same
// scroll-tracked table of contents instead of a second implementation —
// see that route's page.tsx for the one remaining caller besides the
// pillar route. Logic is unchanged; only the CSS module import and the
// sticky top-offset (now a prop, see topOffset below) moved.
//
// Chi sono timeline pass — the active-tracking effect itself (Lenis-
// driven, not a native `scroll` listener; the two fight each other on
// this site, see LenisProvider.tsx's own comment) moved out to
// useActiveScrollId.ts, byte-identical logic, so the timeline's year
// rail could reuse the SAME tracking without a second implementation.
// This component's own behavior/API is unchanged — same props, same
// render, same output on every existing caller (ReadingArea, both its
// own callers).
//
// aria-label/visible label are hardcoded "Sommario" (Italian) regardless
// of locale — preserved exactly as ArticleToc.tsx already had it, not
// fixed here: the blog article route this was extracted from renders this
// same un-translated label today on both locales, and changing it would
// be a real behavior change on that live route (this pass's brief
// requires byte-identical output there). Flagged, not silently carried
// over.
export function ScrollTrackingToc({
  headings,
  // The sticky nav's `top` value. Required, no default here — this
  // component's sole caller is ReadingArea.tsx, which owns the actual
  // default (--header-height-collapsed, _tokens.scss) so there's exactly
  // one place that value is declared, not a second one sitting here
  // unreachable and free to go stale.
  topOffset,
}: {
  headings: TocHeading[];
  topOffset: string;
}) {
  // Memoized so useActiveScrollId's own effect (keyed on this array's
  // reference) only re-attaches when the heading list itself actually
  // changes — matching the original inline effect's dependency on
  // `headings` directly, not re-running on every unrelated re-render.
  const ids = useMemo(() => headings.map((heading) => heading.id), [headings]);
  const activeId = useActiveScrollId(ids);

  if (headings.length < 3) return null;

  return (
    <nav aria-label="Sommario" className={styles.toc} style={{ top: topOffset }}>
      <p className={styles.tocLabel}>Sommario</p>
      <ol className={styles.tocList}>
        {headings.map((heading) => (
          <li key={heading.key}>
            <a
              href={`#${heading.id}`}
              className={styles.tocLink}
              data-active={heading.id === activeId ? "true" : undefined}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
