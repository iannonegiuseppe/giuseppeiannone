"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import styles from "./JourneySection.module.scss";

// Desktop-only feature (the fill/spine mechanics below don't apply to
// the mobile inline layout) — same breakpoint the rest of this
// component's own CSS switches on (lg, 64rem).
const DESKTOP_QUERY = "(min-width: 64rem)";

interface JourneyStepDoc {
  title: string;
  shortLine: string;
  expandedText: string;
}

// Interactive rebuild — supersedes the earlier static staircase pass
// entirely (offsets dropped, replaced by a fixed left column + a
// desktop-only right panel that shows whichever step is active).
// Same exclusive-select shape as FaqAccordion.tsx (useState(0) default-
// first-open, useId for aria wiring) adapted from "click toggles a
// panel open/closed" to "hover/click/focus selects which step's
// content the shared right panel shows" — a genuinely different
// interaction, so this isn't just FaqAccordion renamed, but the same
// underlying state shape and default-active convention.
//
// Mobile has no panel at all — every step's expandedText is rendered
// inline, always visible (a second, unconditional paragraph per step;
// hidden at lg+ purely via CSS, see .journeyStepExpandedMobile). The
// activeIndex state and its handlers are harmless no-ops there (buttons
// stay clickable/focusable, which is fine — just nothing visually
// depends on it below lg).
//
// Reveal-on-scroll lives here directly (not a separate wrapper like
// HopeReveal/the earlier JourneyReveal) since this component already
// owns client-side state — one IntersectionObserver toggling a
// "revealed" class on the root ref, same one-shot shape as every other
// section's own reveal mechanism, just co-located instead of split out.
export function JourneyInteractive({ steps }: { steps: JourneyStepDoc[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fillHeight, setFillHeight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const stepsColumnRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const numeralRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const baseId = useId();

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.classList.add(styles.journeyStepsPending!);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.journeyStepsRevealed!);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Fill height = real distance from the track's own top to the active
  // numeral's vertical center — measured, never a hardcoded per-step
  // percentage (numeral heights/positions depend on font-size, which
  // step is active, and how title/shortLine happen to wrap at the
  // current viewport width, none of which is knowable in advance).
  // useLayoutEffect (not useEffect): measuring after paint but before
  // the browser's next paint avoids a visible one-frame flash of the
  // previous (or zero) height. Re-runs on activeIndex change (new
  // target numeral) and via the ResizeObserver below (viewport resize,
  // or any reflow that shifts row heights — e.g. text rewrapping at a
  // narrower width — even when the breakpoint itself hasn't changed).
  useLayoutEffect(() => {
    function measure() {
      if (!window.matchMedia(DESKTOP_QUERY).matches) return;
      const thread = threadRef.current;
      const numeral = numeralRefs.current[activeIndex];
      if (!thread || !numeral) return;
      const threadRect = thread.getBoundingClientRect();
      const numeralRect = numeral.getBoundingClientRect();
      const numeralCenter = numeralRect.top + numeralRect.height / 2;
      setFillHeight(Math.max(0, numeralCenter - threadRect.top));
    }

    measure();

    // Catches a real race, found empirically: the numeral's own reveal
    // transition (.journeyStepRow's translateY(0.75rem) -> 0) can still
    // be in flight when this effect's own synchronous measure() runs,
    // capturing the numeral's PRE-settle position — step 1's initial
    // fill measured 12px short of the numeral's true center, exactly
    // the 0.75rem entrance offset. A fixed setTimeout was tried first
    // and was WRONG: it's relative to this effect running (mount time),
    // not to whenever the section actually scrolls into view and the
    // reveal transition actually starts (IntersectionObserver-gated,
    // could be well after mount, or the timer could fire before the
    // transition even begins) — confirmed by it still showing the same
    // 12px gap in testing. `transitionend` reacts to the transition
    // actually finishing, whenever that real is, with no duration
    // guessing. Filtered to `transform` so this doesn't also re-measure
    // on unrelated transitions (numeral/title color, panel fade).
    function onTransitionEnd(event: TransitionEvent) {
      if (event.propertyName === "transform") measure();
    }
    const root = rootRef.current;
    root?.addEventListener("transitionend", onTransitionEnd);

    const target = stepsColumnRef.current;
    if (!target || typeof ResizeObserver === "undefined") {
      return () => root?.removeEventListener("transitionend", onTransitionEnd);
    }
    const observer = new ResizeObserver(() => measure());
    observer.observe(target);
    return () => {
      root?.removeEventListener("transitionend", onTransitionEnd);
      observer.disconnect();
    };
  }, [activeIndex, steps.length]);

  const activeStep = steps[activeIndex];

  return (
    <div ref={rootRef} className={styles.journeyLayout}>
      <div className={styles.journeySteps} ref={stepsColumnRef}>
        {/* Track + fill + end dot are all decorative — the real
            navigation semantics live on the buttons below
            (aria-current, focus, click). */}
        <div className={styles.journeyThread} ref={threadRef} aria-hidden="true">
          <div className={styles.journeyThreadFill} style={{ height: `${fillHeight}px` }} aria-hidden="true" />
          <span className={styles.journeyThreadEnd} aria-hidden="true" />
        </div>
        <ol className={styles.journeyStepsList}>
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            const panelId = `${baseId}-panel`;
            return (
              <li key={`${step.title}-${index}`} className={styles.journeyStep}>
                <button
                  type="button"
                  className={styles.journeyStepButton}
                  aria-current={isActive ? "step" : undefined}
                  aria-controls={panelId}
                  data-active={isActive}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                >
                  <div className={styles.journeyStepRow}>
                    <p
                      className={styles.journeyStepNumeral}
                      data-active={isActive}
                      aria-hidden="true"
                      ref={(el) => {
                        numeralRefs.current[index] = el;
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <div className={styles.journeyStepBody}>
                      <h3 className={styles.journeyStepTitle} data-active={isActive}>
                        {step.title}
                      </h3>
                      <p className={styles.journeyStepShortLine}>{step.shortLine}</p>
                    </div>
                  </div>
                </button>
                {/* Mobile only (see .journeyStepExpandedMobile) — always
                    visible, not gated behind activeIndex; the desktop
                    right panel below is this same copy's other home. */}
                <p className={styles.journeyStepExpandedMobile}>{step.expandedText}</p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Desktop only (see .journeyPanel). Always filled — activeIndex
          defaults to 0, so step 01 shows from first paint, never an
          empty state. key={activeIndex} remounts the text/numeral nodes
          on change, which is what makes the fade-in CSS animation below
          replay each time (a plain class toggle wouldn't restart a
          CSS animation on already-mounted nodes without a reflow hack;
          a fresh key is the standard, reliable way to do this). */}
      <div className={styles.journeyPanel} aria-live="polite" id={`${baseId}-panel`}>
        <p key={`numeral-${activeIndex}`} className={styles.journeyPanelNumeral} aria-hidden="true">
          {String(activeIndex + 1).padStart(2, "0")}
        </p>
        <p key={`text-${activeIndex}`} className={styles.journeyPanelText}>
          {activeStep?.expandedText}
        </p>
      </div>
    </div>
  );
}
