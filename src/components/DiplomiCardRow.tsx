"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { QualificationDialog, type QualificationDialogHandle } from "./QualificationDialog";
import styles from "./DiplomiSection.module.scss";

// CMS-wiring: image/lqip are resolved URLs (DiplomiSection.tsx does the
// urlFor() calls server-side), width/height are the document's real
// intrinsic pixel dimensions (imageDimensions(), parsed from the asset
// ref) — needed by QualificationDialog's non-fill <Image> so a portrait
// or landscape scan both size correctly at max 90vw/90vh without
// distortion. thumbnailUrl/lightboxUrl/lightboxLqip are all absent
// together when a qualification has no `document` yet — that's what
// gates the typographic-placeholder card below.
export type ResolvedQualification = {
  id: string;
  year: string;
  title: string;
  institution: string;
  thumbnailUrl?: string;
  lightboxUrl?: string;
  lightboxLqip?: string;
  width: number;
  height: number;
};

// Diplomi rebuild — scroll-snap card row + arrow controls + edge fades,
// replacing the deleted DiplomiSlider.tsx. Deliberately simpler than
// that file in one respect (no pointer-drag-to-scroll — native
// scroll-snap + the arrow buttons + native touch swipe already cover
// every input this pass's own spec calls for) but adds what it didn't
// have: overflow detection (drives the edge fades — see hasOverflow
// below) and edge fades. Corrective pass: arrows themselves are now
// always rendered, since the card-sizing formula guarantees overflow
// with 4+ items — hasOverflow no longer gates whether they exist in the
// DOM, only whether the fades do.
export function DiplomiCardRow({
  kicker,
  heading,
  alboLine,
  qualifications,
  prevLabel,
  nextLabel,
  closeLabel,
  viewDocumentSuffix,
}: {
  kicker: string;
  heading: string;
  alboLine?: string;
  qualifications: ResolvedQualification[];
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
  viewDocumentSuffix: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<QualificationDialogHandle>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Same rAF + passive-listener + cached-bounds pattern this codebase
  // already uses for scroll-driven state (see the deleted DiplomiSlider's
  // own version) — reads scrollWidth/clientWidth fresh each tick rather
  // than caching them once, since a ResizeObserver on the same track
  // means those numbers can change without a scroll event ever firing.
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
  }, [qualifications.length]);

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
          <p className={styles.diplomiKicker}>
            <span className={styles.diplomiKickerRule} aria-hidden="true" />
            {kicker}
          </p>
          <h2 className={styles.diplomiHeading}>{heading}</h2>
        </div>

        {/* Corrective pass: always rendered (not gated on hasOverflow) —
            the card-sizing formula guarantees overflow with 4+ items, so
            both enabled/disabled states are always reachable. Still
            hidden on touch via this class's own media query (see the
            stylesheet). */}
        <div className={styles.diplomiArrows}>
          <button
            type="button"
            className={styles.diplomiArrowButton}
            aria-label={prevLabel}
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
            aria-label={nextLabel}
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
          {qualifications.map((qualification, i) => (
            <li key={qualification.id} className={styles.diplomiCardItem} role="listitem">
              {qualification.thumbnailUrl ? (
                <button
                  type="button"
                  className={styles.diplomiCard}
                  aria-label={`${qualification.title}, ${qualification.year} — ${viewDocumentSuffix}`}
                  onClick={() => dialogRef.current?.open(i)}
                >
                  <div className={styles.diplomiCardFrame}>
                    <Image
                      src={qualification.thumbnailUrl}
                      alt=""
                      fill
                      sizes="(min-width: 48rem) 220px, 70vw"
                      className={styles.diplomiCardImage}
                    />
                  </div>
                  <div className={styles.diplomiCardCaption}>
                    <p className={styles.diplomiCardYear}>{qualification.year}</p>
                    <p className={styles.diplomiCardTitle}>{qualification.title}</p>
                    <p className={styles.diplomiCardInstitution}>{qualification.institution}</p>
                  </div>
                </button>
              ) : (
                <div className={styles.diplomiCard} data-placeholder="true">
                  <div className={styles.diplomiCardFrame}>
                    <p className={styles.diplomiCardPlaceholderText}>{qualification.institution}</p>
                  </div>
                  <div className={styles.diplomiCardCaption}>
                    <p className={styles.diplomiCardYear}>{qualification.year}</p>
                    <p className={styles.diplomiCardTitle}>{qualification.title}</p>
                    <p className={styles.diplomiCardInstitution}>{qualification.institution}</p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {alboLine ? <p className={styles.diplomiAlboLine}>{alboLine}</p> : null}

      <QualificationDialog ref={dialogRef} qualifications={qualifications} closeLabel={closeLabel} />
    </>
  );
}
