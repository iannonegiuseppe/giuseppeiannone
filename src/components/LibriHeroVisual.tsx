"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import NextImage from "next/image";
import { ShimmerText } from "@/components/ShimmerText";
import { placeSingleWord, type Rect, type WordPlacement } from "@/components/wordPlacement";
import bookPhoto from "../../public/libri/book-hero.png";
import styles from "./LibriHeroVisual.module.scss";

// Entry: 900ms, ease-out — "arrive and settle, not slide and stop".
// Runs on every load, not gated by session storage (removed in an
// earlier pass — see git history / that pass's own report).
const ENTRY_DURATION_MS = 900;

// Word-cycle rhythm — no bare pause ("the screen is never empty between
// words"): a word fades out and the next begins writing in the same
// instant, elsewhere. Write-in slowed in this pass — was 350ms, read as
// too fast/hurried; 600ms is inside the requested 550-650ms range, still
// clearly faster than the original hero-entry pacing but no longer a
// flicker. Fade-out and the immediate handover are unchanged — those
// were already judged right.
const WRITE_MS = 600;
const HOLD_MS = 1000;
const FADE_MS = 300;

type Phase = "writing" | "held" | "fading";

interface CycleWord extends WordPlacement {
  word: string;
  key: number;
}

function shuffle(list: string[]): string[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = arr[i];
    const b = arr[j];
    if (a === undefined || b === undefined) continue;
    arr[i] = b;
    arr[j] = a;
  }
  return arr;
}

// A fresh shuffle of all six words, corrected so its first word never
// matches the word that just finished — "never repeat a word twice in a
// row across cycles." The only place a repeat could occur is this seam
// between one shuffle and the next (within a single shuffle every word
// appears exactly once), so that's the only place this checks.
function nextShuffle(words: string[], avoid: string | null): string[] {
  const shuffled = shuffle(words);
  if (avoid && shuffled.length > 1 && shuffled[0] === avoid) {
    const swapIndex = 1 + Math.floor(Math.random() * (shuffled.length - 1));
    const first = shuffled[0];
    const swapped = shuffled[swapIndex];
    if (first !== undefined && swapped !== undefined) {
      shuffled[0] = swapped;
      shuffled[swapIndex] = first;
    }
  }
  return shuffled;
}

function rectOf(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

// The site's own fixed header — measured directly rather than assumed,
// so word placement clears whatever it's actually rendering as right
// now (its height differs by breakpoint, per --header-height-collapsed).
function headerRect(): Rect | null {
  const el = document.querySelector("header");
  return el ? rectOf(el) : null;
}

export function LibriHeroVisual({ words }: { words: string[] }) {
  // Default is "settled" — the FINAL, at-rest look — not a pre-entry
  // pose. Same no-flash discipline as the rest of this project's other
  // run-once animations: a non-JS or slow-JS visitor sees the book
  // already in its correct place, never a stranded off-screen frame.
  const [entryState, setEntryState] = useState<"settled" | "entering">("settled");
  const [current, setCurrent] = useState<CycleWord | null>(null);
  const [phase, setPhase] = useState<Phase>("writing");
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // The word layer portals into LibriHero's own .wordsLayer (a plain,
  // server-rendered div at .hero's level, found by data-attribute) —
  // see that file's own comment for why words need a coordinate frame
  // as large as the viewport, not just the book's own tight box.
  const [wordsLayerEl, setWordsLayerEl] = useState<HTMLElement | null>(null);

  const decided = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<string[]>([]);
  const lastWordRef = useRef<string | null>(null);
  const keyRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);
  const pendingRef = useRef<{ run: () => void; startedAt: number; remainingMs: number } | null>(null);
  const pausedRef = useRef(false);
  const runningRef = useRef(false);

  function clearTimer() {
    if (timerIdRef.current !== null) {
      window.clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }

  // Schedules `run` after `ms`. If the hero is currently scrolled out of
  // view, the action is remembered but its clock doesn't start — the
  // IntersectionObserver effect below starts it (or restarts it with
  // whatever time was left) when the hero becomes visible again.
  function schedule(run: () => void, ms: number) {
    clearTimer();
    pendingRef.current = { run, startedAt: Date.now(), remainingMs: ms };
    if (!pausedRef.current) {
      timerIdRef.current = window.setTimeout(() => {
        pendingRef.current = null;
        run();
      }, ms);
    }
  }

  // Placement is measured fresh for every word, against the book's and
  // the hero's REAL current geometry (not a cached/assumed value) — so
  // it stays correct across breakpoints and if the viewport is resized
  // mid-session.
  function nextWord(): CycleWord | null {
    const stageEl = stageRef.current;
    const heroEl = wordsLayerEl;
    if (!stageEl || !heroEl) return null;
    if (queueRef.current.length === 0) {
      queueRef.current = nextShuffle(words, lastWordRef.current);
    }
    const word = queueRef.current.shift() ?? words[0] ?? "";
    lastWordRef.current = word;
    keyRef.current += 1;
    const placement = placeSingleWord(word, rectOf(stageEl), rectOf(heroEl), headerRect());
    return { word, key: keyRef.current, ...placement };
  }

  function startCycle() {
    const w = nextWord();
    if (!w) {
      // Geometry not ready yet (extremely early paint) — retry shortly
      // rather than skipping this cycle silently.
      schedule(startCycle, 50);
      return;
    }
    setCurrent(w);
    setPhase("writing");
    schedule(() => {
      setPhase("held");
      schedule(() => {
        setPhase("fading");
        // No bare pause — the moment this word has faded, the next one
        // starts writing immediately, elsewhere. The old <span> unmounts
        // (different key) already fully transparent (opacity reached 0
        // during "fading"), so the swap itself is invisible.
        schedule(startCycle, FADE_MS);
      }, HOLD_MS);
    }, WRITE_MS);
  }

  // Find the server-rendered portal target once on mount.
  useLayoutEffect(() => {
    setWordsLayerEl(document.querySelector<HTMLElement>("[data-libri-words-layer]"));
  }, []);

  useLayoutEffect(() => {
    if (decided.current) return;
    if (!wordsLayerEl) return; // wait for the portal target before starting anything word-related
    decided.current = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Mobile restructure pass — below md the photo is a full-bleed
    // background (see LibriHero.module.scss's own mobile block), not a
    // discrete floating object anymore, so neither the entrance
    // (slide+scale, mask-sweep) nor the word cycle make sense here:
    // there's no longer a separate "object" arriving into the
    // composition for an entrance to announce, and BOOK_BOUNDARY_STAGE_PCT
    // (wordPlacement.ts) was traced against the OLD small, bottom-
    // anchored .stage box under object-fit: contain — under the new
    // full-bleed object-fit: cover box, stage-percent no longer maps to
    // image-pixel-percent at all (cover crops a different, position-
    // dependent window of the source), so the exclusion polygon would be
    // tracing the wrong shape entirely rather than protecting where the
    // book actually renders. Recomputing it correctly for a cover-cropped
    // background is real, separate work — not attempted here — so words
    // simply don't run at this breakpoint rather than risk landing on
    // top of the book or the now-centered copy.
    const isMobileLayout = window.matchMedia("(max-width: 47.9375rem)").matches;

    if (reduced) {
      // One word, statically shown, never cycling, no entry animation.
      // Chosen deterministically — the first word in the list — rather
      // than randomly: a fixed, predictable choice is simpler to reason
      // about and verify than a random pick that still has to look
      // intentional with motion off.
      setEntryState("settled");
      setReducedMotion(true);
      const stageEl = stageRef.current;
      const w = words[0];
      if (w && stageEl) {
        const placement = placeSingleWord(w, rectOf(stageEl), rectOf(wordsLayerEl), headerRect());
        setCurrent({ word: w, key: 0, ...placement });
      }
      return;
    }

    if (isMobileLayout) {
      // Settled immediately, no word cycle started (runningRef stays
      // false, so the IntersectionObserver pause-effect below correctly
      // no-ops too) — the photo is simply present, like any other
      // full-bleed background image on the site, not something that
      // "arrives".
      setEntryState("settled");
      return;
    }

    setEntryState("entering");
    window.setTimeout(() => setEntryState("settled"), ENTRY_DURATION_MS);

    runningRef.current = true;
    startCycle();

    return () => {
      runningRef.current = false;
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordsLayerEl]);

  // Pause the cycle when the hero scrolls out of view, resume when it
  // returns — "a loop running while someone reads the chapter list below
  // is wasted work." IntersectionObserver on the stage itself, threshold
  // 0 (any pixel on/off screen counts), not scroll-position math.
  useLayoutEffect(() => {
    if (!runningRef.current) return; // reduced-motion path never starts the loop
    const el = stageRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const shouldBePaused = !entry.isIntersecting;
        if (shouldBePaused === pausedRef.current) return;
        pausedRef.current = shouldBePaused;
        setPaused(shouldBePaused);

        if (shouldBePaused) {
          // Freeze: cancel the ticking timer, keep the pending action,
          // remember how much time was left on it. CSS handles freezing
          // the visual side itself (animation-play-state, see the
          // module's own [data-paused] rule) — this only needs to stop
          // the JS clock from advancing the phase underneath it.
          if (timerIdRef.current !== null) {
            window.clearTimeout(timerIdRef.current);
            timerIdRef.current = null;
          }
          if (pendingRef.current) {
            const elapsed = Date.now() - pendingRef.current.startedAt;
            pendingRef.current.remainingMs = Math.max(0, pendingRef.current.remainingMs - elapsed);
          }
        } else if (pendingRef.current && timerIdRef.current === null) {
          const { run, remainingMs } = pendingRef.current;
          pendingRef.current.startedAt = Date.now();
          timerIdRef.current = window.setTimeout(() => {
            pendingRef.current = null;
            run();
          }, remainingMs);
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [wordsLayerEl]);

  return (
    <>
      <div ref={stageRef} className={styles.stage} data-state={entryState}>
        <div className={styles.photoWrap}>
          <NextImage
            src={bookPhoto}
            alt=""
            fill
            sizes="(max-width: 767px) 90vw, (max-width: 1279px) 460px, 704px"
            className={styles.photo}
            priority
          />
        </div>
      </div>

      {/* Decorative — the real chapter list exists as DOM text further
          down the page (LibriIndexSection); nothing here is content.
          Portaled to .hero's own level (see .wordsLayer's own comment)
          so it can use the space beyond the book's box while staying
          within the viewport. */}
      {wordsLayerEl &&
        createPortal(
          <div className={styles.words} aria-hidden="true">
            {current && (
              <span
                key={current.key}
                className={styles.word}
                data-phase={reducedMotion ? "held" : phase}
                data-paused={paused}
                style={{ left: `${current.xPercent}%`, top: `${current.yPercent}%` }}
              >
                <ShimmerText>{current.word}</ShimmerText>
              </span>
            )}
          </div>,
          wordsLayerEl,
        )}
    </>
  );
}
