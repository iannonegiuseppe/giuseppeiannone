"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useLenisRef } from "@/components/LenisProvider";
import { whatsappUrl } from "@/sanity/contact";
import type { ContactChannel } from "@/sanity/seo";
import { PAUSE_VIDEO_EVENT } from "./VideoPlayer";
import styles from "./HeaderInteractive.module.scss";
import sharedStyles from "./sharedSections.module.scss";

export type ChannelPickerDialogHandle = {
  open: () => void;
};

function channelHref(channel: ContactChannel): string {
  if (channel.type === "whatsapp") return whatsappUrl(channel.value);
  if (channel.type === "phone") return `tel:${channel.value}`;
  return `mailto:${channel.value}`;
}

// Part B: the header's "Inizia il percorso" button opens this —
// not a form, nothing is collected (no GDPR data processing), just a
// channel picker. Native <dialog> + showModal() per spec's stated
// preference: built-in top-layer stacking (no z-index competition with
// anything, including the fixed header), built-in Esc handling, built-in
// focus containment (the browser keeps focus trapped inside an open
// modal <dialog> natively — no hand-rolled Tab-trap needed, unlike
// MobileMenuOverlay.tsx's div-based overlay, which has no such native
// behavior to lean on). Styling limits were NOT hit — ::backdrop and the
// card itself both take the full intended treatment — so the "fall back
// to a hand-rolled trap" branch was never needed.
//
// Close-animation caveat with native <dialog>: calling .close() removes
// it from the top layer immediately, with no chance to run an exit
// transition. The standard workaround (used here): intercept the native
// "cancel" event (fired by Esc) and backdrop clicks, run a CSS
// data-closing state instead of closing immediately, and call the REAL
// .close() only once that transition finishes (via onTransitionEnd) —
// or immediately, with no transition at all, under reduced motion.
export const ChannelPickerDialog = forwardRef<
  ChannelPickerDialogHandle,
  {
    contactChannels?: ContactChannel[];
  }
>(function ChannelPickerDialog({ contactChannels }, ref) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    const [closing, setClosing] = useState(false);
    const lenisRef = useLenisRef();

    useImperativeHandle(ref, () => ({
      open: () => {
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
        setClosing(false);
        // Video-section pass: pauses "La prima seduta" if it's playing —
        // see VideoPlayer.tsx's own comment on this event.
        window.dispatchEvent(new Event(PAUSE_VIDEO_EVENT));
        dialogRef.current?.showModal();
        document.body.style.overflow = "hidden";
        // Same lock this dialog already applies via body overflow —
        // Lenis intercepts wheel/touch at the window level regardless of
        // body overflow, so without this it would keep smoothing scroll
        // for whatever's UNDER the modal while it's open (a real,
        // verified bleed-through, not a theoretical one). No-op when
        // Lenis isn't running (touch/reduced-motion/flag off).
        lenisRef?.current?.stop();
        // Reserves scrollbar space only while actually locked (see this
        // file's own comment on why this isn't a permanent CSS rule) —
        // avoids a layout jump when body's own scrollbar disappears on
        // browsers with classic (space-reserving) scrollbars.
        document.documentElement.style.scrollbarGutter = "stable";
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
      // The animated element is the CARD (opacity/transform), not the
      // <dialog> itself — transitionend bubbles, so this listener (bound
      // to the dialog for convenience) must check against the card, not
      // event.currentTarget, or the real close() would never fire.
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
    // itself (there is no separate clickable backdrop node) — clicks on
    // the card are stopped from bubbling this far, see the card's own
    // onClick below.
    function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
      if (event.target === dialogRef.current) requestClose();
    }

    function handleClose() {
      setClosing(false); // reset so the next open starts from a clean state
      document.body.style.overflow = "";
      document.documentElement.style.scrollbarGutter = "";
      lenisRef?.current?.start();
      previouslyFocusedRef.current?.focus();
    }

    useEffect(() => {
      return () => {
        // Unmount safety: never leave the page scroll-locked.
        document.body.style.overflow = "";
        document.documentElement.style.scrollbarGutter = "";
        // lenisRef doesn't point to a React-rendered node — it's a plain
        // holder for the Lenis instance LenisProvider's own effect creates
        // once (empty deps) and clears on ITS OWN unmount. Reading
        // `.current` fresh here, at cleanup time rather than captured at
        // mount time, is deliberate: LenisProvider is this component's
        // ANCESTOR, so its effect (which sets lenisRef.current) commits
        // AFTER this component's own mount-time effect body runs — a
        // value captured at mount would always be null.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        lenisRef?.current?.start();
      };
    }, [lenisRef]);

    return (
      <dialog
        ref={dialogRef}
        className={styles.channelDialog}
        data-closing={closing ? "true" : undefined}
        aria-labelledby="channel-dialog-heading"
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        onTransitionEnd={handleTransitionEnd}
        onClose={handleClose}
      >
        <div ref={cardRef} className={styles.channelDialogCard} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.channelDialogCloseButton}
            aria-label="Chiudi"
            onClick={requestClose}
          >
            <span aria-hidden="true">×</span>
          </button>

          <div className={styles.channelDialogDragHandle} aria-hidden="true" />

          <p className={styles.channelDialogKicker}>
            <span className={styles.channelDialogKickerRule} aria-hidden="true" />
            Primo contatto
          </p>
          <h2 id="channel-dialog-heading" className={styles.channelDialogHeading}>
            Scrivimi come ti è più comodo.
          </h2>

          <div className={styles.channelDialogChannels}>
            {contactChannels
              ?.slice()
              .sort((a, b) => a.order - b.order)
              .map((channel) =>
                channel.type === "whatsapp" ? (
                  <a
                    key={channel.type}
                    href={channelHref(channel)}
                    className={`${sharedStyles.btnSecondary} ${styles.channelDialogWhatsapp}`}
                  >
                    {channel.label}
                  </a>
                ) : (
                  <a key={channel.type} href={channelHref(channel)} className={styles.channelDialogLink}>
                    {channel.label}
                  </a>
                ),
              )}
          </div>

          <div className={styles.channelDialogQuietLines}>
            <p className={styles.channelDialogQuietLine}>
              Rispondo personalmente, in genere entro [segnaposto] giorni.
            </p>
            <p className={styles.channelDialogQuietLine}>
              I tuoi dati saranno trattati con la massima riservatezza.
            </p>
          </div>
        </div>
      </dialog>
    );
  },
);
