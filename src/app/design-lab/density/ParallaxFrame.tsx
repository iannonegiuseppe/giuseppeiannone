"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { useLenisRef } from "@/components/LenisProvider";
import styles from "./density.module.scss";

// Mechanic (unchanged from last pass, confirmed correct): the image is
// `position: fixed` — pinned to the viewport, never translating, never
// scaling. The frame is a normal in-flow element; as it scrolls, a
// clip-path computed from the frame's position moves with it, opening a
// window onto the stationary image.
//
// Item 2 fix — jitter, cause confirmed: the clip was computed from a
// FRESH getBoundingClientRect() read inside the scroll callback, every
// tick. getBoundingClientRect() reflects whatever the browser's layout
// engine currently has committed — reading it inside a scroll-driven
// callback can land a frame ahead of or behind the scroll value Lenis is
// actually painting that same tick, especially under Lenis's own
// interpolated (lerp) scrolling rather than a 1:1 native scroll. Two
// slightly-desynced signals (a live rect vs. the scroll position driving
// it) is exactly what reads as jitter/shimmer rather than smooth motion.
//
// Fixed per this pass's own prescription: the frame's ABSOLUTE document
// offset (rect.top + scrollY) is measured ONCE — on mount, and again
// only via ResizeObserver (on the frame itself AND on documentElement,
// the second one catching layout shifts from content ABOVE the frame
// without the frame's own box changing size — the same real bug this
// session's Signature-band fix already found and fixed the same way).
// The clip is then computed as `cachedAbsoluteTop - lenisScrollValue`
// every tick — lenisScrollValue read from the Lenis INSTANCE the
// scroll-event callback itself receives (`lenis.scroll`), never
// window.scrollY, never a fresh rect. One authoritative scroll number
// per tick, no fresh layout read racing it.
export function ParallaxFrame({
  aspect,
  label,
  imageUrl,
  imageAlt,
}: {
  aspect?: string;
  label: string;
  imageUrl?: string;
  imageAlt?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const lenisRef = useLenisRef();
  const [fixedMode, setFixedMode] = useState(false);
  const [clip, setClip] = useState({ top: 0, right: 0, bottom: 0, left: 0 });

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frame = frameRef.current;
    if (!frame) return;

    setFixedMode(true);

    // Cached, not re-read per scroll tick. absoluteTop = document-
    // absolute position (stable across scrolling); height/width/left
    // cached alongside it so a resize re-measures all four together.
    let absoluteTop = 0;
    let frameHeight = 0;
    let frameWidth = 0;
    let frameLeft = 0;
    function measure() {
      const rect = frame!.getBoundingClientRect();
      absoluteTop = rect.top + window.scrollY;
      frameHeight = rect.height;
      frameWidth = rect.width;
      frameLeft = rect.left;
    }
    measure();

    // Rounded to whole pixels. Tested both: unrounded sub-pixel clip
    // values (e.g. "44.5156px") introduced their own faint shimmer on
    // some frames (the browser rasterizing a clip edge at a fractional
    // device pixel differently tick to tick) that rounding removes
    // outright; rounding itself introduced no visible stepping at
    // normal scroll speed, including scrolling deliberately slowly
    // through the whole section end to end. Kept rounded.
    function update(scrollValue: number) {
      const frameTop = absoluteTop - scrollValue;
      const frameBottom = frameTop + frameHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setClip({
        top: Math.round(frameTop),
        right: Math.round(vw - (frameLeft + frameWidth)),
        bottom: Math.round(vh - frameBottom),
        left: Math.round(frameLeft),
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      measure();
      const lenis = lenisRef?.current;
      update(lenis ? lenis.scroll : window.scrollY);
    });
    resizeObserver.observe(frame);
    resizeObserver.observe(document.documentElement);

    let ticking = false;
    function onLenisScroll(lenis: { scroll: number }) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update(lenis.scroll);
      });
    }

    let cleanupScroll: (() => void) | undefined;
    const setupId = requestAnimationFrame(() => {
      measure();
      const lenis = lenisRef?.current;
      if (lenis) {
        cleanupScroll = lenis.on("scroll", onLenisScroll);
        update(lenis.scroll);
      } else {
        const onNativeScroll = () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            ticking = false;
            update(window.scrollY);
          });
        };
        window.addEventListener("scroll", onNativeScroll, { passive: true });
        cleanupScroll = () => window.removeEventListener("scroll", onNativeScroll);
        update(window.scrollY);
      }
    });

    return () => {
      cancelAnimationFrame(setupId);
      cleanupScroll?.();
      resizeObserver.disconnect();
    };
  }, [lenisRef]);

  return (
    <div ref={frameRef} className={styles.parallaxFrame} style={{ aspectRatio: aspect }}>
      {imageUrl ? (
        fixedMode ? (
          <div
            className={styles.parallaxFixedLayer}
            style={{ clipPath: `inset(${clip.top}px ${clip.right}px ${clip.bottom}px ${clip.left}px)` }}
          >
            <Image src={imageUrl} alt={imageAlt ?? ""} fill sizes="100vw" className={styles.parallaxImg} />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={imageAlt ?? ""}
            fill
            sizes="100vw"
            className={styles.parallaxImg}
          />
        )
      ) : (
        <span className={styles.parallaxLabel}>{label}</span>
      )}
    </div>
  );
}
