"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { SignatureMark } from "./Logo";
import styles from "./PageTransitionLoader.module.scss";

// Only shown once a client navigation has been running longer than this —
// Next's own client transitions are usually instant, so anything faster
// never gets an overlay at all (flashing one on a fast transition would
// read as the site being slower, not more polished).
const SHOW_DELAY_MS = 300;

// If the pathname never actually changes after a navigation was armed (a
// failed/aborted transition, a JS error mid-navigation, a dropped
// request), give up and hide rather than leaving the overlay stuck over
// the page indefinitely. Comfortably above what even a genuinely slow
// real navigation should take, short enough that a truly stuck one
// doesn't sit there for long.
const SAFETY_TIMEOUT_MS = 8000;

function resetTimers(
  pendingRef: RefObject<boolean>,
  showTimeoutRef: RefObject<number | null>,
  safetyTimeoutRef: RefObject<number | null>,
) {
  pendingRef.current = false;
  if (showTimeoutRef.current !== null) {
    window.clearTimeout(showTimeoutRef.current);
    showTimeoutRef.current = null;
  }
  if (safetyTimeoutRef.current !== null) {
    window.clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = null;
  }
}

// Full-screen, ivory-ground overlay shown only once a client-side
// navigation has been running longer than SHOW_DELAY_MS — see this
// pass's own report for the exact contrast/colour reasoning and the
// verified fast/slow-navigation behaviour.
//
// Navigation-start detection: this app has no programmatic router.push()
// calls anywhere (grepped before writing this) — every real navigation is
// an <a> click (next-intl's own Link, or a plain anchor) or a browser
// back/forward. So this hooks in via a passive document-level click
// listener plus a popstate listener, rather than wrapping
// next/navigation's router or every <Link> site-wide. Neither listener
// calls preventDefault or otherwise touches the event, so neither can
// delay the transition itself — they only start a timer in parallel with
// whatever Next/the browser is already doing. Deliberately does NOT
// check event.defaultPrevented to skip "already handled" clicks — found
// live, next/link itself calls preventDefault on every successful
// client-side navigation (that's how it suppresses the native browser
// nav), so that check would have skipped every real navigation, not just
// same-page anchors like HeroCta's. The pathname+search comparison below
// already filters HeroCta's own #contatto link correctly on its own.
// Navigation-end detection: usePathname() (plain next/navigation, not
// the locale-aware @/i18n/navigation wrapper — same reasoning as
// LenisProvider's own comment: this needs to work even without a
// NextIntlClientProvider ancestor) changes once the new route has
// actually committed.
export function PageTransitionLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const pathnameRef = useRef(pathname);
  const pendingRef = useRef(false);
  const showTimeoutRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<number | null>(null);
  const t = useTranslations("PageTransition");

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    function arm() {
      resetTimers(pendingRef, showTimeoutRef, safetyTimeoutRef);
      pendingRef.current = true;
      showTimeoutRef.current = window.setTimeout(() => {
        if (pendingRef.current) setVisible(true);
      }, SHOW_DELAY_MS);
      safetyTimeoutRef.current = window.setTimeout(() => {
        resetTimers(pendingRef, showTimeoutRef, safetyTimeoutRef);
        setVisible(false);
      }, SAFETY_TIMEOUT_MS);
    }

    function onClick(event: MouseEvent) {
      // Modified clicks (cmd/ctrl/shift open a new tab or window;
      // middle-click is button 1) never result in an in-app transition,
      // so there's nothing to time.
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      // target="_blank" (or any named target besides the current tab)
      // opens elsewhere; a download attribute never navigates at all.
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      // Non-http(s) schemes — mailto:, tel: (both real, in the footer
      // and ChannelPickerDialog) — never produce an in-app transition.
      // wa.me is a real https host, so it's caught by the origin check
      // below instead, not here.
      if (url.protocol !== "http:" && url.protocol !== "https:") return;

      // A different host — wa.me, an external article link, Amazon —
      // leaves the app entirely; Next's router never touches it, so
      // nothing would ever clear the loader again.
      if (url.origin !== window.location.origin) return;

      // Same pathname+search as now, with or without a #hash — an
      // in-page anchor (HeroCta's own smooth-scroll links) or a link
      // back to the current page. No route change will happen.
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      arm();
    }

    function onPopState() {
      // Defensive no-op guard: nothing in this app calls
      // pushState/replaceState directly, so every popstate should carry
      // a real pathname change — but if it somehow doesn't, there's
      // nothing to wait for.
      if (window.location.pathname === pathnameRef.current) return;
      arm();
    }

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
      resetTimers(pendingRef, showTimeoutRef, safetyTimeoutRef);
    };
  }, []);

  useEffect(() => {
    // Runs on every completed navigation (pathname change) and once,
    // harmlessly, on mount — nothing is pending or visible yet then, so
    // this needs no separate "skip the first run" guard. Also cancels
    // both timers, so a fast navigation never leaves the safety timeout
    // scheduled uselessly for the next several seconds.
    resetTimers(pendingRef, showTimeoutRef, safetyTimeoutRef);
    setVisible(false);
  }, [pathname]);

  return (
    <div className={styles.overlay} data-visible={visible}>
      {/* Decorative only — always hidden from assistive tech, whether or
          not the overlay itself is currently visible. The status text
          below is what actually announces the loading state. */}
      <div className={styles.mark} aria-hidden="true">
        <SignatureMark className={styles.signature} />
      </div>
      <p className={styles.status} role="status">
        {visible ? t("loading") : ""}
      </p>
    </div>
  );
}
