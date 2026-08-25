"use client";

import { useEffect, useRef, useState } from "react";
import { observeVisibility } from "@/components/sharedViewportObserver";
import styles from "./ChiSonoGlassCard.module.scss";

export interface ChiSonoGlassCardFact {
  label?: string;
  value?: string;
}

// Text-color split — no longer a fixed index guess. Real bug, found live:
// DARK_FACT_COUNT (facts 0-1 dark, 2-3 light) assumed row 1 always lands
// above the seam and row 2 always below it, which held at 390px but broke
// at other widths (360/430) once a wrapped label ("ALBO DEGLI PSICOLOGI"
// going to 2 or 3 lines depending on its own column width) grew row 1 tall
// enough to shift where the seam actually falls — row 2 shipped with no
// chip AND the wrong (still index-derived) text color at those widths,
// reading as invisible ivory-on-ivory-adjacent instead of the dark-ink
// treatment its actual position (below the seam, over the light fill)
// needs. Kept only as the SSR-safe INITIAL GUESS (below, aboveSeam's own
// initializer) so server-rendered HTML and the client's first paint agree
// before the effect below can measure anything real — corrected on mount
// and on every resize.
const DARK_FACT_COUNT = 2;

// Fix pass 5 — reveal animation. Reuses the SAME shared, module-scope
// IntersectionObserver every other one-shot reveal on this site pools
// through (sharedViewportObserver.ts) — not a private observer, not a
// scroll listener, not a load timer. Threshold left at the module's own
// default (0.1), matching most existing RevealOnScroll/ChiSonoBlock
// consumers; no instruction here calls for a different one.
//
// Deliberately NOT the <RevealOnScroll> component itself: that component
// hardcodes ITS OWN CSS module's .pendingReveal/.revealed classes
// (FinalContactSection.module.scss — translateY(1rem)/500ms/plain
// ease), so every caller gets the exact same distance/duration/easing
// with no way to override them. This card needs a different distance
// (24px vs 16px), duration (~800ms vs 500ms), and easing (a "soft
// settle" curve, not plain ease) — reusing observeVisibility() directly,
// the same underlying primitive RevealOnScroll itself calls, gets the
// shared-observer requirement without inheriting parameters that don't
// match the brief.
//
// The reveal lives on a SEPARATE inner wrapper (.reveal), not on .card
// itself: .card already carries its own `transform: translateY(...)` for
// POSITIONING (the seam-straddle offset, see that class's own comment) —
// a second transform for the reveal would silently overwrite it (CSS
// `transform` doesn't compose across two separate rules targeting the
// same element). Splitting the two onto different elements means
// neither has to know about the other's transform value.
export function ChiSonoGlassCard({ facts }: { facts: ChiSonoGlassCardFact[] }) {
  const [revealed, setRevealed] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // One boolean per fact: true once measured to sit above the seam. Seeded
  // from the old static DARK_FACT_COUNT guess (see that constant's own
  // comment) purely so hydration has something to agree on; the effect
  // below overwrites it with a real measurement before the user can see
  // the wrong one render, at every width, not just the one this used to be
  // tuned against.
  const [aboveSeam, setAboveSeam] = useState<boolean[]>(() => facts.map((_, i) => i < DARK_FACT_COUNT));
  // Chip-row alignment — real bug: "ALBO DEGLI PSICOLOGI" wraps to two
  // lines in its own (narrow) column while shorter labels next to it stay
  // on one, so their chips came out different heights even though they're
  // meant to read as one row. Driven by measurement, not a hardcoded
  // height, for the same reason aboveSeam is: whichever chip is tallest
  // depends on live wrap, which depends on width and on the actual copy —
  // null until the effect below has measured once (renders at each chip's
  // own natural height until then, same as the SSR-safe default above).
  const [chipMinHeight, setChipMinHeight] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = revealRef.current;
    if (!el) return;

    // One-shot: unregisters itself the first time it sees `inView`, so
    // scrolling back up later never re-triggers it — same contract
    // RevealOnScroll.tsx's own callback already uses.
    const unregister = observeVisibility(el, (inView) => {
      if (!inView) return;
      setRevealed(true);
      unregister();
    });

    return unregister;
  }, []);

  // Seam-position detection — the actual fix (see DARK_FACT_COUNT's own
  // comment for what this replaces). The seam is .card's own PARENT's top
  // edge by construction (.lightIslandTop, page.tsx — ChiSonoGlassCard.
  // module.scss's own .card comment documents why that DOM position is
  // what makes the seam-straddle correct at all), read directly off the
  // DOM rather than passed as a prop: it's a pure layout fact this
  // component doesn't otherwise need to know, not content it owns.
  //
  // Re-measured on mount AND on every resize (rAF-throttled, one pending
  // frame at a time): the fact/seam relationship changes with viewport
  // WIDTH (narrower columns wrap "ALBO DEGLI PSICOLOGI" to more lines,
  // growing row 1's own height) but empirically NOT with height at a given
  // width (confirmed live across 700-1080px tall viewports) — still
  // listening on resize rather than just width-matching a media query,
  // since this needs the REAL rendered fact height, not just a breakpoint
  // guess.
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !card.parentElement) return;
    const seamEl = card.parentElement;

    let rafId: number | null = null;

    const measure = () => {
      rafId = null;
      const seamY = seamEl.getBoundingClientRect().top;
      const items = card.querySelectorAll("li");
      const labels = Array.from(items)
        .map((li) => li.children[0])
        .filter((el): el is HTMLElement => el instanceof HTMLElement);

      const next = labels.map((label) => label.getBoundingClientRect().bottom <= seamY);
      setAboveSeam((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next));

      // Reset any previously-applied min-height BEFORE reading heights —
      // otherwise a resize that should SHRINK the tallest chip (wider
      // column, less wrapping) would read back the stale, already-
      // stretched height instead of the new natural one. Direct style
      // write is a deliberate one-frame measurement aid here, not a
      // second source of truth — chipMinHeight (React state, applied via
      // the style prop below) is what actually renders going forward.
      labels.forEach((label) => {
        label.style.minHeight = "";
      });
      const chippedHeights = labels.filter((_, i) => next[i]).map((label) => label.getBoundingClientRect().height);
      const nextMinHeight = chippedHeights.length ? Math.max(...chippedHeights) : null;
      setChipMinHeight((prev) => (prev === nextMinHeight ? prev : nextMinHeight));
    };

    const scheduleMeasure = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      window.removeEventListener("resize", scheduleMeasure);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [facts.length]);

  if (facts.length === 0) return null;

  return (
    <div ref={cardRef} className={styles.card}>
      <div ref={revealRef} className={styles.reveal} data-revealed={revealed}>
        <ul className={styles.factsList}>
          {facts.map((fact, index) => {
            // Fix pass 6 — the fact right after the seam-crossing divider
            // (index === DARK_FACT_COUNT) needs its own extra clearance:
            // see .seamAdjacent's own comment in the stylesheet for why no
            // flat text color can work there at the standard spacing.
            const isSeamAdjacent = index === DARK_FACT_COUNT;
            const isAboveSeam = aboveSeam[index] ?? index < DARK_FACT_COUNT;
            return (
              <li
                key={index}
                className={`${styles.fact} ${isAboveSeam ? styles.factOnDark : styles.factOnLight} ${
                  isSeamAdjacent ? styles.seamAdjacent : ""
                }`}
              >
                <span
                  className={styles.factLabel}
                  style={isAboveSeam && chipMinHeight !== null ? { minHeight: chipMinHeight } : undefined}
                >
                  {fact.label}
                </span>
                <span className={styles.factValue}>{fact.value}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
