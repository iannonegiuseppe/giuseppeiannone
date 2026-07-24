"use client";

import { useEffect, useRef } from "react";
import { SignatureMark } from "@/components/Logo";
import styles from "@/components/SignatureBand.module.scss";

// V5: standalone reproduction of the real SignatureBand.tsx — same
// reasoning as every other "real component needs different behavior on
// this page" case this session (Metodo, Chi sono): REVEAL_START_VH/
// REVEAL_END_VH are hardcoded module constants in the real file, not
// props or a CSS custom property, so there's no way to retune them from
// outside without touching SignatureBand.tsx itself (off-limits — real
// homepage). Every class (.band/.mask/.signature) is imported straight
// from the real SignatureBand.module.scss, unchanged.
//
// Item 6: was 0.62 / 0.48 (a 0.14-of-viewport-height scroll window —
// fixed the "too early" problem from before, but the window itself was
// narrow enough to read as writing "too fast"). Start is barely moved
// (0.62 -> 0.68 — still comfortably past the "meaningfully in view"
// point the earlier fix established, not reverting it) but end is
// pulled much further down (0.48 -> 0.15), widening the window to 0.53
// — roughly 4x the scroll distance the writing now takes to complete.
// Tuned empirically (see this pass's own report for the verification at
// three scroll positions).
const REVEAL_START_VH = 0.68;
const REVEAL_END_VH = 0.15;

export function SignatureBandTuned() {
  const sectionRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const mask = maskRef.current;
    if (!section || !mask) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      mask.style.setProperty("--reveal", "1");
      return;
    }

    let absoluteTop = 0;
    function measure() {
      absoluteTop = section!.getBoundingClientRect().top + window.scrollY;
    }

    let ticking = false;
    function update() {
      ticking = false;
      const viewportTop = absoluteTop - window.scrollY;
      const vh = window.innerHeight;
      const start = vh * REVEAL_START_VH;
      const end = vh * REVEAL_END_VH;
      const progress = (start - viewportTop) / (start - end);
      const clamped = Math.min(1, Math.max(0, progress));
      mask!.style.setProperty("--reveal", clamped.toFixed(4));
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    measure();
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    // Real bug found while verifying this pass's own retune: the real
    // SignatureBand.tsx only re-measures via a ResizeObserver on the
    // section ITSELF — that catches the section's own size changing, but
    // not asynchronously-loaded images further UP the page (Hero, Chi
    // sono's portrait, etc.) shifting the section's POSITION without
    // changing its own box size. On this assembled page specifically,
    // several such images sit above this section, so the mount-time
    // absoluteTop was measurably stale by the time those images
    // finished loading — verified directly: forcing a re-measure after
    // full settle corrected a reveal that had otherwise been stuck at
    // 1.0000 across the entire intended window. Observing document.body
    // as well (its own height changes whenever anything above shifts,
    // regardless of whether the section's own box does) fixes it. Not a
    // retuning issue — a real staleness bug in the measurement itself,
    // one this standalone copy can fix since the real file can't be
    // touched.
    const observer = new ResizeObserver(() => {
      measure();
      update();
    });
    observer.observe(section);
    observer.observe(document.documentElement);

    // Belt-and-suspenders: a few late re-measures beyond mount, catching
    // any layout shift neither the section's own ResizeObserver nor
    // documentElement's own (verified: also insufficient on its own —
    // see this pass's own report) picks up in time.
    const timeouts = [300, 1000, 2000].map((ms) => window.setTimeout(() => { measure(); update(); }, ms));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.band} aria-hidden="true">
      <div ref={maskRef} className={styles.mask}>
        <SignatureMark className={styles.signature} />
      </div>
    </section>
  );
}
