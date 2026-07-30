"use client";

import { useEffect, useRef, useState } from "react";
import { QualificationLightboxLab, type QualificationLightboxLabHandle } from "./QualificationLightboxLab";
import styles from "./diplomiSlider.module.scss";

// Privacy-gate pair resolved server-side (DesignLabHomepage.tsx) from
// homePage.diplomi.items[].scan/.scanRedacted — `interactive` is computed
// there, not here, so this component never has to re-derive the gate
// condition itself. scanLqip/lightboxUrl are both undefined whenever
// `interactive` is false, which is what the non-interactive branch below
// relies on instead of re-checking the two source fields directly.
export type DiplomiLabItem = {
  id: string;
  year: string;
  title: string;
  institution: string;
  interactive: boolean;
  scanLqip?: string;
  lightboxUrl?: string;
  width: number;
  height: number;
};

// Diplomi rebuild (framed-certificate slider) — a NEW, dedicated
// component for /design-lab only. DiplomiBlock.tsx (the existing
// density/ component) is ALSO rendered by /design-lab/density
// (DensityPage.tsx imports it directly, with its own separate,
// hardcoded-and-scan-less DIPLOMI array) — redesigning it in place would
// have silently redesigned that other route's Diplomi section too, out of
// this pass's own scope. Left DiplomiBlock.tsx/diplomi.module.scss
// completely untouched; this file is /design-lab's own instance instead,
// same pattern already used for Welcome/Contact/Sedi.
//
// Slider mechanics mirror DiplomiCardRow.tsx (scroll-snap + arrows +
// edge-fade + overflow detection, same rAF/passive-listener technique) —
// deliberately no pointer-drag-to-scroll, matching that file's own
// explicit reasoning (native scroll-snap + arrows + touch swipe already
// cover every input; drag risks swallowing the card's own link clicks).
//
// Lightbox pass: QualificationLightboxLab is a NEW component, not the
// shared QualificationDialog.tsx — that file is imported by the REAL
// production DiplomiSection (src/app/[locale]/page.tsx), so editing it for
// this pass's own requirements (Lenis scroll-lock, prev/next cycling
// restricted to interactive-only items, the redaction caption line, the
// capped-and-lazy image pipeline) would have changed production behaviour
// too. Same "shared component diverges -> new, separately-named one, don't
// mutate" call this whole route makes repeatedly.
export function DiplomiSlider({
  headingId,
  items,
}: {
  headingId: string;
  items: DiplomiLabItem[];
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const lightboxRef = useRef<QualificationLightboxLabHandle>(null);
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
  }, [items.length]);

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

  // Lightbox navigation only ever cycles through items that passed the
  // privacy gate — a card that failed it is never a valid lightbox stop,
  // so it's filtered out of the list the lightbox itself owns, not
  // skipped reactively during prev/next.
  const interactiveItems = items.filter((item) => item.interactive);

  function openLightboxFor(item: DiplomiLabItem) {
    const interactiveIndex = interactiveItems.findIndex((candidate) => candidate.id === item.id);
    if (interactiveIndex === -1) return;
    lightboxRef.current?.open(interactiveIndex);
  }

  return (
    <>
      {/* Heading zone — two columns at md+ (density principle: a single
          narrow column leaving half the container empty is prohibited).
          Kicker/heading/intro/Albo-line copy is DRAFT, hardcoded here, not
          read from homePage.diplomi.kicker/.heading/.alboLine — see
          DesignLabHomepage.tsx's own comment on the DiplomiSlider call
          site for why those three fields specifically couldn't be reused
          (they're shared with the real production DiplomiSection). TODO:
          if this copy is approved, the clean fix is a NEW, design-lab-only
          field group (mirroring homePage.profilo vs. chiSonoSection),
          not overwriting the shared diplomi fields. */}
      <div className={styles.headingZone}>
        <div className={styles.headingLeft}>
          <p className={styles.headingKicker}>
            <span className={styles.headingKickerRule} aria-hidden="true" />
            PERCORSO FORMATIVO
          </p>
          {/* font-synthesis: none — deliberate. If the genuine EB Garamond
              italic face isn't loaded/subset, "formazione" should render
              upright (a visible, reportable font-loading bug) rather than
              a browser-faked skew standing in for it unnoticed. */}
          <h2 id={headingId} className={styles.headingH2} style={{ fontSynthesis: "none" }}>
            Quattordici anni di <em className={styles.headingAccent}>formazione</em>.
          </h2>
        </div>
        <div className={styles.headingRight}>
          {/* DRAFT — pending client approval, per this pass's own brief. */}
          <p className={styles.headingIntro}>
            I titoli che seguono sono quelli su cui si basa il mio lavoro: la laurea, il master di
            ricerca, la specializzazione in psicoterapia. Sono documenti pubblici e consultabili.
          </p>
          {/* Moved here from beneath the card row, per this pass's own
              brief — no date/place of birth added anywhere, this is the
              exact verbatim line given. */}
          <p className={styles.headingAlboLine}>
            Iscritto all&apos;Albo degli Psicologi della Lombardia, sezione A, n. 18949 — dal 15
            settembre 2016.
          </p>
        </div>
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
          {items.map((item) =>
            item.interactive ? (
              // Whole-card real <button> — not a div with onClick, not a
              // button nested inside a div. aria-label names institution
              // + year so a screen reader announces what will open before
              // it does.
              <li key={item.id} className={styles.cardItem} role="listitem">
                <button
                  type="button"
                  className={styles.card}
                  data-interactive="true"
                  aria-label={`${item.institution}, ${item.year} — vedi il titolo`}
                  onClick={() => openLightboxFor(item)}
                >
                  <p className={styles.yearWatermark} aria-hidden="true">
                    {item.year}
                  </p>
                  {/* Hover crop: reads scanLqip only — a tiny inline base64
                      data URI already present in the page's own JSON
                      payload, not a network image request (see
                      DesignLabHomepage.tsx's own comment). Opacity is 0 at
                      rest, raised only on :hover/:focus-visible in the
                      stylesheet. */}
                  <span
                    className={styles.hoverCrop}
                    aria-hidden="true"
                    style={item.scanLqip ? { backgroundImage: `url(${item.scanLqip})` } : undefined}
                  />
                  <span className={styles.frame}>
                    <DocumentIcon />
                    {/* span, not p: this whole cluster sits inside a
                        <button>, whose HTML content model is phrasing
                        content only. */}
                    <span className={styles.cardYear}>{item.year}</span>
                    <span className={styles.cardInstitution}>{item.institution}</span>
                    <span className={styles.cardTitle}>{item.title}</span>
                    {/* Persistent, not hover-only — this is what tells a
                        touch user the card is tappable at all. */}
                    <span className={styles.cardAffordance}>Vedi il titolo →</span>
                  </span>
                </button>
              </li>
            ) : (
              // Non-interactive: no scan, or scanRedacted still false. No
              // affordance line, no hover response, no cursor:pointer, not
              // focusable — a plain <div>, matching the shared component's
              // own long-standing behaviour when nothing to view exists.
              <li key={item.id} className={styles.cardItem} role="listitem">
                <div className={styles.card}>
                  <p className={styles.yearWatermark} aria-hidden="true">
                    {item.year}
                  </p>
                  <div className={styles.frame}>
                    <DocumentIcon />
                    <p className={styles.cardYear}>{item.year}</p>
                    <p className={styles.cardInstitution}>{item.institution}</p>
                    <p className={styles.cardTitle}>{item.title}</p>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>
      </div>

      <QualificationLightboxLab ref={lightboxRef} items={interactiveItems} closeLabel="Chiudi" />
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
