"use client";

import { useEffect, useRef, useState } from "react";
import type { ResolvedQualification } from "@/components/DiplomiCardRow";
import { QualificationDialog, type QualificationDialogHandle } from "@/components/QualificationDialog";
import styles from "./diplomiSlider.module.scss";

// Diplomi rebuild (framed-certificate slider) — a NEW, dedicated
// component for /design-lab only. DiplomiBlock.tsx (the existing
// density/ component) is ALSO rendered by /design-lab/density
// (DensityPage.tsx imports it directly, with its own separate,
// hardcoded-and-scan-less DIPLOMI array) — redesigning it in place would
// have silently redesigned that other route's Diplomi section too,
// which this task's own "do not touch other blocks" scope doesn't cover
// (that route was never mentioned or reviewed in this pass). Left
// DiplomiBlock.tsx/diplomi.module.scss completely untouched; this file
// is /design-lab's own instance instead, same pattern already used for
// Welcome/Contact/Sedi (each got its own dedicated component rather than
// a shared one edited to serve two different pages).
//
// Slider mechanics mirror DiplomiCardRow.tsx (scroll-snap + arrows +
// edge-fade + overflow detection, same rAF/passive-listener technique) —
// deliberately no pointer-drag-to-scroll, matching that file's own
// explicit reasoning (native scroll-snap + arrows + touch swipe already
// cover every input; drag risks swallowing the card's own link clicks).
//
// Lightbox: QualificationDialog is imported directly, not copied — its
// own styles (DiplomiSection.module.scss's qualificationDialog* rules)
// are self-contained (checked: no coupling to that file's card-row
// classes), so it renders correctly wherever it's mounted.
export function DiplomiSlider({
  headingId,
  alboLine,
  qualifications,
}: {
  headingId: string;
  alboLine?: string;
  qualifications: ResolvedQualification[];
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<QualificationDialogHandle>(null);
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
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Le qualifiche</p>
          <h2 id={headingId} className={styles.heading}>
            Formazione e <em className={styles.headingEmphasis}>qualifiche</em>
          </h2>
        </div>

        {hasOverflow ? (
          <div className={styles.arrows}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Qualifica precedente"
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
              aria-label="Qualifica successiva"
              disabled={!canScrollNext}
              onClick={() => scrollByOneCard(1)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      <div
        className={styles.trackWrap}
        data-fade-start={hasOverflow && canScrollPrev ? "true" : undefined}
        data-fade-end={hasOverflow && canScrollNext ? "true" : undefined}
      >
        {/* All cards render unconditionally — SSG/crawler requirement,
            the slider is a purely visual/interactive layer on top. */}
        <ul
          ref={trackRef}
          className={styles.track}
          data-overflow={hasOverflow ? "true" : "false"}
          role="list"
          tabIndex={0}
          aria-label="Formazione e qualifiche"
        >
          {qualifications.map((q, index) => (
            <li key={q.id} className={styles.cardItem} role="listitem">
              <div className={styles.card}>
                <p className={styles.yearWatermark} aria-hidden="true">
                  {q.year}
                </p>
                {q.thumbnailUrl ? (
                  <button
                    type="button"
                    className={styles.cardButton}
                    onClick={() => dialogRef.current?.open(index)}
                    aria-label={`${q.institution}, ${q.year} — vedi il certificato`}
                  >
                    <span className={styles.frame}>
                      <DocumentIcon />
                      {/* span, not p: this whole cluster sits inside a
                          <button>, whose HTML content model is phrasing
                          content only — <p> (block/sectioning) isn't
                          valid there. display:block in the SCSS makes
                          these render identically to the non-button
                          branch below. */}
                      <span className={styles.cardYear}>{q.year}</span>
                      <span className={styles.cardInstitution}>{q.institution}</span>
                      <span className={styles.cardTitle}>{q.title}</span>
                      <span className={styles.divider} aria-hidden="true" />
                      <span className={styles.cardLink}>Vedi il certificato →</span>
                    </span>
                  </button>
                ) : (
                  // No scan yet: a clean factual card, ending at the
                  // title — no divider, no "In arrivo" placeholder line.
                  // (Was a dimmed pending state; with every real
                  // qualification currently scan-less, that read as a
                  // wall of "In arrivo" instead of a set of facts.)
                  <div className={styles.frame}>
                    <DocumentIcon />
                    <span className={styles.cardYear}>{q.year}</span>
                    <span className={styles.cardInstitution}>{q.institution}</span>
                    <span className={styles.cardTitle}>{q.title}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {alboLine ? <p className={styles.alboLine}>{alboLine}</p> : null}

      <QualificationDialog ref={dialogRef} qualifications={qualifications} closeLabel="Chiudi" />
    </>
  );
}

// Neutral "document with seal" — a page with two text lines and a small
// circular seal mark. Deliberately NOT a medal/ribbon/rosette/star/
// trophy: no ribbon tails, no star points, no radiating petals — a plain
// rectangle and a plain circle only (§9).
function DocumentIcon() {
  return (
    <svg viewBox="0 0 34 34" className={styles.docIcon} aria-hidden="true">
      <rect x={8} y={4} width={14} height={20} rx={1} stroke="var(--color-accent)" strokeWidth={1.25} fill="none" />
      <line x1={11} y1={10} x2={19} y2={10} stroke="var(--color-accent)" strokeWidth={1.25} />
      <line x1={11} y1={15} x2={17} y2={15} stroke="var(--color-accent)" strokeWidth={1.25} />
      <circle cx={21} cy={21} r={5} stroke="var(--color-accent)" strokeWidth={1.25} fill="none" />
    </svg>
  );
}
