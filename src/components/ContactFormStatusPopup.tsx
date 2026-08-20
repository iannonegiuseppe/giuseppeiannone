"use client";

import { useEffect, useRef } from "react";
import styles from "./ContactFormStatusPopup.module.scss";

// Contact form popup pass — replaces two previous behaviours: the success
// state used to unmount the whole <form> (an early return swapping the
// entire render), and the error state used to render as a banner ABOVE
// the still-mounted form. Both are now this one popup, layered OVER the
// form instead — the form itself is never unmounted or hidden by either
// state, satisfied structurally (this component renders as a sibling
// overlay, not a replacement) rather than by convention.
//
// Success self-dismisses; error does not — a real behavioural difference,
// not just default props left at their fallback: ContactForm.tsx only
// ever passes autoDismissMs for the success variant. Someone reading how
// to reach Giuseppe another way after a failed send needs that text to
// stay until they're done with it, not vanish on a timer irrelevant to
// how long THAT message takes to read.
//
// role="status" (success) / role="alert" (error) carry their own implicit
// aria-live (polite / assertive respectively) and implicit aria-atomic —
// no manual aria-live needed, and using the native roles is what makes
// the auto-dismiss timer safe: a screen reader queues the full announcement
// the moment this element mounts, independent of whether the VISUAL
// element is still in the DOM by the time that queued speech finishes.
export function ContactFormStatusPopup({
  variant,
  heading,
  children,
  onClose,
  closeLabel,
  autoDismissMs,
}: {
  variant: "success" | "error";
  heading: string;
  children: React.ReactNode;
  onClose: () => void;
  closeLabel: string;
  autoDismissMs?: number;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!autoDismissMs) return;
    const timer = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, onClose]);

  // Focus the close control on mount — the popup is the thing that just
  // happened, and putting focus on its one interactive element (rather
  // than leaving it on the just-removed submit button, or nowhere) is
  // what makes a keyboard/screen-reader user aware something new appeared
  // without relying on them noticing an announcement alone.
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div className={styles.scrim}>
      <div
        className={styles.popup}
        data-variant={variant}
        role={variant === "success" ? "status" : "alert"}
      >
        <button
          type="button"
          ref={closeButtonRef}
          className={styles.closeButton}
          onClick={onClose}
          aria-label={closeLabel}
        >
          <span aria-hidden="true">×</span>
        </button>
        <h3 className={styles.heading}>{heading}</h3>
        {children}
      </div>
    </div>
  );
}
