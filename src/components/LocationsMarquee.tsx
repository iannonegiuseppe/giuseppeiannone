"use client";

import NextImage from "next/image";
import { useEffect, useRef } from "react";
import { useSediMapContext } from "./SediMapContext";
import styles from "./locationsMarquee.module.scss";

export type LocationsMarqueeItem = {
  id: string;
  name: string;
  photoUrl: string;
  alt: string;
};

// Locations marquee (structure pass, slot 13) — continuous auto-scroll:
// the item list is rendered TWICE, back-to-back, and the track animates
// translateX(0) -> translateX(-50%); since the second half is an
// identical copy of the first, that lands exactly back on the start —
// a seamless loop with no jump. The second copy is aria-hidden and not
// tabbable (decorative only, exists purely to make the loop seamless),
// and is hidden entirely under prefers-reduced-motion (see the SCSS),
// where the block instead renders as one plain, natively-scrollable row.
//
// Light-surface + heading-zone pass: was a bare photo row; now carries
// its own kicker/h2/intro (homePage.spaziLab — /design-lab only, see
// homePage.ts's own comment), reusing the exact heading-zone recipe
// Diplomi/Video already established (kicker rule geometry, h2 weight
// 400 + font-synthesis:none, italic accent word). introLine gates on
// allPhotosReal (see DesignLabHomepage.tsx's own comment on how that's
// computed) — it asserts the photos are real/own, so it must not render
// while any slot is still the temporary interior-stock fallback.
//
// Each real item is now a real <button> (whole-card click, same pattern
// as Diplomi's cards) that also selects the matching map location via
// SediMapContext — clicking a room photo does what clicking its address
// already does (flyTo + open the popup), per this pass's own proposal
// part (d): the strip photo and the popup photo are the same underlying
// source, so this removes the redundancy instead of just tolerating it.
//
// Drag/scroll rebuild pass — the CSS @keyframes animation this used to
// run (translateX(0) -> translateX(-50%)) is gone entirely, replaced by a
// requestAnimationFrame loop driving .wrap's own native scrollLeft. This
// wasn't a style preference: it's what makes dragging, native trackpad/
// touch scrolling, keyboard scrolling, and the auto-scroll all agree on
// ONE shared position (scrollLeft itself) instead of three separate
// mechanisms that would otherwise fight or snap. See this pass's own
// report for the diagnosis this replaces (the prefers-reduced-motion
// fallback used to be a dead end: width: auto on a flex row lets it
// shrink to fit its own container exactly, leaving nothing for
// overflow-x: auto to scroll).
//
// prefers-reduced-motion: reduce turns the rAF auto-increment off (read
// live via a MediaQueryList, not just at mount, so a mid-session OS
// toggle takes effect immediately) but changes nothing else — dragging,
// wheel/trackpad, and keyboard all keep working, because they're the same
// scrollLeft-based code path regardless of motion preference. That's the
// literal fix for "the accessible fallback must not be a dead carousel."
const AUTO_SCROLL_LOOP_SECONDS = 36; // unchanged from the old animation's own full-loop duration
const RESUME_DELAY_MS = 1000; // "about a second" after the user lets go
const DRAG_THRESHOLD_PX = 8; // below this, a pointerdown+up reads as a tap, not a drag
const KEYBOARD_STEP_PX = 240; // roughly one card's width per arrow press

export function LocationsMarquee({
  kicker,
  heading,
  headingEmphasisWord,
  introLine,
  allPhotosReal,
  items,
}: {
  kicker: string;
  heading: string;
  headingEmphasisWord?: string;
  introLine?: string;
  allPhotosReal: boolean;
  items: LocationsMarqueeItem[];
}) {
  if (items.length === 0) return null;

  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    const onReducedMotionChange = () => {
      reducedMotion = reducedMotionQuery.matches;
    };
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    // Half-width — the exact distance one full, seamless loop covers.
    // wrap.scrollWidth is BOTH halves combined (they're identical), so
    // dividing by two avoids having to separately sum item widths + gaps
    // + the half-to-half gap by hand. Re-measured on resize (ResizeObserver,
    // not a resize listener on window — this box's own size can change from
    // things other than a viewport resize, e.g. a font finishing its swap).
    let halfWidth = 0;
    function measure() {
      halfWidth = wrap!.scrollWidth / 2;
    }
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(wrap);

    // Keeps scrollLeft inside [0, halfWidth) so the loop never runs out of
    // track to scroll through in either direction — called after every
    // programmatic OR user-driven change, so dragging/wheel/keyboard past
    // either edge also wraps seamlessly, not just the auto-scroll.
    function wrapPosition() {
      if (halfWidth <= 0) return;
      if (wrap!.scrollLeft >= halfWidth) wrap!.scrollLeft -= halfWidth;
      else if (wrap!.scrollLeft < 0) wrap!.scrollLeft += halfWidth;
    }

    // --- Auto-scroll (rAF, drives scrollLeft directly — no CSS animation) --
    let paused = false; // hover/focus-within, matches the old CSS convenience pause
    let dragging = false;
    let cooldownUntil = 0; // performance.now() timestamp; auto-scroll stays off until past this
    let lastFrameTime: number | null = null;
    let rafId: number;
    // The scrollLeft value this effect itself last wrote — onScroll (below)
    // compares against this, not a synchronous "I'm writing right now"
    // boolean. A boolean was tried first and doesn't work: the native
    // "scroll" event fires ASYNCHRONOUSLY (a later task, not during the
    // property write itself), so a flag set true then immediately back to
    // false around the write has already reverted by the time the event
    // actually arrives — confirmed live: with that approach, EVERY
    // auto-scroll frame's own tiny write was misread as user input, each
    // one restarting the RESUME_DELAY_MS cooldown, so the strip advanced
    // roughly one frame per second instead of scrolling smoothly. A value
    // comparison has no such race: if scrollLeft still equals what this
    // effect itself last set, nothing else has touched it since, no matter
    // how long the "scroll" event took to arrive.
    let lastKnownScrollLeft = wrap.scrollLeft;

    function tick(time: number) {
      rafId = requestAnimationFrame(tick);
      if (reducedMotion || paused || dragging || time < cooldownUntil || halfWidth <= 0) {
        lastFrameTime = null;
        return;
      }
      if (lastFrameTime === null) {
        lastFrameTime = time;
        return;
      }
      const deltaSeconds = (time - lastFrameTime) / 1000;
      lastFrameTime = time;
      wrap!.scrollLeft += (halfWidth / AUTO_SCROLL_LOOP_SECONDS) * deltaSeconds;
      wrapPosition();
      lastKnownScrollLeft = wrap!.scrollLeft;
    }
    rafId = requestAnimationFrame(tick);

    function onPointerEnter() {
      paused = true;
    }
    function onPointerLeaveOrBlur() {
      if (!dragging) paused = false;
    }
    wrap.addEventListener("pointerenter", onPointerEnter);
    wrap.addEventListener("pointerleave", onPointerLeaveOrBlur);
    wrap.addEventListener("focusin", onPointerEnter);
    wrap.addEventListener("focusout", onPointerLeaveOrBlur);

    // Any USER-driven scroll (wheel/trackpad, native touch pan — anything
    // that isn't this effect's own scrollLeft writes) pauses auto-scroll
    // for the same RESUME_DELAY_MS as a drag release, so the marquee never
    // fights a trackpad swipe mid-gesture. dragging is checked directly
    // too (belt-and-braces: a drag's OWN writes already update
    // lastKnownScrollLeft in lockstep, so the value comparison alone
    // would already ignore them, but the explicit check makes that
    // intent obvious rather than incidental).
    function onScroll() {
      if (dragging) return;
      if (Math.abs(wrap!.scrollLeft - lastKnownScrollLeft) < 0.5) return;
      cooldownUntil = performance.now() + RESUME_DELAY_MS;
    }
    wrap.addEventListener("scroll", onScroll, { passive: true });

    // --- Drag (pointer events — one code path for mouse, touch, pen) ------
    let startClientX = 0;
    let startScrollLeft = 0;
    let draggedPastThreshold = false;
    let suppressNextClick = false;

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType === "mouse" && event.button !== 0) return; // left button only
      dragging = true;
      draggedPastThreshold = false;
      startClientX = event.clientX;
      startScrollLeft = wrap!.scrollLeft;
      cooldownUntil = 0; // a fresh drag supersedes any pending resume delay
      // setPointerCapture is deliberately NOT called here. Capturing a
      // pointer on wrap retargets the click event a plain tap on a nested
      // card <button> would otherwise produce — confirmed live with an
      // isolated repro: an ancestor calling setPointerCapture in its own
      // pointerdown handler causes the descendant button's click listener
      // to never fire at all, even for a tap with zero movement, because
      // the click's target is retargeted to the capturing ancestor. Capture
      // is instead acquired lazily in onPointerMove, only once the drag
      // threshold is actually exceeded — by then this gesture is
      // confirmed to be a drag, not a tap, so retargeting no longer
      // matters (the eventual click is already suppressed below).
    }

    function onPointerMove(event: PointerEvent) {
      if (!dragging) return;
      const delta = event.clientX - startClientX;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX && !draggedPastThreshold) {
        draggedPastThreshold = true;
        wrap!.setPointerCapture(event.pointerId);
        // Stops the native drag-a-ghost-image behaviour a click-drag on an
        // <img> would otherwise trigger, and stray text selection while
        // dragging — harmless for touch (touch has no such default to
        // block), and safe to call once movement already confirms a drag
        // rather than on every pointerdown (which would also swallow taps).
        event.preventDefault();
      }
      wrap!.scrollLeft = startScrollLeft - delta;
      wrapPosition();
      lastKnownScrollLeft = wrap!.scrollLeft;
    }

    function endDrag(event: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      if (wrap!.hasPointerCapture(event.pointerId)) wrap!.releasePointerCapture(event.pointerId);
      if (draggedPastThreshold) {
        // The click this pointerup is about to produce (if the pointer
        // ends on top of a card button) must NOT activate that card — a
        // drag is not a tap. Cleared by the capture-phase click handler
        // below the very first time it sees it, so a genuine LATER tap is
        // never accidentally swallowed too.
        suppressNextClick = true;
      }
      paused = false;
      cooldownUntil = performance.now() + RESUME_DELAY_MS;
    }

    // Capture phase: runs BEFORE the card button's own onClick (bubble
    // phase), so stopping it here reliably prevents selectLocation from
    // firing after a drag, without needing preventDefault on the much
    // earlier pointerdown (which would also block genuine taps).
    function onClickCapture(event: MouseEvent) {
      if (!suppressNextClick) return;
      suppressNextClick = false;
      event.preventDefault();
      event.stopPropagation();
    }

    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);
    wrap.addEventListener("click", onClickCapture, { capture: true });

    // --- Keyboard — arrow keys scroll the strip when it (or a card inside
    // it) has focus. tabIndex on .wrap (JSX below) is what makes it a
    // stop in the first place; a native overflow:auto box would otherwise
    // only be reachable by tabbing into one of the card buttons inside it.
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      wrap!.scrollLeft += event.key === "ArrowRight" ? KEYBOARD_STEP_PX : -KEYBOARD_STEP_PX;
      wrapPosition();
      lastKnownScrollLeft = wrap!.scrollLeft;
      cooldownUntil = performance.now() + RESUME_DELAY_MS;
    }
    wrap.addEventListener("keydown", onKeyDown);

    return () => {
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
      wrap.removeEventListener("pointerenter", onPointerEnter);
      wrap.removeEventListener("pointerleave", onPointerLeaveOrBlur);
      wrap.removeEventListener("focusin", onPointerEnter);
      wrap.removeEventListener("focusout", onPointerLeaveOrBlur);
      wrap.removeEventListener("scroll", onScroll);
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerup", endDrag);
      wrap.removeEventListener("pointercancel", endDrag);
      wrap.removeEventListener("click", onClickCapture, { capture: true });
      wrap.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const emphasisIndex = headingEmphasisWord ? heading.indexOf(headingEmphasisWord) : -1;
  const headingNode =
    headingEmphasisWord && emphasisIndex !== -1 ? (
      <>
        {heading.slice(0, emphasisIndex)}
        <em className={styles.headingAccent}>{headingEmphasisWord}</em>
        {heading.slice(emphasisIndex + headingEmphasisWord.length)}
      </>
    ) : (
      heading
    );

  return (
    <>
      <div className={styles.headingZone}>
        <p className={styles.headingKicker}>
          <span className={styles.headingKickerRule} aria-hidden="true" />
          {kicker}
        </p>
        <h2
          id="spazi-block-heading"
          className={styles.headingH2}
          style={{ fontWeight: 400, fontSynthesis: "none" }}
        >
          {headingNode}
        </h2>
        {allPhotosReal && introLine ? <p className={styles.headingIntro}>{introLine}</p> : null}
      </div>
      <div ref={wrapRef} className={styles.wrap} tabIndex={0} role="group" aria-label={heading}>
        <div className={styles.track}>
          <div className={styles.trackHalf}>
            <Row items={items} />
          </div>
          <div className={`${styles.trackHalf} ${styles.trackHalfDuplicate}`} aria-hidden="true">
            <Row items={items} decorative />
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ items, decorative }: { items: LocationsMarqueeItem[]; decorative?: boolean }) {
  const { selectLocation } = useSediMapContext();

  return (
    <>
      {items.map((item) =>
        decorative ? (
          <figure key={`dup-${item.id}`} className={styles.item} aria-hidden="true">
            <div className={styles.photoFrame}>
              <NextImage
                src={item.photoUrl}
                alt=""
                fill
                draggable={false}
                sizes="(min-width: 64rem) 28vw, (min-width: 48rem) 38vw, 78vw"
                className={styles.photoImg}
              />
            </div>
            <figcaption className={styles.caption}>{item.name}</figcaption>
          </figure>
        ) : (
          <figure key={item.id} className={styles.item}>
            <button
              type="button"
              className={styles.itemButton}
              aria-label={item.name}
              onClick={() => selectLocation(item.id)}
            >
              <div className={styles.photoFrame}>
                <NextImage
                  src={item.photoUrl}
                  alt={item.alt}
                  fill
                  draggable={false}
                  sizes="(min-width: 64rem) 28vw, (min-width: 48rem) 38vw, 78vw"
                  className={styles.photoImg}
                />
              </div>
              <span className={styles.caption}>{item.name}</span>
            </button>
          </figure>
        ),
      )}
    </>
  );
}
