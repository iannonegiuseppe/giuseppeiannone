"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./HeroVideo.module.scss";

const YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com";

// Real click-to-play YouTube embed for the hero. Shape borrowed from
// design-preview/taupe's PlayableStill (click -> local state -> swap
// rendered content) but this actually embeds a video, not a fake toggle.
// Click-to-play means nothing loads from YouTube until the visitor
// deliberately clicks — the reduced-motion/small-screen/data-saver
// suppression the old (superseded) autoplay ambient-loop concept needed
// doesn't apply here, so this renders identically across breakpoints and
// motion preferences. Play-button visual language (circle + ivory
// triangle) matches VideoPlayer.module.scss's own play affordance.
//
// Video-section pass: the facade now returns when playback ENDS, not just
// before first play. No YouTube IFrame API script is loaded for this —
// `enablejsapi=1` + a matching `origin` param is enough to make the embed
// emit its own postMessage state updates once we send the (undocumented
// but stable) "listening" handshake; that's enough to catch `ended`
// (playerState 0) without the extra script weight. Reduced motion needs no
// handling here — the facade/iframe swap was never animated (a plain
// conditional return, not a CSS transition), so "return is instant" was
// already true before this pass.
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listens only while the iframe itself exists — mounts/unmounts in
  // lockstep with `playing`, so every play gets its own fresh listener and
  // every return-to-facade (whether from `ended` below or any other
  // unmount) tears it down first. Verified no leak across repeated
  // play/end cycles (see this pass's own QA report).
  useEffect(() => {
    if (!playing) return;

    function handleMessage(event: MessageEvent) {
      // Origin check first, before touching event.data at all — anything
      // not from the embedded player's own origin is ignored outright.
      if (event.origin !== YOUTUBE_ORIGIN) return;
      if (typeof event.data !== "string") return;

      let data: unknown;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (typeof data !== "object" || data === null) return;

      const info = (data as { info?: unknown }).info;
      const playerState =
        typeof info === "number"
          ? info
          : typeof info === "object" && info !== null
            ? (info as { playerState?: unknown }).playerState
            : undefined;

      // playerState 0 = ended. NOT reacting to 2 (paused) — out of scope
      // by explicit product decision, see this pass's own instruction.
      if (playerState === 0) {
        setPlaying(false);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [playing]);

  if (playing) {
    return (
      <iframe
        ref={iframeRef}
        className={styles.heroVideoIframe}
        src={`${YOUTUBE_ORIGIN}/embed/${youtubeId}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
        title="Video"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        onLoad={() => {
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: "listening", id: "hero-video" }),
            YOUTUBE_ORIGIN,
          );
        }}
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
