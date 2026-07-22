"use client";

import Image from "next/image";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ResolvedQualification } from "./DiplomiCardRow";
import { PAUSE_VIDEO_EVENT } from "./VideoPlayer";
import styles from "./DiplomiSection.module.scss";

export type QualificationDialogHandle = {
  open: (index: number) => void;
};

// Diplomi rebuild — deliberately simpler than the deleted
// DiplomiViewerModal.tsx: single image, open/close only, no zoom/pan/
// swipe/gallery-nav (the card row itself is the only navigation this
// section needs). Reuses that component's two already-proven fixes
// rather than re-deriving them:
// - Exit animation: native <dialog> + data-closing + transitionend,
//   same mechanism as ChannelPickerDialog.tsx.
// - Scroll lock: position: fixed on body (not overflow: hidden, which
//   this project's own body { height: 100% } reset turns into a
//   multi-thousand-pixel clamp), restored via
//   `window.scrollTo({ top, left: 0, behavior: "instant" })`. Omitting
//   `behavior` (or passing "auto") lets the restore inherit this
//   project's global `scroll-behavior: smooth` (globals.scss) and
//   animate from 0 up to the real position — the exact bug
//   DiplomiViewerModal.tsx's own comment traced and fixed; only
//   "instant" genuinely forces an immediate jump regardless of that
//   CSS rule.
export const QualificationDialog = forwardRef<
  QualificationDialogHandle,
  { qualifications: ResolvedQualification[]; closeLabel: string }
>(function QualificationDialog({ qualifications, closeLabel }, ref) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const scrollYRef = useRef(0);

  const [closing, setClosing] = useState(false);
  const [index, setIndex] = useState(0);
  const [everOpened, setEverOpened] = useState(false); // "loaded on open only"

  const qualification = qualifications[index];

  useImperativeHandle(ref, () => ({
    open: (i: number) => {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      setClosing(false);
      setIndex(i);
      setEverOpened(true);
      // Video-section pass: pauses "La prima seduta" if it's playing —
      // see VideoPlayer.tsx's own comment on this event.
      window.dispatchEvent(new Event(PAUSE_VIDEO_EVENT));

      const scrollY = window.scrollY;
      scrollYRef.current = scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      dialogRef.current?.showModal();
    },
  }));

  function restoreScrollLock() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
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
    restoreScrollLock();
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

  if (!everOpened) {
    return <dialog ref={dialogRef} className={styles.qualificationDialog} onClose={handleClose} />;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.qualificationDialog}
      data-closing={closing ? "true" : undefined}
      aria-labelledby="qualification-dialog-heading"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onTransitionEnd={handleTransitionEnd}
      onClose={handleClose}
    >
      <div ref={cardRef} className={styles.qualificationDialogCard} onClick={(e) => e.stopPropagation()}>
        <h2 id="qualification-dialog-heading" className={styles.qualificationDialogHeading}>
          {qualification?.title ?? ""}
        </h2>

        <button
          type="button"
          className={styles.qualificationDialogCloseButton}
          aria-label={closeLabel}
          onClick={requestClose}
        >
          <span aria-hidden="true">×</span>
        </button>

        {qualification?.lightboxUrl ? (
          <Image
            src={qualification.lightboxUrl}
            alt={`${qualification.title} — ${qualification.institution}`}
            width={qualification.width}
            height={qualification.height}
            sizes="90vw"
            className={styles.qualificationDialogImage}
            // Opens on demand, one image at a time — worth skipping
            // next/image's default lazy loading (which otherwise leaves a
            // brief blank flash right as the dialog opens) rather than
            // waiting on an IntersectionObserver for content that's
            // already the entire point of showModal()-ing this dialog.
            priority
            {...(qualification.lightboxLqip
              ? { placeholder: "blur" as const, blurDataURL: qualification.lightboxLqip }
              : {})}
          />
        ) : null}
      </div>
    </dialog>
  );
});
