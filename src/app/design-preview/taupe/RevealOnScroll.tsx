"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import styles from "./page.module.scss";

// Self-contained for this route (not importing the real site's own
// RevealOnScroll, which is tied to FinalContactSection.module.scss's own
// classes) — same simple technique: no-JS and prefers-reduced-motion both
// see children fully visible immediately; normal motion fades/translates
// in once, the first time it enters the viewport. 300-500ms, Apple-like,
// per this task's own motion spec.
export function RevealOnScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    el.classList.add(styles.pendingReveal!);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed!);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
