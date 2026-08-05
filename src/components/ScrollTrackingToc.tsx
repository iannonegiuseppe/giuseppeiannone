"use client";

import { useEffect, useState } from "react";
import { useLenisRef } from "@/components/LenisProvider";
import type { TocHeading } from "@/sanity/headings";
import styles from "./ScrollTrackingToc.module.scss";

// Extracted verbatim from the blog article route's own ArticleToc.tsx
// (reading-frame pass) so the pillar page can reuse the exact same
// scroll-tracked table of contents instead of a second implementation —
// see that route's page.tsx for the one remaining caller besides the
// pillar route. Logic is unchanged; only the CSS module import and the
// sticky top-offset (now a prop, see topOffset below) moved.
//
// Active-heading tracking, driven by the site's shared Lenis instance
// (useLenisRef) rather than a native `scroll` listener — the two fight
// each other on this site (LenisProvider.tsx's own comment; Lenis drives
// window.scrollTo() under the hood, but a second, independently-timed
// listener still causes jitter against Lenis's own rAF-driven updates).
//
// lenisRef.current can be null for two real reasons, not just "not
// mounted yet": LenisProvider disables Lenis entirely on coarse-pointer
// (touch) devices and under prefers-reduced-motion (see that file's own
// comment) — on either, this component simply never gets an active
// heading (the TOC still renders and every link still works via the
// browser's native #id anchor jump, just without the scroll-tracked
// highlight). The bounded retry below only covers the OTHER reason
// (mount-order: LenisProvider's own effect, which creates the instance,
// can run after this component's if they mount in the same commit).
const LENIS_WAIT_RETRIES = 30;
const LENIS_WAIT_INTERVAL_MS = 100;
// Distance from the viewport top a heading must cross before it counts as
// "currently being read" — matches the fixed header's own rough height so
// a heading isn't marked active while still hidden behind it.
const ACTIVE_OFFSET_PX = 120;

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
  const lenisRef = useLenisRef();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    function computeActive() {
      let current: string | null = null;
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= ACTIVE_OFFSET_PX) {
          current = heading.id;
        }
      }
      setActiveId(current ?? headings[0]?.id ?? null);
    }

    function attach(retriesLeft: number) {
      if (cancelled) return;
      const lenis = lenisRef?.current;
      if (!lenis) {
        if (retriesLeft <= 0) return; // Lenis genuinely disabled — no active tracking, links still work
        const timer = setTimeout(() => attach(retriesLeft - 1), LENIS_WAIT_INTERVAL_MS);
        cleanup = () => clearTimeout(timer);
        return;
      }
      computeActive();
      lenis.on("scroll", computeActive);
      cleanup = () => lenis.off("scroll", computeActive);
    }

    attach(LENIS_WAIT_RETRIES);
    return () => cleanup?.();
  }, [headings, lenisRef]);

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
