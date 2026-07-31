"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./heroBackgroundVideo.module.scss";

// Hero background video, now Sanity-driven (Stage 2c). Load sequence:
// 1. Poster (a real image, not a placeholder box) paints immediately —
//    this is the LCP element, `priority` + no client-side gating. Stays
//    visible until the video is actually playing; never a gap, never a
//    blank frame between them.
// 2. Once the REST of the page has finished loading (window "load", or
//    immediately if it already fired by the time this mounts — never
//    gated on an idle callback, which could fire before other critical
//    work finishes), the <video> element mounts and starts fetching
//    (preload="metadata" only, not full auto) — but only if at least one
//    of srcDesktop/srcMobile is actually set; otherwise no <video>
//    element is rendered at all and the poster is the whole hero.
// 3. Once it can actually play through, it fades in over the poster and
//    plays exactly once — muted, no controls, never looped (deliberate:
//    a continuous full-screen loop is tiring for this audience; one pass
//    that settles is not).
// 4. On `ended`, it's paused (already stopped on its own last frame,
//    since no loop is set — the explicit pause is a redundant-but-cheap
//    guarantee, not a workaround for anything). hasPlayedRef additionally
//    guards against ever calling play() a second time, so scrolling away
//    mid-play and back can never restart it.
//
// prefers-reduced-motion: reduce, or navigator.connection.saveData, both
// skip step 2 entirely — the <video> element is never rendered, so the
// browser never requests any video file at all; the poster is what's
// shown, permanently. A full-screen looping/autoplaying background is
// exactly what that setting exists to suppress, and this site's audience
// is people with anxiety and panic disorders — not touched by this pass.
//
// Source selection: native <source media="..."> — no JS viewport check.
// The browser evaluates each <source>'s media query itself, before
// requesting anything, and fetches only the one that matches. When BOTH
// desktop and mobile fields are populated, the 1080p desktop source
// carries its own (min-width: 768px) guard (matching this codebase's
// "md" breakpoint token) so it is structurally impossible for a phone to
// request it. When only ONE field is populated, that source drops its
// media condition entirely and serves every width (see bothVideosSet
// below) — a lone uploaded file is the expected common case, not an
// error state, so it must not silently disappear on the breakpoint
// nobody uploaded a second file for.
//
// CONTENT GUARDRAIL for whoever selects/exports the real footage: NO
// people, NO staged therapy/session imagery. Calm, people-free footage
// only (light, water, nature, soft motion) — per §9/§10.8.
export function HeroBackgroundVideo({
  srcDesktop,
  srcMobile,
  poster,
  posterAlt,
}: {
  // Sanity file asset URL (backgroundVideoDesktop.asset->url), or
  // undefined if that field is empty — served at >=768px viewport width.
  srcDesktop?: string;
  // Sanity file asset URL (backgroundVideoMobile.asset->url), or
  // undefined if that field is empty — served below 768px. NOT a resize
  // of srcDesktop; a separate encode, and never sent as a fallback for
  // the desktop source or vice versa.
  srcMobile?: string;
  poster: string;
  posterAlt: string;
}) {
  const hasAnyVideo = Boolean(srcDesktop) || Boolean(srcMobile);
  // Single-field fallback: only meaningful to split by breakpoint when
  // BOTH files exist. With only one uploaded, it must serve every width
  // — one field being filled more often than two is the common case, and
  // silently showing no video on the breakpoint nobody uploaded a file
  // for would read as a bug, not a safeguard.
  const bothVideosSet = Boolean(srcDesktop) && Boolean(srcMobile);
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
      {shouldLoadVideo && hasAnyVideo ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- decorative, silent, no dialogue
        <video
          ref={videoRef}
          className={styles.heroVideoEl}
          data-visible={videoVisible}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          {/* Mobile source first, desktop second — browsers pick the
              first matching <source> in document order. When BOTH fields
              are populated, each carries its own explicit min/max-width
              guard, so the 1080p file can never reach a phone. When only
              ONE is populated, that single <source> gets no media
              attribute at all (a source with no media condition always
              matches) — it serves at every width instead of silently
              showing no video on the breakpoint nobody uploaded a file
              for. Only when NEITHER is populated does no <video> mount
              (hasAnyVideo above). */}
          {srcMobile ? (
            <source media={bothVideosSet ? "(max-width: 767px)" : undefined} src={srcMobile} type="video/mp4" />
          ) : null}
          {srcDesktop ? (
            <source media={bothVideosSet ? "(min-width: 768px)" : undefined} src={srcDesktop} type="video/mp4" />
          ) : null}
        </video>
      ) : null}
    </>
  );
}
