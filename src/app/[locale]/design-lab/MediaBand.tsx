"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./design-lab.module.scss";

export type MediaBandMedia =
  | { type: "image"; src: string }
  | { type: "video"; src: string; poster: string };

// Ambient background media for a full-bleed band. Supports a static photo
// or a muted, looping, ambient video (variant A: no controls, no audio
// track expected). Video never appears in the network log until the band
// nears the viewport (preload="none" + play() only on intersection) and
// never plays under prefers-reduced-motion — the poster stands in as the
// static image-mode behavior in that case.
//
// Video asset requirements (once a real asset is sourced): short loop,
// 6-15s, no audio track, H.264 (+ optional AV1/WebM source), target <=4MB,
// 1280-1920px wide.
export function MediaBand({ media }: { media: MediaBandMedia }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (media.type !== "video") return;
    const el = videoRef.current;
    if (!el) return;
    // Poster remains the fallback — matches static image-mode behavior.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.play().catch(() => {
              // Some browsers block autoplay even when muted — the poster
              // stays visible as the fallback, nothing else to do here.
            });
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [media.type]);

  if (media.type === "video") {
    return (
      <video
        ref={videoRef}
        className={`${styles.mediaBandVisual} ${styles.heroOverlapPhotoTreated}`}
        poster={media.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      >
        <source src={media.src} type="video/mp4" />
      </video>
    );
  }

  return (
    <Image
      src={media.src}
      alt=""
      fill
      loading="lazy"
      sizes="(min-width: 48rem) 60vw, 100vw"
      className={`${styles.mediaBandVisual} ${styles.heroOverlapPhotoTreated}`}
    />
  );
}
