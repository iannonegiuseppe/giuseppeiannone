"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { observeVisibility } from "./sharedViewportObserver";
import styles from "./ShimmerText.module.scss";

// Shared, presentational — lives alongside AnimatedDivider/Button/Card,
// not scoped to /design-lab. Renders the <em> itself (takes the accent
// word as children) rather than wrapping the small per-block
// "renderHeadingEmphasis"/"renderEmphasis" helpers already in
// DesignLabHomepage.tsx/CtaBridgeBlock.tsx — those are plain
// string-splitting utilities (find the word, wrap it in <em>), not the
// visual treatment; this component IS the visual treatment, applied to
// whatever word a caller already isolated. Markup semantics unchanged: an
// <em>, same as every other accent word on this page, just with this
// component's own gradient/shimmer classes layered on.
//
// This pass wires it into exactly one place (Welcome's heading) — do not
// spread it to other headings without a deliberate follow-up decision.
export function ShimmerText({
  children,
  delayIndex = 0,
  className,
}: {
  children: ReactNode;
  // Same deterministic-stagger contract as AnimatedDivider — an explicit
  // index, never Math.random()/Date.now() (hydration-unsafe in this
  // SSG/SSR app). Unused today (Welcome is the only instance) but wired
  // through now so a future second instance doesn't need an API change.
  delayIndex?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  // Reuses the exact same shared IntersectionObserver as AnimatedDivider
  // (sharedViewportObserver.ts) — not a second observer.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    return observeVisibility(el, setInView);
  }, []);

  return (
    <em
      ref={ref}
      data-in-view={inView}
      className={[styles.shimmer, className].filter(Boolean).join(" ")}
      style={{ "--shimmer-delay-index": delayIndex } as CSSProperties}
    >
      {children}
    </em>
  );
}
