"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import styles from "./Hero.module.scss";

// Network Information API isn't in TS's DOM lib (non-standard, Chromium
// only) — narrowly typed here rather than reaching for `any`.
interface NavigatorWithConnection extends Navigator {
  connection?: { saveData?: boolean };
}

// Matches the --breakpoints "md" step (48rem/768px) used everywhere else
// in the design system — video is a desktop/tablet enhancement only.
const SMALL_VIEWPORT_QUERY = "(max-width: 47.99rem)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function shouldShowVideo(): boolean {
  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const isSmallViewport = window.matchMedia(SMALL_VIEWPORT_QUERY).matches;
  const saveData =
    (navigator as NavigatorWithConnection).connection?.saveData === true;

  return !prefersReducedMotion && !isSmallViewport && !saveData;
}

// No live subscription on purpose — this is a one-time, post-hydration
// decision, not a continuous one: a later resize or reduced-motion toggle
// should not swap photo/video mid-visit. React still needs a store to
// reconcile the client's true value against the server's, hence
// useSyncExternalStore with a no-op subscribe, rather than a `useState` +
// `useEffect` pair that would call setState synchronously in the effect.
function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

// The photo is the only thing ever server-rendered here — video is added
// after mount, purely client-side, so it can never be an LCP candidate
// and never delays first paint. `showVideo` starts false (server snapshot)
// and can only flip true once mounted, so a no-JS visitor (or one who
// fails any of the three conditions) simply keeps seeing the photo forever.
export function HeroMedia({
  photoSrc,
  photoAlt,
  photoWidth,
  photoHeight,
  videoSrc,
}: {
  photoSrc: string;
  photoAlt: string;
  photoWidth: number;
  photoHeight: number;
  videoSrc?: string;
}) {
  const showVideo = useSyncExternalStore(
    subscribe,
    () => !!videoSrc && shouldShowVideo(),
    getServerSnapshot,
  );

  if (showVideo && videoSrc) {
    return (
      <video
        className={styles.photo}
        src={videoSrc}
        poster={photoSrc}
        preload="metadata"
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return (
    <Image
      src={photoSrc}
      alt={photoAlt}
      width={photoWidth}
      height={photoHeight}
      className={styles.photo}
      priority
    />
  );
}
