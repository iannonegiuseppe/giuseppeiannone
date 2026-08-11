"use client";

import { useEffect, useRef, useState } from "react";
import { observeVisibility } from "@/components/sharedViewportObserver";
import styles from "./ChiSonoGlassCard.module.scss";

export interface ChiSonoGlassCardFact {
  label?: string;
  value?: string;
}

// Text-color split — fix pass 4: DARK_FACT_COUNT dropped from 3 to 2.
// Re-measured after the card moved down to clear the hero's standfirst
// (see ChiSonoGlassCard.module.scss's own .card comment — the seam split
// changed from ~75/25 to ~50/50 as a direct consequence): at 1440, facts
// 0-1 (ALBO, RICERCA) still land fully above the seam (bottom edges
// 719.3px/848.0px, seam at 900px), but fact 2 (STUDI) now spans
// 876.0-1018.2px — only 24px of it above the seam, the other ~118px (83%
// of its own height) below — so it needs the light-half (dark ink)
// treatment now, matching fact 3 (LINGUE), which stays fully below.
// DARK_FACT_COUNT is a fixed constant matching this component's own
// fixed layout; re-derive it by hand (via live measurement, not by
// eye — this is the second time getting it wrong by assumption would
// have shipped low-contrast text) if the card's height, padding, gap, or
// vertical offset ever change again. Fix pass 5 fixed a related bug: the
// mobile CSS used to encode this SAME split a second time, by hand, via
// an independent :nth-child selector instead of reusing the class this
// constant drives — see ChiSonoGlassCard.module.scss's own .factOnLight
// comment for the fix (one class, one source of truth, both tiers).
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

  if (facts.length === 0) return null;

  return (
    <div className={styles.card}>
      <div ref={revealRef} className={styles.reveal} data-revealed={revealed}>
        <ul className={styles.factsList}>
          {facts.map((fact, index) => {
            // Fix pass 6 — the fact right after the seam-crossing divider
            // (index === DARK_FACT_COUNT) needs its own extra clearance:
            // see .seamAdjacent's own comment in the stylesheet for why no
            // flat text color can work there at the standard spacing.
            const isSeamAdjacent = index === DARK_FACT_COUNT;
            return (
              <li
                key={index}
                className={`${styles.fact} ${index < DARK_FACT_COUNT ? styles.factOnDark : styles.factOnLight} ${
                  isSeamAdjacent ? styles.seamAdjacent : ""
                }`}
              >
                <span className={styles.factLabel}>{fact.label}</span>
                <span className={styles.factValue}>{fact.value}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
