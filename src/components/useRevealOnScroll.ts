"use client";

import { useEffect, useRef, useState } from "react";

// Extracted from TimelineEntry.tsx's own original reveal effect —
// byte-identical logic, now shared with TimelineCaseFileEntry.tsx and
// TimelineRouteEntry.tsx rather than tripled. Reveals once as the
// element scrolls into view, then stays revealed. Reduced-motion users
// get the fully-visible state unconditionally, two ways: this observer
// never starts (early return below), AND the CSS itself only defines
// the hidden/offset starting state inside `@media
// (prefers-reduced-motion: no-preference)` in each caller's own
// stylesheet — so nothing ever starts hidden pre-hydration or with JS
// disabled.
export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (observedEntries) => {
        if (observedEntries[0]?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
