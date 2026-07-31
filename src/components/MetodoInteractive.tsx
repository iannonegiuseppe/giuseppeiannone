"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import styles from "./metodo.module.scss";

type MetodoStep = {
  title: string;
  shortLine: string;
};

// Metodo rebuild: static 4-step row (no click-to-expand interactivity —
// that mechanic was retired in the first corrective pass). "use client"
// is back for this second pass only because of the numeral reveal's
// IntersectionObserver below — the row/icon/text markup itself is still
// plain static JSX.
const ICON_VIEWBOX = "0 0 34 30";

const STEP_ICONS: ReactNode[] = [
  // 01 — contatto: a dot reaching out along a line.
  <>
    <circle cx={15} cy={15} r={11} stroke="var(--color-accent)" strokeWidth={1.25} fill="none" />
    <line x1={15} y1={15} x2={27} y2={15} stroke="var(--color-accent)" strokeWidth={1.25} />
    <circle cx={15} cy={15} r={2.2} fill="var(--color-accent)" />
  </>,
  // 02 — colloquio: two overlapping circles.
  <>
    <circle cx={11} cy={15} r={8} stroke="var(--color-accent)" strokeWidth={1.25} fill="none" />
    <circle cx={19} cy={15} r={8} stroke="var(--color-accent)" strokeWidth={1.25} fill="none" />
  </>,
  // 03 — percorso: a path between three marked points.
  <>
    <path
      d="M3 21 C10 21 10 9 17 9 C24 9 24 21 31 21"
      stroke="var(--color-accent)"
      strokeWidth={1.25}
      fill="none"
    />
    <circle cx={3} cy={21} r={2.2} fill="var(--color-accent)" />
    <circle cx={17} cy={9} r={2.2} fill="var(--color-accent)" />
    <circle cx={31} cy={21} r={2.2} fill="var(--color-accent)" />
  </>,
  // 04 — verifiche: a small centre circle inside a partial cycle.
  <>
    <path
      d="M15 15 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0"
      stroke="var(--color-accent)"
      strokeWidth={1.25}
      fill="none"
    />
    <path d="M6 15 a9 9 0 0 1 9 -9" stroke="var(--color-accent)" strokeWidth={1.25} fill="none" />
    <path d="M24 15 a9 9 0 0 1 -9 9" stroke="var(--color-accent)" strokeWidth={1.25} fill="none" />
  </>,
];

export function MetodoInteractive({ steps }: { steps: MetodoStep[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // One-shot numeral reveal — progressive enhancement, same pattern
  // RevealOnScroll.tsx already uses (see metodo.module.scss's own comment
  // on .numeralsPending for why this order, not a bare CSS default-hidden
  // rule): under reduced motion the effect returns before ever adding
  // .numeralsPending, so the numerals simply keep their normal resting
  // opacity — no stagger, no fade, nothing to undo.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    const pendingClass = styles.numeralsPending!;
    const revealedClass = styles.numeralsRevealed!;
    root.classList.add(pendingClass);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          root.classList.remove(pendingClass);
          root.classList.add(revealedClass);
          observer.unobserve(root);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={styles.metodoRoot}>
      <div className={styles.stepsRow}>
        {steps.map((step, index) => (
          <Fragment key={step.title}>
            <div className={styles.step} data-step-index={index}>
              <p className={styles.numeral} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className={styles.stepContent}>
                <div className={styles.iconCircle} aria-hidden="true">
                  <svg viewBox={ICON_VIEWBOX} className={styles.icon}>
                    {STEP_ICONS[index]}
                  </svg>
                </div>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepText}>{step.shortLine}</p>
              </div>
            </div>
            {index < steps.length - 1 ? (
              <svg className={styles.connector} viewBox="0 0 34 16" aria-hidden="true">
                <path className={styles.connectorPath} pathLength={1} d="M2 8 L26 8 M25 3 L31 8 L25 13" />
              </svg>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
