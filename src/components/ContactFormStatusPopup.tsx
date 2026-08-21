"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./ContactFormStatusPopup.module.scss";

// Portal pass — this used to be a plain <div className={styles.scrim}>,
// position: absolute + inset: 0 against ContactForm.tsx's own .formShell
// (position: relative). That contained the popup inside the FORM's own
// box: any ancestor's own overflow/positioning/stacking context could
// (and, on narrower embeds, did) clip or off-center it instead of the
// full viewport. Rebuilt as a native <dialog> + showModal(), portaled to
// document.body — the SAME established mechanism this codebase already
// uses three times over for exactly this class of problem
// (QualificationDialog.tsx, ChannelPickerDialog.tsx, ContactFormDialog.tsx
// — see _tokens.scss's own z-index comment: "every dialog on this site...
// is a native <dialog>/showModal(), which renders in the browser's own
// top layer regardless of z-index"). That gets three things for free,
// verified rather than assumed:
// - Viewport centering: the UA stylesheet centers a modal <dialog> via
//   position: fixed; inset: 0; margin: auto — no hand-rolled centering.
// - A real focus trap: this popup's body isn't just a close button, it
//   has real links (WhatsApp, tel, privacy) — Tab must not escape to the
//   page behind, which a native modal dialog enforces natively.
// - Top-layer stacking: guaranteed above the header (z: sticky, 20) and
//   the cookie consent banner (z: toast, 50, the highest CSS value on
//   this site) without needing a z-index at all — top layer always wins
//   over ordinary stacking contexts, confirmed against both by portaling
//   to document.body and screenshotting with each present.
//
// One consequence worth naming: this is now the SAME mechanism
// ContactFormDialog.tsx already uses for its own outer modal, so when
// this popup shows while ContactForm is nested inside that dialog (the
// homepage's Hero/Welcome/CtaBridge triggers), two native modal dialogs
// are open at once — legal, and exactly what the top layer is for
// (multiple entries, stacked in open order; Escape closes the topmost
// one first). Verified live: this popup still centers correctly and
// still sits above the outer dialog's own card in that case, not fighting
// it for one shared z-index the way two position:fixed overlays would.
export function ContactFormStatusPopup({
  variant,
  heading,
  children,
  onClose,
  closeLabel,
  autoDismissMs,
  returnFocusTo,
}: {
  variant: "success" | "error";
  heading: string;
  children: React.ReactNode;
  onClose: () => void;
  closeLabel: string;
  autoDismissMs?: number;
  // The element to refocus on dismiss — the caller's own document.
  // activeElement at the moment of submission, captured BEFORE this
  // component ever mounted (see ContactForm.tsx's own comment on
  // returnFocusRef for why reading document.activeElement in here,
  // after the fact, doesn't work: the submit button disables itself for
  // the whole "submitting" state, which blurs it to <body> long before
  // this popup exists to observe it). Optional/nullable so a future
  // caller that genuinely has nothing better than "whatever has focus
  // right now" can still omit it.
  returnFocusTo?: HTMLElement | null;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const scrollYRef = useRef(0);
  const headingId = useId();

  // No `mounted`-gate render here, unlike ContactFormDialog.tsx's own one
  // (which needs it — that dialog renders unconditionally, including
  // during SSR, since it's always mounted waiting for an imperative
  // open() call later). This component is the opposite: ContactForm.tsx
  // only ever renders it once `status` is already "success"/"error", a
  // value that starts at "idle" on both server and client and can only
  // change via a client event handler — there is no SSR pass where this
  // component exists at all, so createPortal(..., document.body) is safe
  // on this component's very first render.
  //
  // HONESTY-RULE CATCH: a `mounted` gate WAS tried first, copied from
  // ContactFormDialog.tsx on the assumption it was just standard
  // boilerplate for any portal. Verified live (a real, reproducible bug,
  // not assumed away) that it broke this component specifically: the gate
  // delays the <dialog> element's first real render by one extra render
  // cycle, but the effect below that calls showModal() still ran on the
  // FIRST cycle — while dialogRef.current was still null (the dialog
  // hadn't rendered yet) — so showModal() silently no-op'd via optional
  // chaining and the popup never actually opened, confirmed by polling
  // dialog.open across several hundred ms after a real submit and seeing
  // it stay false throughout. Removing the gate (this component never
  // needed it in the first place) fixes the race at the root instead of
  // reordering effects around it.

  // Open + scroll-lock on mount — this component is only ever mounted
  // while it should be visible (ContactForm.tsx conditionally renders it
  // on status, there is no separate closed-but-mounted state), so a mount
  // effect stands in for the open() imperative handle the other dialogs
  // in this codebase use.
  useEffect(() => {
    // Scroll lock — same position:fixed + top:-scrollY technique as
    // QualificationDialog.tsx/ContactFormDialog.tsx (this project's own
    // body { height: 100% } reset turns overflow:hidden into a
    // multi-thousand-pixel clamp instead — see those files' own
    // comments), restored via window.scrollTo(..., { behavior: "instant"
    // }) — the mobile-menu fix (MobileMenuOverlay.tsx) for the exact same
    // "closing snaps/animates back to the wrong position" bug: an
    // unqualified scrollTo inherits this site's global `scroll-behavior:
    // smooth` and visibly travels from 0 back up to the real position as
    // the popup fades out, instead of jumping there instantly while
    // hidden.
    //
    // Guarded by `alreadyLocked`: when this popup shows while ContactForm
    // is nested inside ContactFormDialog's own already-open dialog, the
    // page is already scroll-locked by that outer dialog. Locking again
    // here would read window.scrollY as 0 (the page itself can't be
    // scrolled while position:fixed is already applied) and, on close,
    // restore to that wrong 0 instead of leaving the outer dialog's own
    // lock alone — verified live by opening this popup from inside the
    // dialog partway down a scrolled page and confirming the page is
    // still at its real scroll position once both close.
    const alreadyLocked = document.body.style.position === "fixed";
    let hadWidthConsumingScrollbar = false;
    if (!alreadyLocked) {
      const scrollY = window.scrollY;
      scrollYRef.current = scrollY;
      hadWidthConsumingScrollbar = window.innerWidth > document.documentElement.clientWidth;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      if (hadWidthConsumingScrollbar) {
        document.documentElement.style.scrollbarGutter = "stable";
      }
    }

    dialogRef.current?.showModal();

    return () => {
      if (!alreadyLocked) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        if (hadWidthConsumingScrollbar) {
          document.documentElement.style.scrollbarGutter = "";
        }
        window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "instant" });
      }
      // Focus back to the form — the caller-captured element, not a
      // document.activeElement read from in here (see returnFocusTo's own
      // comment above for why that doesn't work for this component).
      returnFocusTo?.focus({ preventScroll: true });
    };
    // Mount-once by design (see this component's own top comment) —
    // returnFocusTo is read from the closure captured at that one mount,
    // deliberately not re-run if the caller's ref value were to change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoDismissMs) return;
    const timer = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, onClose]);

  // Native "close" (fired by dialog.close(), and by the default,
  // non-prevented "cancel"-then-close on Escape) is the single source of
  // truth that drives the parent's onClose — the close button below calls
  // dialogRef.current?.close() rather than the onClose prop directly, so
  // there's exactly one path from "this dialog actually closed" to
  // "React clears the status," matching this popup's real native modal
  // state instead of letting them drift apart.
  function handleNativeClose() {
    onClose();
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.popupDialog}
      aria-labelledby={headingId}
      onClose={handleNativeClose}
    >
      <div className={styles.popup} data-variant={variant} role={variant === "success" ? "status" : "alert"}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={() => dialogRef.current?.close()}
          aria-label={closeLabel}
        >
          <span aria-hidden="true">×</span>
        </button>
        <h3 id={headingId} className={styles.heading}>
          {heading}
        </h3>
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
