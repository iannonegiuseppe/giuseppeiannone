"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Vignette } from "./RecognitionHighlightList";
import styles from "./design-lab.module.scss";

// Revision round 1, item 6: full-section background media layer, one
// image per vignette, crossfading as the scroll highlight changes.
// Deliberately a SEPARATE client component from RecognitionHighlightList
// (not a shared prop/callback wired between them) — same "duplicate
// rather than share" convention this file already follows elsewhere
// (e.g. isScrollable/getScrollContainer duplicated verbatim across
// Timeline.tsx/SedesStage.tsx/this file). Both components independently
// compute the SAME "nearest vignette to viewport center" from the SAME
// vignette items (queried via the `data-lit` attribute
// RecognitionHighlightList's own <li> elements already carry, so no new
// DOM plumbing is needed to keep the two in sync), so they can't drift
// even though neither one drives the other.
//
// next/image with `fill` + `object-fit: cover` is the REAL, final
// rendering mechanism, not a placeholder shortcut — pointed at abstract
// SVG placeholders for now (public/design-lab/recognition-visual-*.svg,
// dangerouslyAllowSVG is already enabled in next.config), swapped to the
// owner's real PNGs later by changing each vignette's `visual` path only,
// nothing here.
export function RecognitionBackgroundVisuals({ vignettes }: { vignettes: Vignette[] }) {
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Reduced motion: first vignette's visual shown statically (matches
    // the text fallback's "all lit" -> "first area's visual, static"
    // rule) — no listener, no crossfade, ever, per spec.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function getItems(): HTMLElement[] {
      return [...document.querySelectorAll<HTMLElement>('[data-lab-section="recognition"] li[data-lit]')];
    }

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

    const scrollContainer = getScrollContainer();
    let centers: number[] = [];

    function measure() {
      const scrollTop = getScrollTop(scrollContainer);
      centers = getItems().map((item) => {
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
      imageRefs.current.forEach((el, i) => {
        el?.setAttribute("data-active", i === nearestIndex ? "true" : "false");
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
    <div className={styles.recognitionBackgroundLayer} aria-hidden="true">
      {vignettes.map((v, i) => (
        <div
          key={v.id}
          className={styles.recognitionBackgroundVisual}
          data-active={i === 0 ? "true" : "false"}
          ref={(el) => {
            imageRefs.current[i] = el;
          }}
        >
          <Image src={v.visual} alt="" fill sizes="100vw" className={styles.recognitionBackgroundVisualImg} />
        </div>
      ))}
    </div>
  );
}
