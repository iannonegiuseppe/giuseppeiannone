"use client";

import { useLayoutEffect } from "react";

// Fix 2's real root cause, applying beyond just the video block: every
// `100vw`/`50vw`-based full-bleed technique on this page assumes `vw`
// equals the page's actual visible width — true only on platforms with
// overlay scrollbars (macOS/most Linux browsers, and this environment's
// own headless Chromium, which is why none of this was ever reproducible
// directly here). On a platform with a space-reserving scrollbar
// (classic Windows Chrome/Edge/Firefox), `100vw` is wider than
// `document.documentElement.clientWidth` by the scrollbar's own width —
// C1 (an earlier pass) already found this causes horizontal
// scrollability generally (fixed with `overflow-x: clip` on the page
// root), but clip only hides the resulting overflow; it doesn't correct
// the underlying miscalculation. For anything bleeding to ONE edge only
// (this page's earlier version of the video block, right-edge bled) that
// miscalculation isn't symmetric: clip trims the excess off the actual
// (scrollbar-side, i.e. right) edge, so the visible content falls short
// of the true edge by the scrollbar's width, while the untouched (left)
// edge bleeds correctly — exactly the "overflows past the container on
// the left, stops short on the right" symptom reported.
//
// Fix: measure the real visible width in JS and expose it as a CSS
// custom property every bleed technique on this page can reference
// instead of the raw `vw` unit. Falls back to plain `100vw` via CSS
// `var(--vw100, 100vw)` before this runs (SSR / no-JS) — imperfect on a
// reserved-scrollbar browser in that narrow window, but never wrong on
// the far more common overlay-scrollbar case, and self-corrects the
// instant this effect runs.
export function ViewportWidthFix() {
  useLayoutEffect(() => {
    function setViewportWidth() {
      document.documentElement.style.setProperty("--vw100", `${document.documentElement.clientWidth}px`);
    }
    setViewportWidth();
    window.addEventListener("resize", setViewportWidth);
    return () => window.removeEventListener("resize", setViewportWidth);
  }, []);

  return null;
}
