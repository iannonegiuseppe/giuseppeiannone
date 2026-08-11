"use client";

import { useEffect, useRef, useState } from "react";
import type { TimelineEntryResolved } from "@/components/TimelineEntry";
import { TimelineRouteCardContent } from "@/components/TimelineRouteCardContent";
import { useLenisRef } from "@/components/LenisProvider";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { ShimmerText } from "@/components/ShimmerText";
import sectionStyles from "./TimelineSection.module.scss";
import styles from "./TimelineVariants.module.scss";

const GRADIENTS = [styles.gradA, styles.gradB, styles.gradC];
const LENIS_WAIT_RETRIES = 30;
const LENIS_WAIT_INTERVAL_MS = 100;

// Substring-match emphasis — same helper as TimelineSection.tsx's own
// renderHeadingWithShimmer, duplicated per this codebase's established
// convention (this is the second DOM copy of the same heading, pinned
// lg+/motion-allowed; TimelineSection.tsx's own copy is what below-lg/
// reduced-motion actually shows). Hardcoded to "percorso" for the same
// reason as that file's own comment.
function renderHeadingWithShimmer(text: string) {
  const emphasisWord = "percorso";
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <ShimmerText className={sectionStyles.headingEmphasis}>{emphasisWord}</ShimmerText>
      {after}
    </>
  );
}

// Pinned Route — lg+, motion-allowed only (see TimelineRoute.tsx's own
// dual-tree comment; the normal-flow TimelineRouteEntry.tsx list is
// the fallback below lg / under reduced motion, not replaced by this).
//
// This is deliberately the SAME mechanism the original TimelinePinned.tsx
// used before it was removed (a tall spacer + `position: sticky` inner,
// scroll PROGRESS read from the spacer's own position via the shared
// Lenis instance — no native `scroll` listener) — reused, not
// reinvented, because the mechanism itself was never the problem.
//
// What WAS the problem, and why it doesn't recur here: the removed
// version force-fit every entry into one crossfaded box regardless of
// content length, and that content was 3-6 paragraphs long, so the
// tallest entry either overflowed the box or the box had to be sized
// for it. This page's timeline entries were shortened to two
// paragraphs each in a later pass — measured live before building
// this: every Route card, real content, renders 345-426px tall at
// 1440px wide. A 100vh sticky stage has 300px+ of headroom over that
// even at a modest 700px-tall viewport.
//
// Deck pass — entries stack, they don't crossfade. `progress` is a
// continuous float (0..entries.length), read straight off scroll
// position on every Lenis tick, no debounce. Each card's own arrival
// fraction `li` is a pure function of `progress` — clamp(progress -
// (index - 1), 0, 1) — so the transform applied is a direct,
// un-eased mapping from scroll position (no CSS transition property
// anywhere on .routePinCard): the card behind never moves once it's
// arrived (li locks at 1 and stays, however far progress advances
// past it), and the incoming card starts sliding the INSTANT the
// previous one's own li reaches 1 — algebraically guaranteed (li(i+1)
// starts at progress = i, exactly where li(i) caps at 1), so there is
// no gap and no dead zone between cards, in either scroll direction.
// The trailing (1/entries.length) of the scroll range is deliberate
// dwell time on the last card before the pin releases — see
// jumpTo's own comment for why that same fraction anchors clicks.
export function TimelineRoutePinned({
  entries,
  kicker,
  heading,
  description,
}: {
  entries: TimelineEntryResolved[];
  kicker?: string;
  heading?: string;
  description?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lenisRef = useLenisRef();
  const [progress, setProgress] = useState(0);
  // Card 0 has no transition (li=1 from the start), so entries.length
  // cards only have (entries.length - 1) real transitions to spend
  // scroll progress on. Both compute() and jumpTo() scale by this, not
  // entries.length itself — see compute()'s own comment for the
  // dead-scroll bug this fixes. max(...,1) guards a hypothetical
  // 1-entry timeline against a divide-by-zero.
  const PIN_TRANSITION_COUNT = Math.max(entries.length - 1, 1);

  useEffect(() => {
    if (entries.length === 0) return;

    const lgQuery = window.matchMedia("(min-width: 64rem)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function pinIsActive() {
      return lgQuery.matches && !motionQuery.matches;
    }

    // Was window.innerHeight — correct only as long as .routePinSticky's
    // own CSS height was exactly 100vh. It no longer is (see that rule's
    // own comment: min(100vh, calc(18rem + 50vh)), shrinking the sticky
    // box on tall viewports to halve the centring gap around the stage).
    // The sticky element's OWN rendered height is what actually
    // determines its stickable range (a sticky child releases once its
    // containing block has scrolled past by (wrapperHeight -
    // stickyHeight)), so this now measures that directly rather than
    // assuming it matches the viewport — same total either way on short
    // viewports where the CSS min() still resolves to 100vh.
    function stickyHeight() {
      return stickyRef.current?.offsetHeight ?? window.innerHeight;
    }

    function compute() {
      const el = wrapperRef.current;
      if (!el || !pinIsActive()) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - stickyHeight();
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      const p = total > 0 ? scrolled / total : 0;
      // entries.length - 1, not entries.length: card 0 is hardcoded to
      // li=1 from the start (no transition to spend progress on — see
      // its own ternary below), so there are only (entries.length - 1)
      // real transitions for entries.length cards. Multiplying by the
      // full entries.length left the final 1/entries.length of the
      // scrollable range mapping to nothing — the last card already at
      // li=1, section still pinned, nothing on screen changing — a
      // dead-scroll tail measured live at 776px (out of 4662px total)
      // before this fix, confirmed as the actual cause of "empty space
      // that collapses as you finish scrolling" (not padding, which
      // was already ruled out). PIN_TRANSITION_COUNT below is the same
      // fix applied to jumpTo's own targetP.
      setProgress(p * PIN_TRANSITION_COUNT);
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    function attach(retriesLeft: number) {
      if (cancelled) return;
      const lenis = lenisRef?.current;
      if (!lenis) {
        if (retriesLeft <= 0) return;
        const timer = setTimeout(() => attach(retriesLeft - 1), LENIS_WAIT_INTERVAL_MS);
        cleanup = () => clearTimeout(timer);
        return;
      }
      compute();
      lenis.on("scroll", compute);
      cleanup = () => lenis.off("scroll", compute);
    }

    attach(LENIS_WAIT_RETRIES);
    window.addEventListener("resize", compute);
    return () => {
      cancelled = true;
      cleanup?.();
      window.removeEventListener("resize", compute);
    };
  }, [entries.length, lenisRef]);

  if (entries.length === 0) return null;

  const activeIndex = Math.min(entries.length - 1, Math.max(0, Math.round(progress)));

  // Targets progress === index — each card's own "fully arrived, next
  // one hasn't started" instant — converted back to an absolute page Y
  // via the wrapper's own (stable, layout-derived) position, then
  // handed to the EXISTING Lenis instance, never window.scrollTo. Works
  // identically whether the pin is currently engaged, hasn't been
  // reached yet, or has already been scrolled past: getBoundingClientRect
  // + window.scrollY resolves to the same absolute page coordinate
  // regardless of current scroll position, so this always scrolls TO
  // the pinned range and re-engages it — there's no separate "unpinned"
  // code path to handle. See this pass's own report for what that
  // looks like in each of those three starting states, confirmed live.
  function jumpTo(index: number) {
    const lenis = lenisRef?.current;
    const el = wrapperRef.current;
    if (!lenis || !el) return;
    const rect = el.getBoundingClientRect();
    const wrapperTop = rect.top + window.scrollY;
    const total = rect.height - (stickyRef.current?.offsetHeight ?? window.innerHeight);
    const targetP = index / PIN_TRANSITION_COUNT;
    const targetY = wrapperTop + targetP * Math.max(total, 0);
    lenis.scrollTo(targetY);
  }

  return (
    <div ref={wrapperRef} className={styles.routePinWrap} style={{ height: `${entries.length * 100}vh` }}>
      <div ref={stickyRef} className={styles.routePinSticky}>
        {kicker || heading || description ? (
          <div className={styles.routePinHeader}>
            {kicker ? (
              <p className={sectionStyles.kicker}>
                <SectionKicker>{kicker}</SectionKicker>
              </p>
            ) : null}
            {heading ? <h2 className={sectionStyles.heading}>{renderHeadingWithShimmer(heading)}</h2> : null}
            {description ? <p className={sectionStyles.description}>{description}</p> : null}
          </div>
        ) : null}
        <div className={styles.routePinInner}>
          <nav aria-label="Timeline" className={styles.routePinRail}>
            <div className={styles.routePinRailLine} aria-hidden="true" />
            <ol className={styles.routePinRailList}>
              {entries.map((entry, index) => (
                <li key={entry.id} className={styles.routePinRailItem} data-active={index === activeIndex ? "true" : undefined}>
                  <button type="button" className={styles.routePinRailButton} onClick={() => jumpTo(index)}>
                    {entry.place}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div ref={stageRef} className={styles.routePinStage}>
            {entries.map((entry, index) => {
              const li = index === 0 ? 1 : Math.min(1, Math.max(0, progress - (index - 1)));
              // Cards all share one grid cell now (.routePinStage is a
              // single-cell grid stack, see that rule's own comment) and
              // are all stretched to the SAME height — the tallest
              // entry's own — so a card's own height and the stage's own
              // height are identical again, restoring the invariant a
              // %-of-own-height clearance relies on. Kept as a px
              // calculation against the stage's real measured height
              // (stageRef) rather than reverting to `%` units purely to
              // avoid re-touching this twice in one pass; the numbers
              // are equivalent either way now. No more -50% term — the
              // grid centres/sizes the resting position natively, there's
              // no manual centring offset left to supply.
              const stageHeightPx = stageRef.current?.offsetHeight ?? 0;
              const clearancePx = (1 - li) * stageHeightPx * 1.1;
              const tilt = index % 2 === 0 ? -0.6 : 0.6;
              return (
                <div
                  key={entry.id}
                  className={`${styles.routePinCard} ${styles.card} ${GRADIENTS[index % GRADIENTS.length] ?? ""}`}
                  style={{ transform: `translateY(${clearancePx}px) rotate(${tilt}deg)`, zIndex: index + 1 }}
                >
                  <TimelineRouteCardContent entry={entry} hideImage />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
