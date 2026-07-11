"use client";

import { useEffect, useRef } from "react";
import styles from "./RecognitionSection.module.scss";

export type Vignette = {
  id: string;
  vignette: string;
  area: string;
  slug: string;
  visual: string; // background image path — see RecognitionBackgroundVisuals.tsx
};

// Same scroll-container detection as Timeline.tsx/SedesStage.tsx — see
// Timeline.tsx's own comment for the full CSS-spec explanation (the
// double-vertical-scrollbar pass's `overflow-x: hidden` -> `clip` fix).
// Reused verbatim rather than extracted to a shared module, per this
// file's established duplication convention.
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

// v3 rebuild: the v2 autoplay crossfade slider (timer, dots, fixed-height
// grid-stack stage) is gone entirely — see RecognitionSection.tsx's own
// comment for the full list of what was removed and why. This component
// only toggles which vignette is "lit" as the visitor scrolls; the CSS
// (sectionsShared.module.scss's .recognitionItem rules) owns the dimmed/lit
// visual treatment and the reduced-motion fully-lit override, so this
// component does nothing at all under reduced motion — no listener, no
// timer, ever, per spec.
//
// Same measure-once-then-cheap-rAF-arithmetic pattern as
// TimelineDesktop (Timeline.tsx): geometry (getBoundingClientRect) is read
// ONLY on mount + resize; the scroll/rAF callback does a scrollTop read
// and a nearest-neighbor comparison, then writes one data-attribute per
// item — no layout reads in the hot path, per the "zero CLS, no long
// tasks" requirement.
export function RecognitionHighlightList({ vignettes }: { vignettes: Vignette[] }) {
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // Reduced motion: CSS alone renders every item fully lit (see the
    // `@media (prefers-reduced-motion: reduce)` override on
    // .recognitionItemVignette/.recognitionItemLabel) — no scroll driving,
    // so no listener is ever attached, per spec.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scrollContainer = getScrollContainer();
    let centers: number[] = [];

    function measure() {
      const scrollTop = getScrollTop(scrollContainer);
      centers = itemRefs.current.map((item) => {
        if (!item) return 0;
        const rect = item.getBoundingClientRect();
        return rect.top + scrollTop + rect.height / 2;
      });
    }
    measure();

    let rafId: number | null = null;
    function update() {
      rafId = null;
      const viewportCenter = getScrollTop(scrollContainer) + window.innerHeight / 2;
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      centers.forEach((center, i) => {
        const distance = Math.abs(center - viewportCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      });
      itemRefs.current.forEach((item, i) => {
        item?.setAttribute("data-lit", i === nearestIndex ? "true" : "false");
      });
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
  }, [vignettes.length]);

  return (
    <ul className={styles.recognitionList}>
      {vignettes.map((v, i) => (
        <li
          key={v.id}
          className={styles.recognitionItem}
          data-lit={i === 0 ? "true" : "false"}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
        >
          <p className={styles.recognitionItemVignette}>{v.vignette}</p>
          {/* Non-interactive for now, per spec: Di cosa mi occupo now sits
              ABOVE this section (Part A reorder), so an anchor link back
              up to it would read as a broken upward jump. data-area is
              kept as a placeholder for the future area-page route
              convention (/ansia, /stress, ...), same Honesty-Rule
              reasoning as v1/v2 — swap to a real <a> once those routes
              exist. */}
          <span className={styles.recognitionItemLabel} data-area={v.slug}>
            {v.area}
          </span>
        </li>
      ))}
    </ul>
  );
}
