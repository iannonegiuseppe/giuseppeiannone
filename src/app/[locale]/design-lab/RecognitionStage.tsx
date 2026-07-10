"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { RecognitionBackgroundVisuals } from "./RecognitionBackgroundVisuals";
import { RecognitionHighlightList, type Vignette } from "./RecognitionHighlightList";
import styles from "./design-lab.module.scss";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// Same useSyncExternalStore-with-a-no-op-subscribe pattern as
// SedesStage.tsx/HeroMedia.tsx: a one-time, post-hydration decision
// (reduced-motion is a full opt-out, not something that should hot-swap
// layouts if the OS setting changes mid-visit). `false` (the existing,
// non-pinned layout) is both the server snapshot and the safe default
// while un-hydrated, matching what SSR always renders.
function subscribePinnedNever() {
  return () => {};
}
function getPinnedServerSnapshot() {
  return false;
}
function getPinnedSnapshot() {
  // Revision round 2, item 4: pinning only activates at md (768px) and
  // up — measured (not guessed): at 390px the header + all 5 vignettes
  // need ~1279px against an ~844px viewport, a 435px overflow font/gap
  // scaling can't reasonably close without hurting legibility of actual
  // sentence-length vignette text, so mobile explicitly keeps the
  // existing non-pinned, viewport-center-driven behavior (unchanged),
  // per spec's own "if they cannot fit, keep the current non-pinned
  // mobile behavior" escape hatch. At md/lg the overflow was much
  // smaller (~86-106px) and closed with the pinned-context gap/font
  // reductions below (verified after implementing, not assumed).
  const isMdWidth = window.matchMedia("(min-width: 48rem)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return isMdWidth && !reducedMotion;
}

// Same scroll-container detection as Timeline.tsx/SedesStage.tsx/
// RecognitionHighlightList.tsx/RecognitionBackgroundVisuals.tsx — see
// Timeline.tsx's own comment for the full CSS-spec explanation. Reused
// verbatim rather than extracted to a shared module, per this file's
// established duplication convention.
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

const WATERMARK_GLYPH = "“";

function HeaderBlock({ kicker, heading, bridgeLine }: { kicker: string; heading: string; bridgeLine: string }) {
  return (
    <div className={styles.recognitionHeader}>
      <p className={styles.recognitionKicker}>
        <span className={styles.recognitionKickerRule} aria-hidden="true" />
        {kicker}
      </p>
      <h2 className={styles.recognitionHeading}>{heading}</h2>
      <p className={styles.recognitionBridge}>{bridgeLine}</p>
    </div>
  );
}

// Piecewise-linear distance-from-center curve, per spec's own 3 data
// points (0 / ±1 / ±2) — extrapolated flat beyond ±2 (no 4th point was
// given, and with 5 items the max possible distance is 4, e.g. t=0
// against item index 4).
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function styleForDistance(distance: number): { opacity: number; scale: number } {
  const d = Math.abs(distance);
  if (d <= 1) return { opacity: lerp(1, 0.35, d), scale: lerp(1, 0.92, d) };
  if (d <= 2) return { opacity: lerp(0.35, 0.15, d - 1), scale: lerp(0.92, 0.9, d - 1) };
  return { opacity: 0.15, scale: 0.9 };
}

// Revision round 2, item 4 / round 3, item 2: pinned composition, same
// track+sticky-stage technique family as SedesStage.tsx, deliberately
// simpler — one scroll listener drives the drum's continuous translateY,
// the per-item distance opacity/scale, the signpost visibility, AND the
// background crossfade, all from a SINGLE progress value (replacing
// RecognitionHighlightList's own separate viewport-center detection, and
// RecognitionBackgroundVisuals' own independent one, which this
// component does not use — both stay exactly as they are for the
// non-pinned branch below).
function PinnedStage({
  kicker,
  heading,
  bridgeLine,
  vignettes,
}: {
  kicker: string;
  heading: string;
  bridgeLine: string;
  vignettes: Vignette[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // HONESTY-RULE CATCH (measured, not guessed): an earlier draft drove
  // this via React state (setActiveIndex on every scroll-computed index
  // change) — production-build PerformanceObserver measurement showed a
  // consistent ~85-140ms long task on every run that a quiet section
  // scrolled the same way never produced, traced to the resulting
  // reconciliation of 10 elements (5 list items + 5 background visuals,
  // including next/image internals) on every index change. Switched to
  // the SAME direct-DOM-attribute-via-refs pattern
  // RecognitionHighlightList.tsx already uses for exactly this reason
  // (see that file's own comment: "no layout reads in the hot path...
  // zero CLS, no long tasks requirement") — no React re-render in the
  // scroll hot path at all. Round 3's continuous drum uses the same
  // discipline: every per-frame write is a direct style/attribute
  // mutation on a ref, never setState.
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const visualRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    const list = listRef.current;
    if (!track || !viewport || !list) return;

    const scrollContainer = getScrollContainer();
    let trackTop = 0;
    let trackHeight = 0;
    let viewportCenterY = 0;
    let itemCenters: number[] = [];

    function measure() {
      const scrollTop = getScrollTop(scrollContainer);
      const trackRect = track!.getBoundingClientRect();
      trackTop = trackRect.top + scrollTop;
      trackHeight = trackRect.height;

      viewportCenterY = viewport!.getBoundingClientRect().height / 2;

      // Each item's center, relative to the LIST's own top edge. Reading
      // getBoundingClientRect() here (rather than offsetTop) works
      // correctly regardless of the list's CURRENT translateY, since
      // both the list and its children shift by the same transform —
      // the relative difference between them is unaffected by it.
      const listTop = list!.getBoundingClientRect().top;
      itemCenters = itemRefs.current.map((el) => {
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        return r.top - listTop + r.height / 2;
      });
    }
    measure();

    let rafId: number | null = null;
    function update() {
      rafId = null;
      const scrollTop = getScrollTop(scrollContainer);
      const pinnedRange = Math.max(1, trackHeight - window.innerHeight);
      const progress = clamp01((scrollTop - trackTop) / pinnedRange);
      // Continuous position along the drum, 0 to (count - 1) — round()
      // of this (below) gives the discrete background scene index per
      // spec's own "scene index = round(progress * 4)" (4 = count - 1
      // for 5 vignettes).
      const t = progress * (vignettes.length - 1);

      const lower = Math.floor(t);
      const upper = Math.min(vignettes.length - 1, lower + 1);
      const frac = t - lower;
      const virtualCenter = lerp(itemCenters[lower] ?? 0, itemCenters[upper] ?? 0, frac);
      list!.style.transform = `translateY(${viewportCenterY - virtualCenter}px)`;

      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const { opacity, scale } = styleForDistance(t - i);
        el.style.opacity = String(opacity);
        el.style.transform = `scale(${scale})`;
      });
      labelRefs.current.forEach((el, i) => {
        if (!el) return;
        // "Signpost fully visible only on the active item" — a narrow
        // band around the exact center, not the same broad curve as the
        // vignette text's own opacity.
        el.style.opacity = Math.abs(t - i) < 0.2 ? "1" : "0";
      });

      const sceneIndex = Math.round(t);
      visualRefs.current.forEach((el, i) => el?.setAttribute("data-active", i === sceneIndex ? "true" : "false"));
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
    <div
      ref={trackRef}
      className={styles.recognitionTrack}
      style={{ "--recognition-vignette-count": vignettes.length } as React.CSSProperties}
    >
      <div className={styles.recognitionStage}>
        <div className={styles.recognitionBackgroundLayer} aria-hidden="true">
          {vignettes.map((v, i) => (
            <div
              key={v.id}
              className={styles.recognitionBackgroundVisual}
              data-active={i === 0 ? "true" : "false"}
              ref={(el) => {
                visualRefs.current[i] = el;
              }}
            >
              <Image src={v.visual} alt="" fill sizes="100vw" className={styles.recognitionBackgroundVisualImg} />
            </div>
          ))}
        </div>

        <HeaderBlock kicker={kicker} heading={heading} bridgeLine={bridgeLine} />

        <div className={styles.recognitionListWrap}>
          <p className={styles.recognitionWatermark} aria-hidden="true">
            {WATERMARK_GLYPH}
          </p>
          <div ref={viewportRef} className={styles.recognitionDrumViewport}>
            <ul ref={listRef} className={styles.recognitionList}>
              {vignettes.map((v, i) => (
                <li
                  key={v.id}
                  className={styles.recognitionItem}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                >
                  <p className={styles.recognitionItemVignette}>{v.vignette}</p>
                  <span
                    className={styles.recognitionItemLabel}
                    data-area={v.slug}
                    ref={(el) => {
                      labelRefs.current[i] = el;
                    }}
                  >
                    {v.area}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecognitionStage({
  kicker,
  heading,
  bridgeLine,
  vignettes,
}: {
  kicker: string;
  heading: string;
  bridgeLine: string;
  vignettes: Vignette[];
}) {
  const pinned = useSyncExternalStore(subscribePinnedNever, getPinnedSnapshot, getPinnedServerSnapshot);

  if (pinned) {
    return <PinnedStage kicker={kicker} heading={heading} bridgeLine={bridgeLine} vignettes={vignettes} />;
  }

  // Non-pinned branch: byte-identical to the pre-item-4 markup — mobile
  // (<768px) and prefers-reduced-motion both land here, unchanged, per
  // spec ("keep the current non-pinned mobile behavior" / "reduced-
  // motion: NO track, NO pin").
  return (
    <>
      <RecognitionBackgroundVisuals vignettes={vignettes} />
      <HeaderBlock kicker={kicker} heading={heading} bridgeLine={bridgeLine} />
      <div className={styles.recognitionListWrap}>
        <p className={styles.recognitionWatermark} aria-hidden="true">
          {WATERMARK_GLYPH}
        </p>
        <RecognitionHighlightList vignettes={vignettes} />
      </div>
    </>
  );
}
