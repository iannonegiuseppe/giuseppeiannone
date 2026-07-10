"use client";

import { useEffect, useRef } from "react";
import styles from "./FormazioneBand.module.scss";

export type FormazioneCounter = {
  value: number;
  label: string;
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Dependency-free count-up, one IntersectionObserver on the ROW (not one
// per stat, per spec). Per-frame updates write directly to the DOM via
// refs (textContent), never through React state — same discipline as
// Timeline.tsx's scroll-driven fill/nodes, avoiding both a render-per-
// frame cost and the set-state-in-effect anti-pattern a React-state
// version would hit.
//
// Initial JSX already renders each stat's FINAL value (not 0) — this is
// what SSR, no-JS, and prefers-reduced-motion visitors see, permanently
// in the reduced-motion/no-JS cases since nothing then touches the DOM.
// Only once triggered does the animation take over, starting from its
// own t=0 frame (which evaluates to 0) and counting back up — "starts at
// 0" without needing a separate reset step or a hydration-mismatch risk.
export function FormazioneCounters({ counters }: { counters: FormazioneCounter[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    // Reduced motion: no observer, no animation — numbers stay at the
    // final values already in the initial markup, per spec.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const row = rowRef.current;
    if (!row) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect(); // once per page load, per spec

          const duration = 1400;
          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const t = Math.min(1, elapsed / duration);
            const eased = easeOutCubic(t);

            counters.forEach((counter, i) => {
              const el = numberRefs.current[i];
              if (!el) return;
              const next = t >= 1 ? counter.value : Math.round(eased * counter.value);
              el.textContent = String(next);
            });

            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(row);

    return () => observer.disconnect();
  }, [counters]);

  return (
    <div ref={rowRef} className={styles.formazioneCountersRow}>
      {counters.map((counter, i) => (
        <div key={counter.label} className={styles.formazioneCounterStat}>
          {/* Visible presentation, entirely aria-hidden — the composed
              sr-only sentence below is the sole thing announced for this
              stat, so nothing here duplicates it. */}
          <div aria-hidden="true">
            <p className={styles.formazioneCounterNumberWrap}>
              <span className={styles.formazioneCounterNumberSizer}>{counter.value}</span>
              <span
                className={styles.formazioneCounterNumber}
                ref={(el) => {
                  numberRefs.current[i] = el;
                }}
              >
                {counter.value}
              </span>
            </p>
            <p className={styles.formazioneCounterLabel}>{counter.label}</p>
          </div>
          <span className={styles.formazioneCounterSrText}>
            {counter.value} {counter.label.toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
