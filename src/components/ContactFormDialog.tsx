"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenisRef } from "@/components/LenisProvider";
import type { Locale } from "@/sanity/paths";
import { ContactForm } from "./ContactForm";
import { PAUSE_VIDEO_EVENT } from "./VideoPlayer";
import styles from "./ContactFormDialog.module.scss";

export type ContactFormDialogHandle = {
  open: () => void;
};

// No generic/shared dialog component exists in this codebase to extend —
// QualificationDialog.tsx and ChannelPickerDialog.tsx are two independent
// implementations of the same native-<dialog> pattern, each coupled to
// its own content and CSS module. This follows that SAME established
// pattern (not a third divergent one), combining the best-verified piece
// of each rather than picking just one:
// - Scroll lock via `position: fixed` on body (QualificationDialog's
//   fix, not ChannelPickerDialog's `overflow: hidden` — this project's
//   own body { height: 100% } reset turns overflow:hidden into a
//   multi-thousand-pixel clamp, per QualificationDialog's own comment).
// - ALSO stops/starts Lenis (ChannelPickerDialog's fix): this page wraps
//   everything in LenisProvider, and Lenis intercepts wheel/touch at the
//   window level regardless of body's own position — without this,
//   smooth-scroll would keep animating whatever's under the modal.
// - Exit animation: data-closing + transitionend (both existing dialogs'
//   shared technique — calling the native .close() immediately would
//   skip any exit transition entirely).
// - Entry animation: @starting-style (QualificationDialog's own, newer
//   than ChannelPickerDialog's plain opacity/transform toggle).
export const ContactFormDialog = forwardRef<
  ContactFormDialogHandle,
  { locale: Locale; closeLabel?: string; heading: string }
>(function ContactFormDialog({ locale, closeLabel = "Chiudi", heading }, ref) {
  // Same inline locale-branch literal ContactBlock.tsx already uses for
  // this exact copy — no message-catalog key for it there either, kept
  // consistent rather than introducing a second scheme for one sentence.
  const replyLine = locale === "en" ? "I reply within 24 hours." : "Rispondo entro 24 ore.";
  // Three independent ContactFormDialog instances mount on the homepage
  // (Hero/Welcome/CtaBridge) and used to share one hardcoded heading id —
  // harmless while only one had ever been opened, but the second and third
  // duplicated it (see everOpened's own comment below for why the id
  // stuck around after close). useId() gives each instance its own,
  // stable across this instance's re-renders, so aria-labelledby always
  // resolves to THIS dialog's own heading, never whichever instance
  // happens to be first in the DOM.
  const headingId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const scrollYRef = useRef(0);
  const lenisRef = useLenisRef();

  const [closing, setClosing] = useState(false);
  // Lazy-mounted: stays false until first opened, so a visitor who never
  // opens this dialog never pays for mounting the full ContactForm (its
  // own state, refs, event listeners) — only a bare, contentless <dialog>
  // renders until then. Previously never reset back to false, so the
  // heading/form stayed mounted (and its id stayed in the DOM) even after
  // close — harmless for a single instance, but the direct cause of the
  // id collision above once more than one of the three homepage instances
  // had ever been opened. Now reset in handleClose: the transition has
  // already finished and the dialog is already closed by the time that
  // fires (see handleClose's own comment), so swapping back to the bare
  // dialog there is invisible — and it means each reopen mounts a fresh
  // form rather than resurrecting whatever was left over (typed values, a
  // stale success/error state) from the last time this instance was open.
  const [everOpened, setEverOpened] = useState(false);
  // Portal target only exists client-side — render nothing during SSR
  // (the dialog starts closed either way, so there's no content to show
  // before mount, and no hydration mismatch: server renders null, client
  // portals in on the next tick).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useImperativeHandle(ref, () => ({
    open: () => {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      setClosing(false);
      setEverOpened(true);
      window.dispatchEvent(new Event(PAUSE_VIDEO_EVENT));

      const scrollY = window.scrollY;
      scrollYRef.current = scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      lenisRef?.current?.stop();
      document.documentElement.style.scrollbarGutter = "stable";

      // showModal() is what gives this dialog its native focus trap (Tab
      // stays contained), Esc handling, and top-layer stacking — no
      // hand-rolled trap needed.
      dialogRef.current?.showModal();
    },
  }));

  function restoreScrollLock() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.documentElement.style.scrollbarGutter = "";
    lenisRef?.current?.start();
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

  // Clicking the ::backdrop registers as a click on the <dialog> element
  // itself — clicks on the card are stopped from bubbling this far.
  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) requestClose();
  }

  function handleClose() {
    setClosing(false);
    // Fires after the native dialog is already closed (either immediately,
    // for reduced-motion, or once the exit transition's transitionend has
    // already called .close() — see requestClose/handleTransitionEnd) —
    // never mid-animation, so unmounting the heavy content here is
    // invisible. See everOpened's own comment for why this matters.
    setEverOpened(false);
    restoreScrollLock();
    previouslyFocusedRef.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    return () => {
      // Unmount safety: never leave the page scroll-locked.
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.scrollbarGutter = "";
      // eslint-disable-next-line react-hooks/exhaustive-deps
      lenisRef?.current?.start();
    };
  }, [lenisRef]);

  if (!mounted) return null;

  // Portaled to document.body — real bug found via computed-style check,
  // not assumed: rendered in its normal DOM position (inside Welcome's
  // own tone-mid-scoped subtree), this dialog inherited tone-mid's
  // reassigned --color-bg (a tan/dark-surface value ContactForm's own
  // ivory-on-dark-gradient styling never expected) instead of the true
  // root ivory — invisible or near-invisible text on both themes, since
  // native <dialog>'s top-layer PAINTING is independent of the normal
  // DOM's CSS custom-property INHERITANCE, which still flows through
  // wherever the element actually sits in the tree. Portaling to body
  // sidesteps this entirely: the dialog inherits straight from :root,
  // same as every other page-level overlay, regardless of which tonal
  // scope its trigger button happens to live inside.
  const dialog = !everOpened ? (
    <dialog ref={dialogRef} className={styles.contactDialog} onClose={handleClose} />
  ) : (
    <dialog
      ref={dialogRef}
      className={styles.contactDialog}
      data-closing={closing ? "true" : undefined}
      aria-labelledby={headingId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onTransitionEnd={handleTransitionEnd}
      onClose={handleClose}
    >
      <div
        ref={cardRef}
        className={styles.contactDialogCard}
        data-sheen="upper-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.contactDialogCloseButton}
          aria-label={closeLabel}
          onClick={requestClose}
        >
          <span aria-hidden="true">×</span>
        </button>

        <h2 id={headingId} className={styles.contactDialogHeading}>
          {heading}
        </h2>

        <div className={styles.contactDialogFormWrap}>
          <ContactForm locale={locale} replyLine={replyLine} />
        </div>
      </div>
    </dialog>
  );

  return createPortal(dialog, document.body);
});
