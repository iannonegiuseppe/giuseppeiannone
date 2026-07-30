"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { observeVisibility } from "./sharedViewportObserver";
import styles from "./AnimatedDivider.module.scss";

// Shared, presentational: lives alongside Button/Card, this repo's own
// location for generic UI primitives (not scoped to /design-lab) — this
// is meant to be reusable at future deliberate accent placements, even
// though this pass only wires it into one (Welcome's signature row). Not
// an extension of styles/_mixins.scss's own `hairline-divider` mixin —
// that's a plain, static, sitewide utility (AreeSection/JourneySection/
// portableTextComponents all use it for structural hairlines) and stays
// completely untouched; this is a distinct, opt-in decorative component,
// never a replacement for it.
//
// The shared IntersectionObserver itself now lives in
// sharedViewportObserver.ts (extracted from here) so ShimmerText can
// reuse the exact same observer instance instead of growing a second one
// — a page with several onscreen-gated decorative elements still costs
// exactly one observer, not one per component.

export type AnimatedDividerDirection = "left-bright" | "right-bright";

export function AnimatedDivider({
  direction = "left-bright",
  delayIndex = 0,
  className,
}: {
  direction?: AnimatedDividerDirection;
  // Deterministic stagger — an explicit index the caller provides, NOT
  // Math.random()/Date.now() (this is an SSG/SSR app; either would cause
  // a server/client hydration mismatch). Maps to a negative
  // animation-delay via a CSS custom property below, so instance N
  // starts already partway into the 5s cycle instead of in lockstep with
  // instance 0.
  delayIndex?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Same idiom this file's neighbors already use for one-shot reveals
  // (WelcomeBlock, MetodoInteractive, ScrambleValue): skip attaching
  // anything under reduced motion — the CSS reduced-motion override
  // handles the at-rest state unconditionally either way. Unlike those,
  // this observer is intentionally continuous (toggles on both enter AND
  // exit, never unobserves) since the sweep must stop whenever offscreen,
  // not just once.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    return observeVisibility(el, setInView);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-direction={direction}
      data-in-view={inView}
      className={[styles.divider, className].filter(Boolean).join(" ")}
      style={{ "--divider-delay-index": delayIndex } as CSSProperties}
    />
  );
}
