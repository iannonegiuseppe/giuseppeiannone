"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./marquee.module.scss";

// Single switch to compare both variants with one edit. Switched to
// 'auto' this pass: scroll-linked motion never revealed the full list
// unless the visitor scrolled far enough past the strip, so a slow
// continuous loop (paused on hover/focus, no motion at all under
// reduced-motion) replaces it as the default. 'scroll' ties the strip's
// horizontal offset to how far the page has scrolled past it instead —
// kept working behind this switch for comparison.
const MARQUEE_MODE: "scroll" | "auto" = "auto";

const AUTO_SPEED_PX_PER_SEC = 28;
const SCROLL_LINK_RATIO = 0.35; // px of translation per px of page scroll

export function CertificatesMarquee({ items }: { items: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const singleCopyRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);
  const [offsetPx, setOffsetPx] = useState(0);

  // Pause on hover and on keyboard focus — a plain ref, not React state,
  // since it only needs to gate the next scroll/rAF tick, not trigger a
  // render itself. Registered once regardless of MARQUEE_MODE.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    const setPaused = (value: boolean) => () => {
      pausedRef.current = value;
    };
    const onEnter = setPaused(true);
    const onLeave = setPaused(false);
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    root.addEventListener("focusin", onEnter);
    root.addEventListener("focusout", onLeave);
    return () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
      root.removeEventListener("focusin", onEnter);
      root.removeEventListener("focusout", onLeave);
    };
  }, []);

  // Reduced-motion: skip every listener/rAF below entirely and render the
  // static, wrapped fallback via CSS (marquee.module.scss's own
  // reduced-motion block) — same "effect returns early, CSS carries the
  // end-state" convention as MetodoInteractive.tsx.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const singleCopy = singleCopyRef.current;
    if (!singleCopy) return;

    let trackWidth = singleCopy.getBoundingClientRect().width || 1;
    const resizeObserver = new ResizeObserver(() => {
      trackWidth = singleCopy.getBoundingClientRect().width || 1;
    });
    resizeObserver.observe(singleCopy);

    function setOffsetWrapped(px: number) {
      const wrapped = ((px % trackWidth) + trackWidth) % trackWidth;
      setOffsetPx(wrapped);
    }

    if (MARQUEE_MODE === "scroll") {
      let ticking = false;
      function onScroll() {
        if (ticking || pausedRef.current) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          setOffsetWrapped(window.scrollY * SCROLL_LINK_RATIO);
        });
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => {
        window.removeEventListener("scroll", onScroll);
        resizeObserver.disconnect();
      };
    }

    // 'auto' mode — constant-speed rAF loop, paused via pausedRef.
    let current = 0;
    let last = performance.now();
    let rafId = requestAnimationFrame(function tick(now) {
      const dt = now - last;
      last = now;
      if (!pausedRef.current) {
        current += (AUTO_SPEED_PX_PER_SEC * dt) / 1000;
        setOffsetWrapped(current);
      }
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.marqueeSection} aria-label="Titoli e qualifiche">
      <div className={styles.marqueeFade}>
        <div className={styles.marqueeTrack} style={{ transform: `translateX(${-offsetPx}px)` }}>
          <ul ref={singleCopyRef} className={styles.marqueeList} role="list">
            {items.map((item) => (
              <li key={item} className={styles.marqueeItem}>
                <span>{item}</span>
                <span className={styles.marqueeSeparator} aria-hidden="true" />
              </li>
            ))}
          </ul>
          <ul className={styles.marqueeList} role="list" aria-hidden="true">
            {items.map((item) => (
              <li key={item} className={styles.marqueeItem}>
                <span>{item}</span>
                <span className={styles.marqueeSeparator} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
