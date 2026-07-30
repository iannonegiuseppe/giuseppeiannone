"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./heroBackgroundVideo.module.scss";

// Design-lab-only hero background video. Load sequence:
// 1. Poster (a real image, not a placeholder box) paints immediately —
//    this is the LCP element, `priority` + no client-side gating.
// 2. Once the REST of the page has finished loading (window "load", or
//    immediately if it already fired by the time this mounts — never
//    gated on an idle callback, which could fire before other critical
//    work finishes), the <video> element mounts and starts fetching
//    (preload="metadata" only, not full auto).
// 3. Once it can actually play through, it fades in over the poster and
//    plays exactly once — muted, no controls, never looped.
// 4. On `ended`, it's paused (already stopped on its own last frame,
//    since no loop is set — the explicit pause is a redundant-but-cheap
//    guarantee, not a workaround for anything). hasPlayedRef additionally
//    guards against ever calling play() a second time, so scrolling away
//    mid-play and back can never restart it.
//
// prefers-reduced-motion: reduce, or navigator.connection.saveData, both
// skip step 2 entirely — the <video> element is never rendered, so the
// browser never requests the file at all; the poster is what's shown,
// permanently.
//
// CONTENT GUARDRAIL for whoever selects/exports the real footage: NO
// people, NO staged therapy/session imagery. Calm, people-free footage
// only (light, water, nature, soft motion) — per §9/§10.8.
export function HeroBackgroundVideo({
  srcMp4,
  poster,
  posterAlt,
}: {
  // PLACEHOLDER path — file does not exist yet. Swap this one string for
  // the real exported clip once supplied; nothing else needs to change.
  srcMp4: string;
  // PLACEHOLDER poster — a real, existing calm/people-free stock photo
  // reused temporarily. Replace with the real video's own first/best
  // frame, exported as an actual image asset, once the real clip exists.
  poster: string;
  posterAlt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // poster stays permanent, video never requested
    }
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) {
      return; // data-saver: poster only
    }

    function requestVideo() {
      setShouldLoadVideo(true);
    }

    if (document.readyState === "complete") {
      requestVideo();
      return;
    }
    window.addEventListener("load", requestVideo, { once: true });
    return () => window.removeEventListener("load", requestVideo);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo) return;

    function handleCanPlay() {
      if (hasPlayedRef.current) return;
      hasPlayedRef.current = true;
      setVideoVisible(true);
      video?.play().catch(() => {
        // Autoplay blocked for some reason (muted + playsInline covers
        // every current browser's autoplay policy, so this shouldn't
        // fire) — the poster simply stays visible, nothing else to do.
      });
    }

    function handleEnded() {
      // Freeze on the final frame: pause, don't seek/reset — the video
      // is already sitting on its last frame at this point (no loop is
      // set), so this is a redundant-but-explicit guarantee, not a fix
      // for anything actually observed.
      video?.pause();
    }

    video.addEventListener("canplaythrough", handleCanPlay, { once: true });
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("canplaythrough", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
    };
  }, [shouldLoadVideo]);

  return (
    <>
      <Image
        src={poster}
        alt={posterAlt}
        fill
        priority
        sizes="100vw"
        className={styles.heroVideoPoster}
      />
      {shouldLoadVideo ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- decorative, silent, no dialogue
        <video
          ref={videoRef}
          className={styles.heroVideoEl}
          data-visible={videoVisible}
          src={srcMp4}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}
