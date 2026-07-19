"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import styles from "./HopeSection.module.scss";

// Hope band's own one-shot entrance — deliberately NOT the shared
// RevealOnScroll: that component's timing (500ms) is hardcoded via its
// own imported FinalContactSection.module.scss classes, and this section
// needs something slower (~900ms) and staggered (eyebrow, then heading)
// specifically because it's the page's emotional pivot, not just another
// section reveal. Same observer shape as RevealOnScroll otherwise (mount
// -> reduced-motion check -> one-shot IntersectionObserver -> add a class
// -> disconnect), duplicated rather than parameterized, per this
// codebase's established convention for small single-purpose mechanisms.
//
// Reduced motion: the pending/revealed classes are simply never applied
// (this effect returns before ever adding either one) — .hopeEyebrow/
// .hopeHeading's own base rules (HopeSection.module.scss) are already the
// final, fully-visible state, so no-JS and reduced-motion both render
// correctly with zero extra CSS needed, same reasoning RevealOnScroll
// itself relies on.
export function HopeReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.classList.add(styles.hopeRevealPending!);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.hopeRevealed!);
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
    <div ref={ref} className={styles.hopeInner}>
      {children}
    </div>
  );
}
