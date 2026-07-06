"use client";

import { useEffect, useRef } from "react";
import styles from "./CarePathway.module.scss";

interface PathwayStep {
  title: string;
  description: string;
}

// The site's one signature visual motif (brief §5) — appears here on the
// homepage and, later, the Method page. Content comes from
// siteSettings.carePathway so both usages stay identical rather than
// drifting into two versions of the same structural sequence.
export function CarePathway({
  heading,
  steps,
}: {
  heading: string;
  steps?: PathwayStep[];
}) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    // No animation at all if the visitor prefers reduced motion — steps
    // simply render in their default (fully visible) state, permanently.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Non-null: these are static class names defined in the co-located
    // SCSS module, not a lookup that can genuinely miss at runtime —
    // noUncheckedIndexedAccess types every CSS module property access as
    // possibly undefined regardless.
    const stepClass = styles.step!;
    const pendingRevealClass = styles.pendingReveal!;
    const revealedClass = styles.revealed!;

    const items =
      listRef.current.querySelectorAll<HTMLElement>(`.${stepClass}`);
    items.forEach((item) => item.classList.add(pendingRevealClass));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(revealedClass);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 },
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  if (!steps || steps.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      <ol className={styles.pathway} ref={listRef}>
        {steps.map((step, index) => (
          <li key={index} className={styles.step}>
            <span className={styles.node} aria-hidden="true">
              {index + 1}
            </span>
            <span className={styles.line} aria-hidden="true" />
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
