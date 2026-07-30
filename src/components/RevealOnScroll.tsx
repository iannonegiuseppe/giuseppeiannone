"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import styles from "./FinalContactSection.module.scss";

// Generic version of the reveal mechanism first built for PhilosophyBand
// (itself copied from CarePathway) — extracted here so every Group B
// section reuses the same one instead of re-implementing it. No-JS and
// prefers-reduced-motion both see children fully visible immediately;
// normal motion fades/translates in once, the first time it enters the
// viewport.
export function RevealOnScroll({
  children,
  className,
  style,
}: {
  children: ReactNode;
  // Optional passthrough for callers that need this wrapper itself to
  // participate in a layout the child alone can't (e.g. RecognitionSection's
  // CSS Grid placement — a plain child div wouldn't be a direct grid item).
  className?: string;
  // Aree card-grid pass: lets a caller set a per-instance CSS custom
  // property (e.g. a deterministic --card-delay-index, same pattern
  // AnimatedDivider's own --divider-delay-index already uses) on the same
  // div this component's own pendingReveal/revealed classes toggle —
  // needed for a staggered reveal across several instances without a
  // second IntersectionObserver. Optional and additive: every existing
  // caller omits it and is unaffected.
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    const pendingRevealClass = styles.pendingReveal!;
    const revealedClass = styles.revealed!;
    el.classList.add(pendingRevealClass);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(revealedClass);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
