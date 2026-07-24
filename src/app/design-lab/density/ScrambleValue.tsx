"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./density.module.scss";

// Digits + Latin letters only (no symbols), per this pass's own
// instruction — visually the same family EB Garamond already renders
// for both "13" and "IT / EN".
const SCRAMBLE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// V2: was 6 steps / 55ms (330ms total) — reported as "under the 400ms
// §10.10 budget" but that made the decode barely perceptible. This pass
// explicitly asks for 1200-1800ms instead (a deliberate, informed
// override of the earlier budget, not a lapse) so the effect reads as a
// real decode, not a flicker. 12 * 125ms = 1500ms, the middle of that
// range.
const STEPS = 12;
const STEP_MS = 125;

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

// Only alphanumeric positions scramble — spaces and "/" (as in "IT / EN")
// pass through untouched at every frame, and don't count toward the
// reveal progress either, so the slash doesn't visually "flicker" while
// never actually being randomized.
function scrambleFrame(finalText: string, revealCount: number) {
  let alnumIndex = 0;
  return [...finalText]
    .map((ch) => {
      if (!/[a-zA-Z0-9]/.test(ch)) return ch;
      const idx = alnumIndex;
      alnumIndex += 1;
      return idx < revealCount ? ch : randomChar();
    })
    .join("");
}

// Real value is ALWAYS in the DOM, in a visually-hidden span, from first
// render — screen readers get "13" immediately, regardless of whether
// the visible scramble has run, finished, or (reduced-motion/no-JS)
// never runs at all. The animated span is aria-hidden and purely
// decorative. Triggers once on viewport entry (same one-shot
// IntersectionObserver pattern as MetodoInteractive/CertificatesMarquee)
// — under reduced-motion the effect returns before attaching the
// observer, so `display` just stays at its initial (already-correct)
// value forever, no CSS fallback needed here (unlike the motion-driven
// components, there's no transform/opacity end-state to force).
export function ScrambleValue({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const rootRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;

    const alnumLength = [...value].filter((c) => /[a-zA-Z0-9]/.test(c)).length;
    let intervalId = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.unobserve(root);
        let step = 0;
        intervalId = window.setInterval(() => {
          step += 1;
          const revealCount = Math.ceil((step / STEPS) * alnumLength);
          setDisplay(scrambleFrame(value, revealCount));
          if (step >= STEPS) {
            window.clearInterval(intervalId);
            setDisplay(value);
          }
        }, STEP_MS);
      },
      { threshold: 0.4 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
    };
  }, [value]);

  return (
    <span ref={rootRef} className={styles.scrambleWrap}>
      <span aria-hidden="true">{display}</span>
      <span className={styles.srOnly}>{value}</span>
    </span>
  );
}
