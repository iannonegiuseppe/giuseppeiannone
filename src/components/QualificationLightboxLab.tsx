"use client";

import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useLenisRef } from "@/components/LenisProvider";
import type { DiplomiLabItem } from "./DiplomiSlider";
import styles from "./qualificationLightboxLab.module.scss";

export type QualificationLightboxLabHandle = {
  open: (index: number) => void;
};

// Dedicated lightbox for /design-lab's own Diplomi block — NOT the shared
// src/components/QualificationDialog.tsx, which the real production
// DiplomiSection also renders (src/app/[locale]/page.tsx). Editing that
// file for this pass's own requirements (Lenis-based scroll lock,
// interactive-only prev/next, the redaction caption, the capped-and-lazy
// image pipeline) would have changed production behaviour too — same
// "shared component diverges -> new, separately-named one" call this
// whole route makes repeatedly (see DiplomiSlider.tsx's own comment).
//
// Structure/exit-animation borrowed from QualificationDialog.tsx's own
// PROVEN pattern (native <dialog> + data-closing + transitionend) — that
// mechanism itself isn't this pass's own invention, no reason to
// re-derive it. What's genuinely new here: Lenis stop/start instead of
// position:fixed-on-body (this pass's own explicit requirement — see
// below), items[] is ALREADY filtered to interactive-only by the caller
// (DiplomiSlider.tsx), so prev/next here never needs to skip anything,
// and the image is capped ~2000px + mounted only once `everOpened`.
export const QualificationLightboxLab = forwardRef<
  QualificationLightboxLabHandle,
  {
    items: DiplomiLabItem[];
    closeLabel: string;
    redactionNote: string;
    prevLabel: string;
    nextLabel: string;
  }
>(function QualificationLightboxLab({ items, closeLabel, redactionNote, prevLabel, nextLabel }, ref) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const lenisRef = useLenisRef();

  const [closing, setClosing] = useState(false);
  const [index, setIndex] = useState(0);
  const [everOpened, setEverOpened] = useState(false);
  // Slide pass — set only while a horizontal slide is actually animating;
  // null the rest of the time (single image rendered, exactly as before).
  // fromIndex is the OUTGOING item (kept mounted only for the transition's
  // own duration), direction is which way it exits (-1 = toward the right,
  // i.e. this was a "previous" navigation; 1 = toward the left, "next").
  const [transition, setTransition] = useState<{ fromIndex: number; direction: 1 | -1 } | null>(null);

  const item = items[index];
  const outgoingItem = transition ? items[transition.fromIndex] : undefined;

  useImperativeHandle(ref, () => ({
    open: (i: number) => {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      setClosing(false);
      setIndex(i);
      setEverOpened(true);

      // Scroll lock — Lenis, not overflow:hidden or position:fixed on
      // body/html. This project's own smooth-scroll wraps window/document
      // scroll natively (see LenisProvider.tsx's own comment on why
      // Locomotive Scroll was rejected — it virtualizes scroll, breaking
      // position:sticky/IntersectionObserver/native anchors); this
      // dialog's own scroll lock has to go through the SAME instance
      // rather than fighting it with a second, unrelated lock mechanism.
      lenisRef?.current?.stop();

      dialogRef.current?.showModal();
    },
  }));

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

  // Native "cancel" fires on Esc, before "close" — preventDefault to run
  // the exit animation instead of closing instantly.
  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    requestClose();
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) requestClose();
  }

  function handleClose() {
    setClosing(false);
    lenisRef?.current?.start();
    previouslyFocusedRef.current?.focus({ preventScroll: true });
  }

  // direction: -1 for "previous" (new image arrives from the left, old one
  // exits right), 1 for "next" (mirrored). Passed explicitly by every
  // caller rather than inferred from the raw index delta, since inference
  // breaks at the wrap-around boundary (last -> first via "next" is a
  // NUMERIC decrease, but should still slide as "next" visually).
  //
  // Guards against overlapping a transition already in flight (ignored,
  // not queued — the standard carousel debounce, simplest correct
  // behavior for a rapid double-click) and against prefers-reduced-motion
  // (instant swap, the dual-image slide render path is never entered).
  function goTo(rawNextIndex: number, direction: 1 | -1) {
    if (items.length === 0 || transition) return;
    const nextIndex = ((rawNextIndex % items.length) + items.length) % items.length;
    if (nextIndex === index) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setIndex(nextIndex);
      return;
    }
    setTransition({ fromIndex: index, direction });
    setIndex(nextIndex);
  }

  // Fires on the OUTGOING image's own slide-out keyframe animation —
  // that's always the longer-lived of the two (incoming's own arrives at
  // the same moment outgoing's leaves), so it's the correct single signal
  // that the whole transition is done.
  function handleSlideAnimationEnd(event: React.AnimationEvent<HTMLImageElement>) {
    if (event.currentTarget.dataset.slideRole === "outgoing") {
      setTransition(null);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1, -1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1, 1);
    }
    // Esc is handled by the native "cancel" event (handleCancel above),
    // not here — the browser fires it automatically for <dialog>.
  }

  useEffect(() => {
    return () => {
      // Unmount safety: never leave Lenis stopped if this ever unmounts
      // while open.
      lenisRef?.current?.start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!everOpened) {
    return <dialog ref={dialogRef} className={styles.dialog} onClose={handleClose} />;
  }

  const label = item ? `${item.institution}, ${item.year}` : "";

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      data-closing={closing ? "true" : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onTransitionEnd={handleTransitionEnd}
      onClose={handleClose}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.grain} aria-hidden="true" />

      {/* Viewport-pinned pass — close/prev/next used to live inside
          .card, position:absolute against ITS box, which resizes to
          whatever image is showing (a portrait scan is a much narrower,
          taller box than a landscape one) — so the controls visibly
          jumped between diplomas. Direct <dialog> children now, fixed to
          the true viewport (see each class's own comment in the SCSS for
          why they have to live here rather than inside .card to actually
          achieve that — .card carries a `transform`, which would make
          `position: fixed` descendants fix to ITS box instead of the
          viewport). Same click targets/handlers as before, just moved. */}
      <button type="button" className={styles.closeButton} aria-label={closeLabel} onClick={requestClose}>
        <span aria-hidden="true">×</span>
      </button>

      {items.length > 1 ? (
        <>
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            aria-label={prevLabel}
            onClick={() => goTo(index - 1, -1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonNext}`}
            aria-label={nextLabel}
            onClick={() => goTo(index + 1, 1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      ) : null}

      <div ref={cardRef} className={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* Slide pass — a single-cell grid: the CURRENT (incoming) image
            is the one non-absolute participant, so it's what sizes this
            box (byte-for-byte the same sizing behavior .image always
            had). The OUTGOING image, while a transition is in flight,
            overlays the exact same cell via position:absolute — it
            doesn't affect sizing, it's just visually present for the
            slide's own duration. Both share one grid-area so they start
            perfectly overlapping before their opposite transforms carry
            them apart. */}
        <div className={styles.imageStage}>
          {outgoingItem?.lightboxUrl ? (
            <Image
              key={`out-${outgoingItem.id}`}
              src={outgoingItem.lightboxUrl}
              alt=""
              aria-hidden="true"
              width={outgoingItem.width}
              height={outgoingItem.height}
              sizes="92vw"
              className={`${styles.image} ${styles.imageOutgoing}`}
              data-slide-role="outgoing"
              data-direction={transition?.direction}
              onAnimationEnd={handleSlideAnimationEnd}
            />
          ) : null}
          {item?.lightboxUrl ? (
            <Image
              key={item.id}
              src={item.lightboxUrl}
              alt={`${item.institution} — ${item.title}`}
              width={item.width}
              height={item.height}
              sizes="92vw"
              className={`${styles.image} ${transition ? styles.imageIncoming : ""}`}
              data-direction={transition?.direction}
              // Opens on demand, one document at a time — worth skipping
              // next/image's default lazy loading (which otherwise leaves a
              // brief blank flash right as the dialog opens) rather than
              // waiting on an IntersectionObserver for content that's
              // already the entire point of showModal()-ing this dialog.
              priority
            />
          ) : null}
        </div>

        <div className={styles.caption}>
          <p className={styles.captionMain}>
            {item?.institution}, {item?.year} — {item?.title}
          </p>
          {/* Load-bearing, not decorative: explains the black bars on the
              scan as deliberate redaction, not damage or a rendering
              error. messages/{it,en}.json's Diplomi.redactionNote, resolved
              server-side by the caller — same convention as closeLabel
              above (this file's own top comment). */}
          <p className={styles.captionNote}>{redactionNote}</p>
        </div>
      </div>
    </dialog>
  );
});
