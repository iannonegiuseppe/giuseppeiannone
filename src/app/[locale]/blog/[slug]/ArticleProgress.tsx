"use client";

import { useEffect, useState } from "react";
import { useLenisRef } from "@/components/LenisProvider";
import styles from "./article.module.scss";

// Same Lenis-driven pattern as ArticleToc.tsx — see that file's own
// comment on why (not a native scroll listener) and why lenisRef.current
// can legitimately stay null (coarse-pointer/touch devices and
// prefers-reduced-motion both disable Lenis entirely in LenisProvider —
// on either, this component renders nothing further than its own 0%
// state, which is invisible, rather than fighting a scroll system that
// isn't running). Reduced-motion is also checked directly here, on top of
// Lenis's own disable: even if some future change re-enables Lenis under
// reduced-motion for a different consumer, this specific effect (whose
// entire purpose IS motion) must not run — matching this pass's own
// explicit "suppressed entirely under prefers-reduced-motion" requirement
// rather than relying on LenisProvider's behavior as an implicit proxy.
const LENIS_WAIT_RETRIES = 30;
const LENIS_WAIT_INTERVAL_MS = 100;

export function ArticleProgress({ bodyId }: { bodyId: string }) {
  const lenisRef = useLenisRef();
  const [progress, setProgress] = useState(0);
  // State, not a ref: a ref write doesn't trigger a re-render, which would
  // leave the (empty, but still mounted) track element in the DOM under
  // reduced motion instead of this component genuinely returning null.
  const [reducedMotion, setReducedMotion] = useState(true); // safe default until the effect below confirms otherwise

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    function computeProgress() {
      const body = document.getElementById(bodyId);
      if (!body) return;
      const rect = body.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // 0 at the moment the body's top reaches the viewport top, 1 at the
      // moment its bottom reaches the viewport top — i.e. progress through
      // the body itself, not the whole page (header/footer excluded).
      const total = rect.height - viewportHeight;
      const scrolled = -rect.top;
      const ratio = total > 0 ? scrolled / total : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
    }

    function attach(retriesLeft: number) {
      if (cancelled) return;
      const lenis = lenisRef?.current;
      if (!lenis) {
        if (retriesLeft <= 0) return;
        const timer = setTimeout(() => attach(retriesLeft - 1), LENIS_WAIT_INTERVAL_MS);
        cleanup = () => clearTimeout(timer);
        return;
      }
      computeProgress();
      lenis.on("scroll", computeProgress);
      cleanup = () => lenis.off("scroll", computeProgress);
    }

    attach(LENIS_WAIT_RETRIES);
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [bodyId, lenisRef, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className={styles.progressTrack} aria-hidden="true">
      <div className={styles.progressFill} style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
