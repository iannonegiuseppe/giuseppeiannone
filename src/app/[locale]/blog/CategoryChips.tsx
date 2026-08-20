"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CategoryChips.module.scss";

export interface CategoryChipData {
  id: string;
  title: string;
}

// Blog category-chip pass — Tutti/All plus one chip per pillar that has at
// least one article in this locale (pillars with zero are simply absent
// from `chips`, never rendered as a disabled/empty entry — see
// getAreaChipCounts's own comment). Real <button>s, not a <nav> of links:
// clicking one filters BlogFilterableSection's grid in place, no route or
// URL change, so this isn't navigation semantically.
export function CategoryChips({
  chips,
  allLabel,
  activeId,
  onSelect,
}: {
  chips: CategoryChipData[];
  allLabel: string;
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Mutable per-gesture state — deliberately refs, not state: pointermove
  // fires on every pixel, and re-rendering on each one would fight the
  // scrollLeft writes below. isDragging (above) is the only piece that
  // needs to be state, and it only flips twice per drag (start, end).
  const dragRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; moved: boolean } | null>(
    null,
  );
  const suppressClickRef = useRef(false);
  // A few pixels, not zero — 0 would treat every mousedown+mouseup as a
  // drag attempt and fight normal clicking; this threshold is what lets a
  // real click (no meaningful movement) fall through untouched while a
  // deliberate drag still engages almost immediately.
  const DRAG_THRESHOLD_PX = 5;

  // Fade affordance — same real-scroll-position technique as
  // ContentTable.tsx (see that file's own comment); this row's own
  // .listSection ancestor is tone-mid-surface, which reassigns --color-bg
  // to its own mid tone, so fading to var(--color-bg) here lands on the
  // right colour without needing a light-island wrapper.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const hasOverflow = el.scrollWidth > el.clientWidth + 1;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      setShowFade(hasOverflow && !atEnd);
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Explicit focus-follows-scroll — measured live (this pass's own
  // verification) that Chromium does NOT reliably auto-scroll this row to
  // reveal a newly-focused chip on its own, hidden scrollbar or not: an
  // isolated repro with the identical overflow-x/flex/scrollbar-width:none
  // shape DID auto-scroll, but this component's real DOM didn't, and the
  // gap is worth closing outright rather than chasing why one context's
  // implicit browser behaviour differs from another's. inline:"nearest"
  // scrolls the minimum needed and never touches vertical page scroll
  // (block:"nearest" pins that axis too, belt-and-braces since this is a
  // horizontal-only row).
  function handleFocus(e: React.FocusEvent<HTMLButtonElement>) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    e.target.scrollIntoView({
      inline: "nearest",
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  // A plain (non-trackpad) mouse has no native horizontal scroll gesture —
  // a vertical wheel over an overflow-x row does nothing in most browsers.
  // Translating vertical wheel delta into horizontal scroll is the
  // standard fix (same pattern browsers themselves use on native
  // horizontally-scrolling tab strips). Only takes over when the gesture
  // is more vertical than horizontal, so an actual trackpad's own native
  // horizontal scroll (deltaX-dominant) still passes through untouched.
  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  }

  // Drag-to-scroll — mouse only. Touch and pen fall straight through to
  // this element's own native overflow-x:auto (unchanged from before this
  // pass), which already gives touch momentum, rubber-banding, and its
  // own well-established tap-vs-scroll disambiguation for free — there is
  // no reason to re-implement any of that in JS, and doing so would risk
  // fighting the native behaviour rather than complementing it. Only
  // mouse gets nothing natively (no drag gesture, no wheel-horizontal),
  // which is the actual gap this closes.
  //
  // Pointer capture is set only once the gesture has crossed
  // DRAG_THRESHOLD_PX, not on pointerdown — capturing immediately would
  // make even a plain click "owned" by this element for its whole
  // lifetime, which is unnecessary and (per the Pointer Events spec's own
  // click-retargeting-under-capture behaviour) riskier to reason about
  // than just letting an un-moved press behave as an ordinary click.
  // Once capture IS set, pointerup/pointermove keep targeting this
  // element even if the cursor leaves it or the button is released
  // outside the row — that's what makes "release outside the row still
  // ends the drag" hold without extra listeners on window/document.
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScrollLeft: scrollRef.current?.scrollLeft ?? 0,
      moved: false,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const el = scrollRef.current;
    if (!drag || !el || drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
      drag.moved = true;
      setIsDragging(true);
      el.setPointerCapture(e.pointerId);
    }
    // Only reached once actually dragging — prevents the native
    // text-selection drag from starting mid-gesture (paired with
    // user-select:none on [data-dragging] in the stylesheet as a second,
    // CSS-level line of defence).
    e.preventDefault();
    el.scrollLeft = drag.startScrollLeft - dx;
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.moved) {
      // Consumed by handleClickCapture below — the browser still fires a
      // click after pointerup even when the press turned into a drag;
      // this is what stops that click from reaching a chip's onClick.
      // But a click isn't GUARANTEED to follow every drag that started
      // and ended over non-button space (e.g. between two chips), so
      // this can't rely solely on handleClickCapture to clear it —
      // stuck at true, it would silently swallow the next unrelated
      // click too. The timeout is a fallback clear: a genuine click (if
      // one comes) fires and consumes it well within one macrotask, so
      // this only ever fires as a no-op safety net, never races a real
      // click's own reset.
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
      setIsDragging(false);
    }
    dragRef.current = null;
  }

  // Fires before the chip button's own onClick (React dispatches capture-
  // phase handlers first) — pointerup toward the very end of the gesture
  // and the resulting click are two separate events, so this is the
  // actual point where a completed drag stops a chip from firing filter.
  function handleClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  }

  return (
    <div className={styles.chipsWrap} data-fade={showFade ? "true" : undefined}>
      <div
        className={styles.chipsScroll}
        ref={scrollRef}
        data-dragging={isDragging ? "true" : undefined}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onClickCapture={handleClickCapture}
        role="group"
        aria-label={allLabel}
      >
        <button
          type="button"
          className={styles.chip}
          aria-pressed={activeId === null}
          onClick={() => onSelect(null)}
          onFocus={handleFocus}
        >
          {allLabel}
        </button>
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={styles.chip}
            aria-pressed={activeId === chip.id}
            onClick={() => onSelect(chip.id)}
            onFocus={handleFocus}
          >
            {chip.title}
          </button>
        ))}
      </div>
    </div>
  );
}
