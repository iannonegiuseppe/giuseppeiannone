"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { observeVisibility } from "./sharedViewportObserver";
import styles from "./FinalContactSection.module.scss";

// Generic version of the reveal mechanism first built for PhilosophyBand
// (itself copied from CarePathway) — extracted here so every Group B
// section reuses the same one instead of re-implementing it. No-JS and
// prefers-reduced-motion both see children fully visible immediately;
// normal motion fades/translates in once, the first time it enters the
// viewport.
//
// Diagnosis pass (Aree reveal ticket): this used to create its OWN
// private `new IntersectionObserver(...)` per mounted instance — six
// separate observers just for Aree's own six cards, on top of however
// many other RevealOnScroll instances exist elsewhere on the same page
// (CTA bridge, FinalContactSection itself, RecognitionSection's grid).
// That's exactly the per-instance duplication sharedViewportObserver.ts
// was built to eliminate for AnimatedDivider/ShimmerText — this file
// just never got migrated onto it. Now reuses that SAME module-scope
// singleton instead of adding a third observer construct. One
// consequence, disclosed rather than silent: the shared observer's
// threshold is fixed at 0.1 (sharedViewportObserver.ts), not this file's
// former private 0.15 — every RevealOnScroll consumer now reveals a
// little earlier (10% visible instead of 15%), a minor, shared,
// intentional side effect of true single-observer reuse, not a
// per-caller regression.
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
    el.classList.add(styles.pendingReveal!);

    // One-shot on top of a continuous-toggle primitive: observeVisibility
    // calls back on every enter/exit (AnimatedDivider/ShimmerText's own
    // use case), so this reveal un-registers itself the first time it
    // sees `inView`, rather than ever reacting to a later exit — same
    // "fires once" contract this component always had, just implemented
    // on the shared observer instead of a private one.
    const unregister = observeVisibility(el, (inView) => {
      if (!inView) return;
      el.classList.add(styles.revealed!);
      unregister();
    });

    return unregister;
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
