"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.scss";

// Patch pass — hero portrait replaced with an ambient video. `hasVideo` is
// resolved SERVER-SIDE in page.tsx (a real fs.existsSync check against
// /public/media/, not guessed), so this component never has to fetch-and-
// fail client-side: it either renders the real <video> or the tonal
// placeholder from the very first paint.
//
// autoPlay is deliberately NOT a plain HTML attribute here — reduced-
// motion needs to suppress it, and that's a runtime (client) check
// (matchMedia), not something a Server Component can decide. This
// component starts playback itself, only when the visitor hasn't
// requested reduced motion.
export function HeroMedia({
  hasVideo,
  videoSrc,
  posterSrc,
}: {
  hasVideo: boolean;
  videoSrc: string;
  posterSrc: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!hasVideo || !videoRef.current) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        // Autoplay can still be blocked by the browser even when muted,
        // in which case the poster frame just stays put — never worse
        // than the reduced-motion static state.
      });
    }
  }, [hasVideo]);

  if (!hasVideo) {
    return <div className={styles.heroMediaPlaceholder} aria-hidden="true" />;
  }

  return (
    <video
      ref={videoRef}
      className={styles.heroMediaVideo}
      muted
      loop
      playsInline
      preload="metadata"
      poster={posterSrc}
      aria-hidden="true"
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
}
