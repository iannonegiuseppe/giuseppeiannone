"use client";

import { useEffect, useRef } from "react";
import styles from "./design-lab.module.scss";

// Same scroll-container detection as Timeline.tsx/SedesStage.tsx/
// RecognitionStage.tsx/DesignLabHeader.tsx — see Timeline.tsx's own
// comment for the full CSS-spec explanation. Reused verbatim rather than
// extracted to a shared module, per this file's established duplication
// convention. Native scrollY stays authoritative under Lenis (confirmed
// in the Lenis pass's own report — it drives window.scrollTo(), not a
// transform), so this reads exactly like every other scroll-driven
// component in the lab, pre- or post-Lenis.
function isScrollable(el: HTMLElement): boolean {
  const overflowY = getComputedStyle(el).overflowY;
  return (overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight + 1;
}
function getScrollContainer(): HTMLElement | (Window & typeof globalThis) {
  const { body, documentElement } = document;
  if (isScrollable(body)) return body;
  if (isScrollable(documentElement)) return documentElement;
  return window;
}
function getScrollTop(container: HTMLElement | (Window & typeof globalThis)): number {
  return container instanceof Window ? container.scrollY : container.scrollTop;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// Chi sono, Part 1: the faint "BENVENUTO" watermark behind the intro
// statement widens (letter-spacing) as the user scrolls down through the
// section and narrows on the way back up. A single section-progress
// value (0 when the section's top enters the viewport bottom, 1 when its
// bottom leaves the viewport top) drives both directions inherently — no
// separate scroll-up/scroll-down branches needed, per spec. Split out
// from ChiSonoOverlap.tsx (a server component) as its own narrow client
// island, matching this file's established FormazioneCounters.tsx/
// MediaBand.tsx precedent — the surrounding section stays server-rendered.
export function ChiSonoWatermark({ text }: { text: string }) {
  const watermarkRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    // Reduced motion: no listener at all — design-lab.module.scss's own
    // reduced-motion override pins letter-spacing at a static value
    // regardless of the (never-set) --wm-progress custom property.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const watermark = watermarkRef.current;
    // The section is this element's own ancestor rather than a ref
    // threaded down through ChiSonoOverlap.tsx (a server component,
    // which can't hold a ref itself) — data-lab-section="chi-sono" is
    // already a unique, stable attribute on it.
    const section = watermark?.closest<HTMLElement>('[data-lab-section="chi-sono"]');
    if (!watermark || !section) return;

    const scrollContainer = getScrollContainer();
    let sectionTop = 0;
    let sectionHeight = 0;

    function measure() {
      const scrollTop = getScrollTop(scrollContainer);
      const rect = section!.getBoundingClientRect();
      sectionTop = rect.top + scrollTop;
      sectionHeight = rect.height;
    }
    measure();

    let rafId: number | null = null;
    function update() {
      rafId = null;
      const scrollTop = getScrollTop(scrollContainer);
      const viewportHeight = window.innerHeight;
      // progress = 0 when scrollTop + viewportHeight == sectionTop (the
      // section's top has just reached the viewport's bottom edge), 1
      // when scrollTop == sectionTop + sectionHeight (the section's
      // bottom has just left the viewport's top edge) — per spec.
      const progress = clamp01(
        (scrollTop + viewportHeight - sectionTop) / (sectionHeight + viewportHeight),
      );
      watermark!.style.setProperty("--wm-progress", String(progress));
    }
    update();

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(update);
    }
    function onResize() {
      measure();
      update();
    }

    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <p ref={watermarkRef} className={styles.chiSonoIntroWatermark} aria-hidden="true">
      {text}
    </p>
  );
}
