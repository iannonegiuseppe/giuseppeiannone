"use client";

import { useId, useMemo, useState } from "react";
import { useActiveScrollId } from "@/components/useActiveScrollId";
import type { TocHeading } from "@/sanity/headings";
import styles from "./MobileToc.module.scss";

// Mobile TOC pass — below-lg presentation of the same table of contents
// ScrollTrackingToc renders at lg+. Deliberately a separate component, not
// a fork: the active-heading tracking already lived in its own hook
// (useActiveScrollId, extracted during the chi-sono timeline pass — see
// that hook's own comment) with a second consumer (TimelineRail) already
// proving it's render-agnostic. This is a third consumer of the same
// hook, not a second implementation of it — ScrollTrackingToc.tsx itself
// is untouched by this pass.
//
// Same 3-heading floor as ScrollTrackingToc's own `if (headings.length <
// 3) return null` — mobile and desktop must agree on whether a page has
// "a table of contents" at all, not disagree at the threshold.
export function MobileToc({ headings }: { headings: TocHeading[] }) {
  const [expanded, setExpanded] = useState(false);
  const barId = useId();
  const panelId = useId();

  const ids = useMemo(() => headings.map((heading) => heading.id), [headings]);
  const activeId = useActiveScrollId(ids);
  const activeHeading = headings.find((heading) => heading.id === activeId) ?? headings[0];

  if (headings.length < 3) return null;

  // .sticky is the ONE sticky element — bar and panel live inside it, not
  // as independently-sticky siblings. Tried that first and it broke: a
  // sticky element still occupies its ORIGINAL (unstuck) box for layout
  // purposes, so a normal-flow sibling right after it lays out relative
  // to that original position, not wherever the sticky element is
  // currently PAINTED — confirmed live, the panel expanded to a spot
  // hundreds of pixels above the actual visible (stuck) bar once scrolled
  // past it. Wrapping both in one sticky box sidesteps that entirely: the
  // box's own height simply grows when the panel opens, same as any
  // sticky element changing size while pinned (the header itself does
  // this on collapse). .sticky's stick RANGE still comes from its parent
  // (.readingArea, spanning the whole column) — the earlier fix for that
  // is unaffected by this restructure, only what's sticky changed.
  return (
    <div className={styles.sticky}>
      <button
        type="button"
        id={barId}
        className={styles.bar}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
      >
        <span className={styles.barText}>
          <span className={styles.barKicker}>Sommario</span>
          {/* aria-live: the one thing in this component that changes on
              its own (as the user scrolls) without a click — announced
              politely so a screen-reader user gets the same "where am I"
              signal a sighted user reads off the bar, without interrupting
              whatever they're already doing. Everything else here (the
              expand button, the list) only changes on direct interaction,
              which screen readers announce on their own — no aria-live
              needed there. */}
          <span className={styles.barActive} aria-live="polite">
            {activeHeading?.text}
          </span>
        </span>
        <span className={styles.barIcon} aria-hidden="true">
          <span className={styles.barIconBarH} />
          <span className={styles.barIconBarV} />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={barId}
        className={styles.panelWrap}
        data-open={expanded}
      >
        <div className={styles.panelInner}>
          <nav aria-label="Sommario">
            <ol className={styles.list}>
              {headings.map((heading) => (
                <li key={heading.key}>
                  <a
                    href={`#${heading.id}`}
                    className={styles.link}
                    data-level={heading.level}
                    aria-current={heading.id === activeId ? "true" : undefined}
                    onClick={() => setExpanded(false)}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
}
