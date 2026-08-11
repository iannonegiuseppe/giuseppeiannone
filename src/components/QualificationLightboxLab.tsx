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

  const item = items[index];

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

  function goTo(nextIndex: number) {
    if (items.length === 0) return;
    setIndex(((nextIndex % items.length) + items.length) % items.length);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
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

      <div ref={cardRef} className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeButton} aria-label={closeLabel} onClick={requestClose}>
          <span aria-hidden="true">×</span>
        </button>

        {items.length > 1 ? (
          <>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navButtonPrev}`}
              aria-label={prevLabel}
              onClick={() => goTo(index - 1)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navButtonNext}`}
              aria-label={nextLabel}
              onClick={() => goTo(index + 1)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        ) : null}

        {item?.lightboxUrl ? (
          <Image
            key={item.id}
            src={item.lightboxUrl}
            alt={`${item.institution} — ${item.title}`}
            width={item.width}
            height={item.height}
            sizes="92vw"
            className={styles.image}
            // Opens on demand, one document at a time — worth skipping
            // next/image's default lazy loading (which otherwise leaves a
            // brief blank flash right as the dialog opens) rather than
            // waiting on an IntersectionObserver for content that's
            // already the entire point of showModal()-ing this dialog.
            priority
          />
        ) : null}

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
