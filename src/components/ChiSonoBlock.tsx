"use client";

import { useLayoutEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { ShimmerText } from "@/components/ShimmerText";
import { observeVisibility } from "@/components/sharedViewportObserver";
import styles from "./chiSonoBlock.module.scss";

// Same small substring-split-and-wrap helper DesignLabHomepage.tsx/
// CtaBridgeBlock.tsx/PricingBlock.tsx each already have their own copy of
// — a fourth near-duplicate rather than extracting a shared one, matching
// this codebase's own established convention (see AreeSection.module.scss's
// own kicker-rule comment for the same reasoning applied to a CSS pattern
// instead of a JS one). Wraps the match in ShimmerText, matching Welcome/
// Tariffe's own established heading-emphasis treatment — see this pass's
// own report for the background-clip:text-over-a-photo check this choice
// specifically required.
function renderHeadingWithShimmer(text: string, emphasisWord: string | undefined, emphasisClassName: string) {
  if (!emphasisWord) return text;
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <ShimmerText className={emphasisClassName}>{emphasisWord}</ShimmerText>
      {after}
    </>
  );
}

// Full-bleed rebuild pass — new /design-lab-only component (see homePage.ts's
// own "profilo" field group comment for the reuse-vs-new call against the
// real chiSonoSection singleton). Structured like AreeSection.tsx: a
// self-painted, full-width root — no vw100 full-bleed trick needed, same
// reasoning as Metodo/CTA bridge/Pricing's own equivalent comments (this
// route's own top-level sections render unconstrained by default; the
// trick is only needed when a shared, container-constrained class like
// Metodo's .section is the ONLY thing available to wrap).
//
// Reveal: a one-shot boolean driven by sharedViewportObserver's own
// observeVisibility() — NOT a private `new IntersectionObserver(...)`
// the way WelcomeBlock.tsx's own reveal still does (that file is a
// neighbour, left untouched per this pass's own constraints). Threshold
// 0.3, matching Welcome's own private observer exactly (see this call's
// own comment) — sharedViewportObserver.ts now pools observers PER
// threshold, so this still reuses a shared instance (the same one any
// future 0.3-threshold consumer would also share), not a bespoke private
// one, while matching Welcome's actual parameter. One-shot: the callback
// unregisters itself the first time it sees `inView`, exactly
// RevealOnScroll.tsx's own (already-fixed) contract.
export function ChiSonoBlock({
  eyebrow,
  heading,
  headingEmphasisWord,
  paragraphs,
  photoUrl,
  photoAlt,
}: {
  eyebrow: string;
  heading: string;
  headingEmphasisWord?: string;
  paragraphs: string[];
  photoUrl: string;
  photoAlt: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = rootRef.current;
    if (!el) return;
    // threshold: 0.3 — matches Welcome's own private observer exactly
    // (WelcomeBlock.tsx), per this pass's own "align every parameter"
    // instruction. sharedViewportObserver.ts was extended to support
    // per-threshold pools specifically so this could reuse a shared
    // instance instead of a bespoke private one — see that file's own
    // comment.
    const unregister = observeVisibility(
      el,
      (inView) => {
        if (!inView) return;
        setRevealed(true);
        unregister();
      },
      0.3,
    );
    return unregister;
  }, []);

  return (
    // id="chi-sono" — design-lab-to-production migration: the header's
    // "Chi sono" nav link anchor-scrolls to this id (same id the retired
    // production ChiSonoSection.tsx used) — needed on both consumers now
    // that this component renders in that section's place.
    <section
      ref={rootRef}
      id="chi-sono"
      className={styles.section}
      aria-labelledby="chi-sono-heading"
      data-revealed={revealed}
      data-lab-section="profilo"
    >
      <div className={styles.photoLayer}>
        <NextImage
          src={photoUrl}
          alt={photoAlt}
          fill
          sizes="100vw"
          className={styles.photoImg}
        />
      </div>
      {/* Scrim: a separate, always-fully-rendered layer — NEVER animates
          (no clip-path, no transition of its own). Only .photoLayer above
          carries the reveal mask, same split Welcome's own
          .welcomeSeamFade/.welcomePhotoLayer pair already establishes. Flat
          colour + a hard mask cut at 51% — a layout boundary, not a
          photographic one, so no gradient is needed here at all. */}
      <div className={styles.scrim} aria-hidden="true" />
      {/* Hairline exactly on the 51% cut, same accent-rule language
          .kickerRule already uses — makes the cut read as deliberate. */}
      <div className={styles.seamRule} aria-hidden="true" />
      {/* No bottom-seam element: Diplomi below is a light (ivory) surface
          now, so the dark-meets-dark boundary these used to hide no longer
          exists — see chiSonoBlock.module.scss's own comment. */}
      {/* Grain: uniform, no gradient, no mask — see its own comment for why
          that's precisely what lets it carry zero risk of its own edge. */}
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.textBlock}>
          <p className={styles.kicker}>
            <span className={styles.kickerRule} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="chi-sono-heading" className={styles.heading}>
            {renderHeadingWithShimmer(heading, headingEmphasisWord, styles.emphasis!)}
          </h2>
          {paragraphs.map((p) => (
            <p key={p} className={styles.paragraph}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
