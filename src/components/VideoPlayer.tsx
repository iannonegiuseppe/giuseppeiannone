"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./VideoPlayer.module.scss";

const SEEK_STEP_SECONDS = 5;
const CONTROLS_HIDE_DELAY_MS = 2500;

// Same useSyncExternalStore-with-a-no-op-subscribe pattern as
// SedesStage.tsx/HeroMedia.tsx: a one-time, post-hydration read of a
// browser-only API, without triggering the set-state-in-effect anti-
// pattern a plain useState+useEffect pair would (reduced motion is a
// static preference for the life of this component, not something that
// should re-render the player if the OS setting changes mid-visit).
function subscribeNever() {
  return () => {};
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

// Cross-component "pause the video" signal — ChannelPickerDialog.tsx and
// DiplomiViewerModal.tsx each dispatch this on window when they open (see
// their own `open:` handlers). A plain window Event rather than a new
// shared state/context layer, since this is the ONLY thing those three
// otherwise-unrelated components need to coordinate, and a global event
// is the smallest change that doesn't require threading a ref through
// page.tsx into two components that don't otherwise know this player
// exists.
export const PAUSE_VIDEO_EVENT = "lab:pause-video";

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const whole = Math.floor(totalSeconds);
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Dependency-free native <video> player — this is a WATCH video ("La
// prima seduta"), not MediaBand's ambient/autoplay loop, so none of that
// component's IntersectionObserver-driven autoplay applies here: nothing
// plays until the user clicks or presses space/enter on the play button.
// preload="none" keeps zero video bytes on the wire until that moment
// (verified via Network panel — see this pass's own QA report).
export function VideoPlayer({
  src,
  poster,
  posterAlt,
  captionsSrc,
}: {
  src: string;
  poster: string;
  posterAlt: string;
  captionsSrc?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeNever, getReducedMotionSnapshot, getReducedMotionServerSnapshot);

  // Pause when the channel popup or diploma viewer opens, per spec.
  useEffect(() => {
    function handlePauseSignal() {
      videoRef.current?.pause();
    }
    window.addEventListener(PAUSE_VIDEO_EVENT, handlePauseSignal);
    return () => window.removeEventListener(PAUSE_VIDEO_EVENT, handlePauseSignal);
  }, []);

  // Pause when the tab loses visibility, per spec.
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) videoRef.current?.pause();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Native fullscreen already handles Esc-to-exit itself — this only
  // mirrors the resulting state back into React (needed regardless of
  // whether fullscreen was entered/exited via our own button or Esc).
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Control-bar auto-hide: only while playing, per spec ("always visible
  // when paused"). The "paused -> always visible" half of that rule is a
  // plain derived value at render time (effectiveControlsVisible below),
  // not a setState here — calling setState synchronously in an effect
  // body is exactly the anti-pattern this codebase avoids elsewhere (see
  // the useSyncExternalStore comment above); this effect's only job is
  // scheduling the hide timeout while playing, which happens inside an
  // async callback, not synchronously in the effect body.
  useEffect(() => {
    if (!isPlaying) {
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
      return;
    }
    hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY_MS);
    return () => {
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying]);

  function showControlsTemporarily() {
    setControlsVisible(true);
    if (!isPlaying) return;
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY_MS);
  }

  function startPlayback() {
    setHasStarted(true);
    setIsEnded(false);
    setControlsVisible(true);
    void videoRef.current?.play();
  }

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused || el.ended) {
      startPlayback();
    } else {
      el.pause();
    }
  }

  function toggleMute() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  }

  function toggleCaptions() {
    const el = videoRef.current;
    if (!el || el.textTracks.length === 0) return;
    const track = el.textTracks[0]!;
    const next = track.mode !== "showing";
    track.mode = next ? "showing" : "hidden";
    setCaptionsOn(next);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current?.requestFullscreen();
    }
  }

  function seekTo(time: number) {
    const el = videoRef.current;
    if (!el || !Number.isFinite(duration) || duration <= 0) return;
    el.currentTime = Math.min(Math.max(0, time), duration);
    setCurrentTime(el.currentTime);
  }

  function seekFromClientX(clientX: number) {
    const track = progressTrackRef.current;
    if (!track || duration <= 0) return;
    const rect = track.getBoundingClientRect();
    const ratio = rect.width > 0 ? Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) : 0;
    seekTo(ratio * duration);
  }

  // Pointer capture (not global mousemove/mouseup listeners) so a drag
  // that starts on the track keeps receiving move events even if the
  // pointer leaves it — and, per spec's own Lenis-safety requirement,
  // capturing the pointer here is what stops Lenis from also treating
  // the same drag gesture as a page-scroll input.
  function handleProgressPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    seekFromClientX(e.clientX);
  }
  function handleProgressPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    seekFromClientX(e.clientX);
  }
  function handleProgressPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  // Space toggles play "when the player has focus" — guarded to skip
  // BUTTON targets, since a focused button already natively activates on
  // Space via its own click, and handling it again here would toggle
  // playback twice for anyone tabbed onto e.g. the mute button.
  function handleContainerKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (e.code === "Space" && target.tagName !== "BUTTON") {
      e.preventDefault();
      togglePlay();
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      seekTo(currentTime + SEEK_STEP_SECONDS);
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      seekTo(currentTime - SEEK_STEP_SECONDS);
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showCover = !hasStarted || isEnded;
  // "Always visible when paused" (per spec) is a plain derived value, not
  // a setState the effect above pushes — see that effect's own comment.
  const effectiveControlsVisible = !isPlaying || controlsVisible;

  return (
    <div
      ref={containerRef}
      className={styles.videoPlayer}
      onKeyDown={handleContainerKeyDown}
      onMouseMove={showControlsTemporarily}
      onFocus={showControlsTemporarily}
      data-fullscreen={isFullscreen || undefined}
    >
      <video
        ref={videoRef}
        className={styles.videoPlayerVideo}
        preload="none"
        playsInline
        onPlay={() => {
          setIsPlaying(true);
          setIsEnded(false);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setIsEnded(true);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
      >
        <source src={src} />
        {captionsSrc ? <track kind="captions" src={captionsSrc} srcLang="it" label="Italiano" default={false} /> : null}
      </video>

      {showCover ? (
        <>
          <Image src={poster} alt={posterAlt} fill sizes="(min-width: 64rem) 60rem, 100vw" className={styles.videoPlayerPoster} priority={false} />
          <button
            type="button"
            className={styles.videoPlayerPlayOverlay}
            aria-label={isEnded ? "Guarda di nuovo il video" : "Riproduci il video"}
            onClick={startPlayback}
          >
            <span className={styles.videoPlayerPlayCircle}>
              <span className={styles.videoPlayerPlayTriangle} aria-hidden="true" />
            </span>
          </button>
        </>
      ) : null}

      {hasStarted && !isEnded ? (
        <div className={styles.videoPlayerControls} data-visible={effectiveControlsVisible} data-reduced-motion={reducedMotion || undefined}>
          <div
            ref={progressTrackRef}
            className={styles.videoPlayerProgressTrack}
            role="slider"
            aria-label="Posizione video"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} di ${formatTime(duration)}`}
            tabIndex={0}
            onPointerDown={handleProgressPointerDown}
            onPointerMove={handleProgressPointerMove}
            onPointerUp={handleProgressPointerUp}
          >
            <div className={styles.videoPlayerProgressFill} style={{ width: `${progressPercent}%` }} />
          </div>

          <div className={styles.videoPlayerControlsRow}>
            <button
              type="button"
              className={styles.videoPlayerButton}
              aria-pressed={isPlaying}
              aria-label={isPlaying ? "Metti in pausa" : "Riproduci"}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                  <rect x="14" y="5" width="4" height="14" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M7 5l12 7-12 7V5z" fill="currentColor" />
                </svg>
              )}
            </button>

            <span className={styles.videoPlayerTime}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className={styles.videoPlayerSpacer} />

            {captionsSrc ? (
              <button
                type="button"
                className={styles.videoPlayerButton}
                aria-pressed={captionsOn}
                aria-label={captionsOn ? "Disattiva sottotitoli" : "Attiva sottotitoli"}
                onClick={toggleCaptions}
              >
                <span className={styles.videoPlayerCcLabel} aria-hidden="true">
                  CC
                </span>
              </button>
            ) : null}

            <button
              type="button"
              className={styles.videoPlayerButton}
              aria-pressed={isMuted}
              aria-label={isMuted ? "Attiva audio" : "Disattiva audio"}
              onClick={toggleMute}
            >
              {isMuted ? (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
                  <path d="M16.5 8.5l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
                  <path
                    d="M16.2 8.3a5 5 0 010 7.4M18.6 6a8.5 8.5 0 010 12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              )}
            </button>

            <button
              type="button"
              className={styles.videoPlayerButton}
              aria-label={isFullscreen ? "Esci da schermo intero" : "Schermo intero"}
              onClick={toggleFullscreen}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                {isFullscreen ? (
                  <path
                    d="M9 4v3a2 2 0 01-2 2H4M20 9h-3a2 2 0 01-2-2V4M4 15h3a2 2 0 012 2v3M15 20v-3a2 2 0 012-2h3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
