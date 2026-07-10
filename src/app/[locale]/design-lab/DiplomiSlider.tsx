"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Diploma } from "./diplomiData";
import { DiplomiViewer, type DiplomiViewerHandle } from "./DiplomiViewerModal";
import styles from "./design-lab.module.scss";

// Revision round 2, item 3a: a drag shorter than this still opens the
// viewer on release (a click, not a scroll gesture) — longer than this
// suppresses the click, per spec's explicit "must NOT open the lightbox".
const DRAG_THRESHOLD_PX = 8;

export function DiplomiSlider({
  kicker,
  heading,
  diplomas,
}: {
  kicker: string;
  heading: string;
  diplomas: Diploma[];
}) {
  const viewerRef = useRef<DiplomiViewerHandle>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  // Ref, not state — read inside the click handler that fires right after
  // pointerup for the SAME interaction; a state update wouldn't be visible
  // there until the next render, one tick too late.
  const dragRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; dragged: boolean } | null>(null);

  // Arrow enabled/disabled state, driven by the track's own scroll
  // position — same measure-on-scroll pattern as this file's other
  // scroll-driven components, gated to a passive listener.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function update() {
      const { scrollLeft, scrollWidth, clientWidth } = track!;
      setCanScrollPrev(scrollLeft > 2);
      setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 2);
    }
    update();

    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function scrollByOneCard(direction: 1 | -1) {
    const track = trackRef.current;
    const firstItem = track?.querySelector("li");
    if (!track || !firstItem) return;
    const itemWidth = firstItem.getBoundingClientRect().width;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || "0");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direction * (itemWidth + gap),
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }

  // Pointer drag-to-scroll — fine pointers only (mouse); touch pointers
  // fall straight through untouched, so the native swipe stays exactly as
  // it was, per spec. Pointer capture means the drag keeps tracking even
  // if the cursor leaves the track mid-gesture.
  function handlePointerDown(event: React.PointerEvent<HTMLUListElement>) {
    if (event.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    // Deliberately NOT capturing the pointer yet — only record the start
    // position. Capturing immediately on every pointerdown (including a
    // plain click) interfered with the click event reaching the card
    // button underneath (measured: a plain click stopped opening the
    // lightbox entirely once capture happened unconditionally). Capture
    // is acquired lazily in handlePointerMove, only once the gesture has
    // actually crossed the drag threshold — a plain click never reaches
    // that branch, so it never touches pointer capture at all.
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      dragged: false,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLUListElement>) {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (!drag.dragged && Math.abs(delta) > DRAG_THRESHOLD_PX) {
      drag.dragged = true;
      track.setPointerCapture(event.pointerId);
      // scroll-snap-type: mandatory fights programmatic scrollLeft writes
      // mid-drag — measured: assignments were silently reverted back to
      // the current snap point every frame, so the track never actually
      // moved. Suspended only while a real drag is in progress; restored
      // on release below so the track still settles onto the nearest
      // card afterward, preserving scroll-snap overall per spec.
      track.style.scrollSnapType = "none";
    }
    if (drag.dragged) track.scrollLeft = drag.startScrollLeft - delta;
  }

  function handlePointerUp(event: React.PointerEvent<HTMLUListElement>) {
    const track = trackRef.current;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    if (track) track.style.scrollSnapType = "";
    // dragRef is deliberately NOT cleared here — the click event for this
    // same interaction fires right after pointerup, and the card's own
    // onClick below needs to read `dragged` before it's reset.
  }

  function handleCardClick(index: number, event: React.MouseEvent) {
    if (dragRef.current?.dragged) {
      // A real drag (>8px) — swallow the click it would otherwise
      // produce, per spec's explicit click-vs-drag disambiguation.
      event.preventDefault();
      dragRef.current = null;
      return;
    }
    dragRef.current = null;
    viewerRef.current?.open(index);
  }

  return (
    <>
      <div className={styles.diplomiHeader}>
        <div>
          <p className={styles.diplomiKicker}>
            <span className={styles.diplomiKickerRule} aria-hidden="true" />
            {kicker}
          </p>
          <h2 className={styles.diplomiHeading}>{heading}</h2>
        </div>

        {/* Revision round 2, item 3a: prev/next arrows — hidden on touch
            devices via the (hover: hover) and (pointer: fine) gate below
            (native swipe stays untouched there); disabled state at either
            end reflects the track's own scroll position. */}
        <div className={styles.diplomiArrows}>
          <button
            type="button"
            className={styles.diplomiArrowButton}
            aria-label="Diploma precedente"
            disabled={!canScrollPrev}
            onClick={() => scrollByOneCard(-1)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.diplomiArrowButton}
            aria-label="Diploma successivo"
            disabled={!canScrollNext}
            onClick={() => scrollByOneCard(1)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.diplomiSliderWrap}>
        <ul
          ref={trackRef}
          className={styles.diplomiSlider}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {diplomas.map((diploma, i) => (
            <li key={diploma.image} className={styles.diplomiSlideItem}>
              <button
                type="button"
                className={styles.diplomiCard}
                onClick={(event) => handleCardClick(i, event)}
              >
                <div className={styles.diplomiCardImageWrap}>
                  <Image
                    src={diploma.image}
                    alt={`${diploma.title} — ${diploma.institution}`}
                    fill
                    sizes="(min-width: 64rem) 20rem, (min-width: 48rem) 17rem, 75vw"
                    className={styles.diplomiCardImage}
                    draggable={false}
                  />
                </div>
                <div className={styles.diplomiCardCaption}>
                  <p className={styles.diplomiCardTitle}>{diploma.title}</p>
                  {/* Revision round 1, item 5: institution + year merged
                      onto one line (was two separate <p> elements) — the
                      spec's "1-line meta caption area" reserves height for
                      exactly one line, so the caption needs one line of
                      content to fill it, not two. */}
                  <p className={styles.diplomiCardMeta}>
                    {diploma.institution} — {diploma.year}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Revision round 3, item 3: always mounted, imperative open() —
          same infrastructure as ChannelPickerDialog.tsx (native <dialog>,
          no conditional-mount/Suspense dance). No heavy third-party
          library to code-split anymore, so there's nothing left to lazily
          import here. */}
      <DiplomiViewer ref={viewerRef} diplomas={diplomas} />
    </>
  );
}
