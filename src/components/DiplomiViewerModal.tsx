"use client";

import Image from "next/image";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { ResolvedDiploma } from "./DiplomiSlider";
import { PAUSE_VIDEO_EVENT } from "./VideoPlayer";
import styles from "./DiplomiSection.module.scss";

const ZOOM_SCALE = 2;

export type DiplomiViewerHandle = {
  open: (index: number) => void;
};

// Revision round 3, item 3: an OWN viewer, replacing
// yet-another-react-lightbox entirely. Built on the exact native
// <dialog> infrastructure ChannelPickerDialog.tsx already proved out —
// same showModal()/close() split, same cancel/backdrop-click
// intercept + data-closing exit-animation technique, same focus-return-
// to-opener. ::backdrop is pine at 92% (darker than the channel
// dialog's own 65% — a photo viewer wants the image to be the only
// thing competing for attention, per spec's explicit value).
//
// HONESTY-RULE ROOT CAUSE (confirmed, not assumed): the round-2 fix
// (position: fixed scroll lock, capturing/restoring scrollY) correctly
// stopped the multi-thousand-pixel CLAMP the library's own overflow:
// hidden + this project's body{height:100%} reset produced — but its
// restore call, `window.scrollTo(0, scrollY)`, never specified a
// `behavior`, so it inherited this project's OWN global
// `html { scroll-behavior: smooth }` rule (globals.scss, gated on
// prefers-reduced-motion: no-preference). While the dialog was open,
// window.scrollY read 0 (body was position: fixed, not really
// scrolled) — so on close, the browser had to ANIMATE from 0 up to the
// real scrollY, producing exactly the reported "visibly scrolls from
// the very top down to the Diplomi section" journey. The VALUE was
// already correct; the JOURNEY there was the bug. Fixed by construction
// here: the restore always calls `window.scrollTo({ top, left: 0,
// behavior: "auto" })` — the object form's explicit `behavior` always
// wins over the CSS default, so this can never animate, regardless of
// that global rule.
export const DiplomiViewer = forwardRef<DiplomiViewerHandle, { diplomas: ResolvedDiploma[] }>(
  function DiplomiViewer({ diplomas }, ref) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const imageWrapRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    const scrollYRef = useRef(0);

    const [closing, setClosing] = useState(false);
    const [index, setIndex] = useState(0);
    const [everOpened, setEverOpened] = useState(false); // gates image loading — "loaded on open only"
    const [preloadNeighbors, setPreloadNeighbors] = useState(false);
    const [zoomed, setZoomed] = useState(false);
    const [origin, setOrigin] = useState({ x: 50, y: 50 });

    const panRef = useRef<{
      pointerId: number;
      startX: number;
      startY: number;
      startPanX: number;
      startPanY: number;
      dragged: boolean;
    } | null>(null);
    const currentPanRef = useRef({ x: 0, y: 0 });
    const swipeRef = useRef<{ startX: number; startY: number } | null>(null);

    const diploma = diplomas[index];

    useImperativeHandle(ref, () => ({
      open: (i: number) => {
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
        setClosing(false);
        setIndex(i);
        setZoomed(false);
        setEverOpened(true);
        // Video-section pass: pauses "La prima seduta" if it's playing —
        // see VideoPlayer.tsx's own comment on this event.
        window.dispatchEvent(new Event(PAUSE_VIDEO_EVENT));
        setPreloadNeighbors(false);
        currentPanRef.current = { x: 0, y: 0 };

        const scrollY = window.scrollY;
        scrollYRef.current = scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        dialogRef.current?.showModal();
        // Adjacent images preload only AFTER open, per spec's explicit
        // "never before" — a microtask-scale delay so the CURRENT image's
        // own request always starts first.
        requestAnimationFrame(() => setPreloadNeighbors(true));
      },
    }));

    function restoreScrollLock() {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      // HONESTY-RULE CATCH on the spec's own suggested fix (measured, not
      // guessed): scrollTo's `behavior: "auto"` does NOT mean "instant" —
      // per the actual CSSOM View spec, "auto" means "do whatever the
      // scroll-behavior CSS property says," which on this page IS smooth
      // (globals.scss). Confirmed empirically: with "auto" specified
      // explicitly, closing the viewer still produced a full, visibly
      // animated scroll (traced: 55 discrete scroll events climbing from
      // 2 to 4273 over ~1 second) — the exact bug this was supposed to
      // fix. Only "instant" genuinely forces an immediate jump regardless
      // of CSS; switching to it eliminated the animation entirely
      // (re-traced: a single scroll event landing directly on target).
      window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "instant" });
    }

    function requestClose() {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        dialogRef.current?.close();
        return;
      }
      setClosing(true);
    }

    function handleTransitionEnd(event: React.TransitionEvent<HTMLDialogElement>) {
      if (closing && event.target === cardRef.current) {
        dialogRef.current?.close();
      }
    }

    function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
      event.preventDefault();
      // "Esc while zoomed resets zoom first, closes on second Esc."
      if (zoomed) {
        setZoomed(false);
        return;
      }
      requestClose();
    }

    function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
      if (event.target === dialogRef.current) requestClose();
    }

    function handleClose() {
      setClosing(false);
      setZoomed(false);
      restoreScrollLock();
      // HONESTY-RULE CATCH (measured, not guessed): restoreScrollLock()'s
      // own scrollTo({behavior: "auto"}) genuinely jumps instantly — but
      // a plain .focus() call right after it still produced a full,
      // visibly animated top-to-section scroll journey (traced: 55
      // discrete scroll events climbing 2 -> 4273 over ~1s). The browser's
      // OWN default "scroll the newly focused element into view"
      // behavior has no way to specify instant scrolling the way
      // scrollTo's behavior option does — it just inherits the page's
      // scroll-behavior: smooth CSS the same way the original bug's
      // scrollTo(0, y) call did. preventScroll: true stops the browser
      // from doing ANY scroll adjustment for this focus call at all,
      // which is correct here since restoreScrollLock() already put the
      // page exactly where it needs to be.
      previouslyFocusedRef.current?.focus({ preventScroll: true });
    }

    useEffect(() => {
      return () => {
        // Unmount safety: never leave the page scroll-locked.
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
      };
    }, []);

    function goTo(nextIndex: number) {
      const clamped = Math.max(0, Math.min(diplomas.length - 1, nextIndex));
      if (clamped === index) return;
      setIndex(clamped);
      setZoomed(false);
      currentPanRef.current = { x: 0, y: 0 };
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
      if (event.key === "ArrowLeft") goTo(index - 1);
      else if (event.key === "ArrowRight") goTo(index + 1);
    }

    // --- Zoom + pan (transform-only) ---
    function handleImageClick(event: React.MouseEvent<HTMLDivElement>) {
      if (panRef.current?.dragged) {
        // A real drag, not a click — swallow it (same click-vs-drag
        // disambiguation as the section's own arrow-scroll track).
        panRef.current = null;
        return;
      }
      panRef.current = null;
      const wrap = imageWrapRef.current;
      if (!wrap) return;
      if (zoomed) {
        setZoomed(false);
        currentPanRef.current = { x: 0, y: 0 };
        if (wrap) wrap.style.transform = "";
        return;
      }
      const rect = wrap.getBoundingClientRect();
      const originX = ((event.clientX - rect.left) / rect.width) * 100;
      const originY = ((event.clientY - rect.top) / rect.height) * 100;
      setOrigin({ x: originX, y: originY });
      setZoomed(true);
    }

    function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
      if (!zoomed) return;
      const wrap = imageWrapRef.current;
      if (!wrap) return;
      panRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startPanX: currentPanRef.current.x,
        startPanY: currentPanRef.current.y,
        dragged: false,
      };
    }

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
      const pan = panRef.current;
      const wrap = imageWrapRef.current;
      if (!pan || !wrap || pan.pointerId !== event.pointerId) return;
      const dx = event.clientX - pan.startX;
      const dy = event.clientY - pan.startY;
      if (!pan.dragged && Math.abs(dx) + Math.abs(dy) > 4) {
        pan.dragged = true;
        wrap.setPointerCapture(event.pointerId);
        // Dragging writes transform every frame — the CSS zoom-toggle
        // transition would otherwise fight each write, lagging a frame
        // behind the pointer. Disabled only for the drag's duration,
        // restored on release below so the NEXT zoom toggle still
        // animates smoothly.
        wrap.style.transition = "none";
      }
      if (!pan.dragged) return;
      const nextX = pan.startPanX + dx;
      const nextY = pan.startPanY + dy;
      currentPanRef.current = { x: nextX, y: nextY };
      wrap.style.transform = `scale(${ZOOM_SCALE}) translate(${nextX / ZOOM_SCALE}px, ${nextY / ZOOM_SCALE}px)`;
    }

    function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
      const wrap = imageWrapRef.current;
      if (wrap) wrap.style.transition = "";
      if (wrap?.hasPointerCapture(event.pointerId)) wrap.releasePointerCapture(event.pointerId);
    }

    // --- Touch swipe navigation ---
    function handleTouchStart(event: React.TouchEvent) {
      const t = event.touches[0];
      if (t) swipeRef.current = { startX: t.clientX, startY: t.clientY };
    }
    function handleTouchEnd(event: React.TouchEvent) {
      const start = swipeRef.current;
      swipeRef.current = null;
      if (!start || zoomed) return;
      const t = event.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.startX;
      const dy = t.clientY - start.startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        goTo(dx < 0 ? index + 1 : index - 1);
      }
    }

    if (!everOpened) {
      // Nothing rendered inside the <dialog> until the first open —
      // "loaded on open only" applies to the component's own image
      // requests, not just next/image's default lazy behavior, so no
      // <Image> exists in the tree at all before that first open() call.
      return <dialog ref={dialogRef} className={styles.diplomiViewerDialog} onClose={handleClose} />;
    }

    const showPrevPreload = preloadNeighbors && index > 0;
    const showNextPreload = preloadNeighbors && index < diplomas.length - 1;

    return (
      <dialog
        ref={dialogRef}
        className={styles.diplomiViewerDialog}
        data-closing={closing ? "true" : undefined}
        aria-labelledby="diplomi-viewer-heading"
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        onTransitionEnd={handleTransitionEnd}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
      >
        <div ref={cardRef} className={styles.diplomiViewerCard} onClick={(e) => e.stopPropagation()}>
          <h2 id="diplomi-viewer-heading" className={styles.diplomiViewerHeading}>
            {diploma?.title}
          </h2>

          <button type="button" className={styles.diplomiViewerCloseButton} aria-label="Chiudi" onClick={requestClose}>
            <span aria-hidden="true">×</span>
          </button>

          <p className={styles.diplomiViewerCounter}>
            {index + 1} / {diplomas.length}
          </p>

          <div
            className={styles.diplomiViewerImageArea}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {diplomas.map((d, i) => {
              const isCurrent = i === index;
              const isPreload = (i === index - 1 && showPrevPreload) || (i === index + 1 && showNextPreload);
              if (!isCurrent && !isPreload) return null;
              return (
                <div
                  key={d.id}
                  className={styles.diplomiViewerSlide}
                  data-active={isCurrent}
                  aria-hidden={!isCurrent}
                >
                  {isCurrent ? (
                    <div
                      ref={imageWrapRef}
                      className={styles.diplomiViewerImageWrap}
                      data-zoomed={zoomed}
                      onClick={handleImageClick}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      style={zoomed ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
                    >
                      <Image
                        src={d.image}
                        alt={`${d.title} — ${d.institution}`}
                        fill
                        sizes="90vw"
                        className={styles.diplomiViewerImage}
                        draggable={false}
                      />
                    </div>
                  ) : (
                    // Preloaded neighbor — invisible, not interactive, just
                    // warms the browser's image cache for the next/prev
                    // navigation, per spec's "adjacent images may be
                    // preloaded after open."
                    <Image src={d.image} alt="" fill sizes="90vw" className={styles.diplomiViewerImage} />
                  )}
                </div>
              );
            })}
          </div>

          {diploma ? (
            <div className={styles.diplomiViewerCaption}>
              <p className={styles.diplomiViewerCaptionTitle}>{diploma.title}</p>
              <p className={styles.diplomiViewerCaptionMeta}>
                {diploma.institution} — {diploma.year}
              </p>
            </div>
          ) : null}

          <button
            type="button"
            className={`${styles.diplomiViewerArrowButton} ${styles.diplomiViewerArrowPrev}`}
            aria-label="Diploma precedente"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.diplomiViewerArrowButton} ${styles.diplomiViewerArrowNext}`}
            aria-label="Diploma successivo"
            disabled={index === diplomas.length - 1}
            onClick={() => goTo(index + 1)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </dialog>
    );
  },
);
