"use client";

import { useEffect, useRef } from "react";
import { SignatureMark } from "./Logo";
import styles from "./SignatureBand.module.scss";

// Reveal viewport window: --reveal is 0 while the section's top edge is
// at/below REVEAL_START_VH of viewport height, 1 once it reaches
// REVEAL_END_VH — i.e. the signature finishes "writing" itself well
// before the section is centered. Tuned live on the page (see this
// pass's own report for why these two values were kept).
const REVEAL_START_VH = 0.9;
const REVEAL_END_VH = 0.35;

// Signature-only mark, no wordmark/descriptor — a quiet decorative pause
// before the footer, not content. aria-hidden on the section removes the
// whole subtree (including SignatureMark's own role="img"/aria-label)
// from the accessibility tree; the name is already announced in Chi
// sono and the Footer.
export function SignatureBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const mask = maskRef.current;
    if (!section || !mask) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      mask.style.setProperty("--reveal", "1");
      return;
    }

    // HONESTY-RULE CATCH: a first draft cached the section's viewport-
    // relative getBoundingClientRect().top itself and only refreshed it
    // on resize — that value is only valid at the instant it's read, so
    // the reveal would have frozen at whatever position the page was in
    // on mount/resize and never updated on scroll at all. The fix: cache
    // the section's ABSOLUTE document offset (rect.top + scrollY, stable
    // across scrolling, only changes on resize/reflow) and derive the
    // current viewport-relative position per tick as
    // absoluteTop - window.scrollY — a cheap, non-layout-triggering read,
    // unlike getBoundingClientRect(), so there's still no layout read
    // inside the scroll handler itself.
    let absoluteTop = 0;
    function measure() {
      absoluteTop = section!.getBoundingClientRect().top + window.scrollY;
    }

    let ticking = false;
    function update() {
      ticking = false;
      const viewportTop = absoluteTop - window.scrollY;
      const vh = window.innerHeight;
      const start = vh * REVEAL_START_VH;
      const end = vh * REVEAL_END_VH;
      const progress = (start - viewportTop) / (start - end);
      const clamped = Math.min(1, Math.max(0, progress));
      mask!.style.setProperty("--reveal", clamped.toFixed(4));
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    measure();
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    // ResizeObserver (matching DiplomiCardRow.tsx's own precedent) rather
    // than a window "resize" listener: catches font-load/content reflows
    // that move the section without the viewport itself resizing.
    const observer = new ResizeObserver(() => {
      measure();
      update();
    });
    observer.observe(section);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.band} aria-hidden="true">
      <div ref={maskRef} className={styles.mask}>
        <SignatureMark className={styles.signature} />
      </div>
    </section>
  );
}
