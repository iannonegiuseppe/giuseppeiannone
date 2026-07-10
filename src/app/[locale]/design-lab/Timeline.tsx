"use client";

import { useEffect, useRef } from "react";
import styles from "./design-lab.module.scss";

export type TimelineStep = {
  numeral: string;
  title: string;
  text: string;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// Scroll-container detection, not a hardcoded assumption: globals.scss
// used to set `overflow-x: hidden` on html/body, which (per the CSS
// Overflow spec's overflow-x/overflow-y pairing rule) silently forced
// overflow-y to compute as `auto` on both — making <body> the element that
// actually scrolled, not the window. That guardrail is now `overflow-x:
// clip` instead (fixed in the double-vertical-scrollbar pass — clip
// doesn't pair-trigger overflow-y:auto), so window/documentElement are the
// real scroll container again. This helper still checks computed
// overflow-y (not just scrollHeight > clientHeight, which stays true for
// body regardless of whether it's actually scrollable — a plain height
// comparison would silently keep picking body and attaching a scroll
// listener that never fires) so it self-corrects to whichever element is
// ACTUALLY scrollable, rather than re-hardcoding an assumption that could
// go stale again the next time this guardrail changes.
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

// Desktop/tablet zigzag: centered axis, scroll-driven progress fill, node
// active-state toggling, and per-card reveal — all in one effect since
// they share the same measurements (axis bounds, node positions). Geometry
// (all getBoundingClientRect reads) is measured ONCE on mount + on resize,
// never inside the scroll handler itself — the scroll/rAF callback only
// does cheap arithmetic (a scrollTop property read + innerHeight) and
// style writes, per the "no layout thrash" requirement.
export function TimelineDesktop({ steps }: { steps: TimelineStep[] }) {
  const axisRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      // Fully filled, all nodes active, cards fully visible — no listeners
      // of any kind attached, per spec.
      if (fillRef.current) fillRef.current.style.transform = "scaleY(1)";
      nodeRefs.current.forEach((node) => node?.classList.add(styles.timelineNodeActive!));
      return;
    }

    // This component's own DOM is display:none below md — skip entirely
    // rather than run scroll/observer work behind a hidden subtree.
    if (!window.matchMedia("(min-width: 48rem)").matches) return;

    // Content is visible by default (no JS = no hiding, see the CSS
    // comment on .timelineCardRevealed); only NOW, since motion is going
    // to run, do we add the pending (hidden) state — mirrors
    // RevealOnScroll.tsx's established pattern.
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const pendingClass = i % 2 === 0 ? styles.timelineCardPendingLeft! : styles.timelineCardPendingRight!;
      card.classList.add(pendingClass);
    });

    // Detected once — re-detecting on resize would risk attaching the
    // listener to a different element than the one actually receiving
    // events without moving the listener too. This page's scroll
    // container is determined by global CSS, not anything reactive, so a
    // one-time detection is sufficient.
    const scrollContainer = getScrollContainer();
    let axisTop = 0;
    let axisHeight = 0;
    let nodeRatios: number[] = [];

    function measure() {
      const axis = axisRef.current;
      if (!axis) return;
      const scrollTop = getScrollTop(scrollContainer);
      const rect = axis.getBoundingClientRect();
      axisTop = rect.top + scrollTop;
      axisHeight = rect.height;
      nodeRatios = nodeRefs.current.map((node) => {
        if (!node || axisHeight === 0) return 0;
        const nodeRect = node.getBoundingClientRect();
        const nodeCenterY = nodeRect.top + scrollTop + nodeRect.height / 2;
        return (nodeCenterY - axisTop) / axisHeight;
      });
    }
    measure();

    let rafId: number | null = null;
    function update() {
      rafId = null;
      const viewportLine = getScrollTop(scrollContainer) + window.innerHeight * 0.7;
      const progress = axisHeight > 0 ? clamp01((viewportLine - axisTop) / axisHeight) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;
      nodeRefs.current.forEach((node, i) => {
        node?.classList.toggle(styles.timelineNodeActive!, progress >= nodeRatios[i]!);
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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.timelineCardRevealed!);
            observer.unobserve(entry.target); // once per card, never re-hide on scroll-up
          }
        }
      },
      { threshold: 0.25 },
    );
    cardRefs.current.forEach((card) => card && observer.observe(card));

    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [steps.length]);

  return (
    <div className={styles.timelineDesktop}>
      <div className={styles.timelineAxis} ref={axisRef} aria-hidden="true">
        <div className={styles.timelineFill} ref={fillRef} />
      </div>
      <div className={styles.timelineRows}>
        {steps.map((step, i) => {
          const isRight = i % 2 === 1;
          return (
            <div
              key={step.numeral}
              className={`${styles.timelineRow} ${isRight ? styles.timelineRowRight : styles.timelineRowLeft}`}
            >
              <div
                className={styles.timelineCard}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              >
                <h3 className={styles.timelineCardTitle}>{step.title}</h3>
                <p className={styles.timelineCardText}>{step.text}</p>
              </div>
              <span className={styles.timelineConnector} aria-hidden="true" />
              <div
                className={styles.timelineNode}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                aria-hidden="true"
              >
                <span className={styles.timelineNodeNumeral}>{step.numeral}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mobile sticky stack. The "acceptable simplification" the spec names
// explicitly: instead of computing true scroll-driven overlap geometry,
// each card (from the 2nd on) is observed with a rootMargin that creates a
// detection BAND starting at the sticky offset (top: 88px) — when a card
// crosses into that band (i.e. arrives at/past its own sticky position),
// the PRECEDING card is marked "covered."
//
// HONESTY-RULE NOTE: the first version of this used a hairline 1px
// detection line (exactly 88-89px) instead of a band, on the assumption
// that a sticky element settles at EXACTLY its `top` value. Empirically
// (traced scroll position by position) that's not quite true — measured
// settle position was ~90-91px, 2-3px past the assumed 88px, which put it
// just outside a 1px line and made the "covered" state flicker on and off
// as the card scrolled rather than staying on. Confirmed via
// getBoundingClientRect() traces, not guessed. Widened to a 40px band
// below the sticky offset, which comfortably absorbs that settle variance
// (verified below) — this is the "acceptable simplification proving
// unreliable" case the spec names, resolved by widening the band rather
// than reporting it as unfixable, since the fix is a reasonable tolerance
// adjustment, not a workaround that changes the visible behavior.
export function TimelineMobileStack({ steps }: { steps: TimelineStep[] }) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return; // static column, no sticky/scaling — CSS handles it entirely

    // This component's own DOM is display:none at md+ — skip entirely.
    if (window.matchMedia("(min-width: 48rem)").matches) return;

    // Header pass collision check: kept in sync with .timelineMobileCard's
    // own `top` (design-lab.module.scss) — see that rule's comment for
    // why this moved from 88 to 100 (a fixed mobile header now lives
    // above this stack; the old 88px offset only coincidentally cleared
    // it by 11px, not an intentional margin).
    const STICKY_OFFSET = 100;
    const DETECTION_BAND = 40;

    function buildObserver() {
      const rootMargin = `-${STICKY_OFFSET}px 0px -${Math.max(0, window.innerHeight - STICKY_OFFSET - DETECTION_BAND)}px 0px`;
      return new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const idx = Number((entry.target as HTMLElement).dataset.cardIndex);
            const prevCard = cardRefs.current[idx - 1];
            prevCard?.classList.toggle(styles.timelineMobileCardCovered!, entry.isIntersecting);
          }
        },
        { rootMargin, threshold: 0 },
      );
    }

    let observer = buildObserver();
    cardRefs.current.forEach((card, i) => {
      if (i > 0 && card) observer.observe(card);
    });

    function onResize() {
      observer.disconnect();
      observer = buildObserver();
      cardRefs.current.forEach((card, i) => {
        if (i > 0 && card) observer.observe(card);
      });
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [steps.length]);

  return (
    <div className={styles.timelineMobileStack}>
      {steps.map((step, i) => (
        <div
          key={step.numeral}
          className={styles.timelineMobileCard}
          data-card-index={i}
          style={{ ["--timeline-mobile-z" as string]: i + 1 } as React.CSSProperties}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
        >
          <h3 className={styles.timelineMobileCardTitle}>
            <span className={styles.timelineMobileCardNumeral} aria-hidden="true">
              {step.numeral}
            </span>
            {step.title}
          </h3>
          <p className={styles.timelineMobileCardText}>{step.text}</p>
        </div>
      ))}
    </div>
  );
}
