"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.scss";

// Click-to-play still frame — this task's own spec for "La prima seduta"
// (section 7). No real video asset exists in this repo (same situation
// flagged in every prior pass that touched VideoSection/the styleguide),
// so this stays honest about being a design artifact: clicking toggles a
// visual "would play here" state rather than silently pretending to load
// a real video. Keyboard-operable (a real <button>, not a clickable div).
export function PlayableStill({
  src,
  alt,
  label,
  activatedLabel,
}: {
  src: string;
  alt: string;
  label: string;
  activatedLabel: string;
}) {
  const [activated, setActivated] = useState(false);

  return (
    <button
      type="button"
      className={styles.playableStill}
      onClick={() => setActivated((v) => !v)}
      aria-pressed={activated}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 64rem) 40vw, 100vw"
        className={styles.playableStillImg}
      />
      <span className={styles.playableStillScrim} aria-hidden="true" />
      {activated ? (
        <span className={styles.playableStillActivated}>{activatedLabel}</span>
      ) : (
        <span className={styles.playableStillPlay} aria-hidden="true">
          <span className={styles.playableStillPlayGlyph} />
        </span>
      )}
      <span className={styles.playableStillLabel}>{label}</span>
    </button>
  );
}
