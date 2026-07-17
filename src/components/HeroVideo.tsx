"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./HeroVideo.module.scss";

// Real click-to-play YouTube embed for the hero. Shape borrowed from
// design-preview/taupe's PlayableStill (click -> local state -> swap
// rendered content) but this actually embeds a video, not a fake toggle.
// Click-to-play means nothing loads from YouTube until the visitor
// deliberately clicks — the reduced-motion/small-screen/data-saver
// suppression the old (superseded) autoplay ambient-loop concept needed
// doesn't apply here, so this renders identically across breakpoints and
// motion preferences. Play-button visual language (circle + ivory
// triangle) matches VideoPlayer.module.scss's own play affordance.
export function HeroVideo({
  youtubeId,
  photoSrc,
  photoClassName,
  sizes,
}: {
  youtubeId: string;
  photoSrc: string;
  photoClassName?: string;
  sizes: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className={styles.heroVideoIframe}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
        title="Video"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button type="button" className={styles.heroVideoTrigger} onClick={() => setPlaying(true)} aria-label="Play video">
      <Image src={photoSrc} alt="" fill priority sizes={sizes} className={photoClassName} />
      <span className={styles.heroVideoScrim} aria-hidden="true" />
      <span className={styles.heroVideoPlayCircle} aria-hidden="true">
        <span className={styles.heroVideoPlayTriangle} />
      </span>
    </button>
  );
}
