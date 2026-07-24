"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import styles from "./metodo.module.scss";

type MetodoStep = {
  title: string;
  atAGlance: string;
  shortLine: string;
  expandedText: string;
};

// Rework pass: the at-a-glance row + thread/fill device (previous pass)
// is replaced by a full-bleed zigzag — four steps spanning the full
// viewport width, alternating vertical offset, no progress line at all
// (the offset rhythm itself carries the sequence). Still a selector: same
// hover/focus/click -> setActiveIndex wiring as every earlier version,
// same reveal-on-scroll/reduced-motion handling (the effect below skips
// attaching the observer under reduced-motion without ever calling
// setRevealed, same reasoning as before — metodo.module.scss's own
// reduced-motion block forces the end-state visually either way).
export function MetodoInteractive({ steps }: { steps: MetodoStep[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.unobserve(root);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const activeStep = steps[activeIndex];

  return (
    <div ref={rootRef} className={styles.metodoRoot} data-revealed={revealed}>
      <div className={styles.zigzagBleed}>
        <ul className={styles.zigzagRow} role="list">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={step.title} className={styles.zigzagListItem} data-offset={index % 2 === 0 ? "high" : "low"}>
                <button
                  type="button"
                  className={styles.zigzagItem}
                  data-active={isActive}
                  aria-current={isActive ? "step" : undefined}
                  aria-controls={`${baseId}-panel`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                >
                  <span className={styles.zigzagNumeral} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.zigzagTitle}>{step.title}</span>
                  <span className={styles.zigzagShortLine}>{step.shortLine}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div id={`${baseId}-panel`} className={styles.panel} aria-live="polite">
        <p key={`numeral-${activeIndex}`} className={styles.panelNumeral} aria-hidden="true">
          {String(activeIndex + 1).padStart(2, "0")}
        </p>
        <p key={`text-${activeIndex}`} className={styles.panelText}>
          {activeStep?.expandedText}
        </p>
      </div>
    </div>
  );
}
