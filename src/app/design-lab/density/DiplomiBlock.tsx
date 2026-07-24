"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./diplomi.module.scss";

type DiplomiItem = { year: string; title: string; institution: string };

// Standalone reproduction of the real DiplomiCardRow (src/components/
// DiplomiCardRow.tsx) — same scroll-snap track + rAF/passive-listener/
// cached-bounds overflow measurement, same edge-fade technique. Two
// differences, both deliberate: (1) no lightbox — none of these 3 real
// items has a scanned document image yet (same as the live homepage
// right now), so every card renders the same typographic-placeholder
// variant DiplomiCardRow already uses for that case, and there is
// nothing for a lightbox to show; (2) the two arrow buttons share ONE
// .iconButton class instead of the real component's separate
// .diplomiArrowButton — this pass's own instruction to consolidate the
// Diplomi/lightbox circular-chip styles into one shared treatment. A
// lightbox close button, if a scan is added later, should reuse this
// same class rather than reintroducing a second one.
export function DiplomiBlock({
  kicker,
  heading,
  items,
  headingId,
  alboLine,
}: {
  kicker: string;
  heading: string;
  items: DiplomiItem[];
  headingId: string;
  alboLine?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    function measure() {
      ticking = false;
      const el = track;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setHasOverflow(scrollWidth - clientWidth > 1);
      setCanScrollPrev(scrollLeft > 2);
      setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 2);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    }

    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(track);

    return () => {
      track.removeEventListener("scroll", onScroll);
      observer.disconnect();
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

  return (
    <>
      <div className={styles.diplomiHeader}>
        <div>
          <p className={styles.diplomiKicker}>{kicker}</p>
          <h2 id={headingId} className={styles.diplomiHeading}>
            {heading}
          </h2>
        </div>

        <div className={styles.diplomiArrows}>
          <button
            type="button"
            className={styles.iconButton}
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
            className={styles.iconButton}
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

      <div
        className={styles.diplomiTrackWrap}
        data-fade-start={hasOverflow && canScrollPrev ? "true" : undefined}
        data-fade-end={hasOverflow && canScrollNext ? "true" : undefined}
      >
        <ul ref={trackRef} className={styles.diplomiTrack} role="list" tabIndex={0} aria-label={heading}>
          {items.map((item) => (
            <li key={item.title} className={styles.diplomiCardItem} role="listitem">
              <div className={styles.diplomiCard}>
                <div className={styles.diplomiCardFrame}>
                  <p className={styles.diplomiCardPlaceholderText}>{item.institution}</p>
                </div>
                <div className={styles.diplomiCardCaption}>
                  <p className={styles.diplomiCardYear}>{item.year}</p>
                  <p className={styles.diplomiCardTitle}>{item.title}</p>
                  <p className={styles.diplomiCardInstitution}>{item.institution}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {alboLine ? <p className={styles.diplomiAlboLine}>{alboLine}</p> : null}
    </>
  );
}
