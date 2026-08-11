import type { ChiSonoHowIWorkProps } from "@/components/ChiSonoHowIWork";
import { BlocksEqualHeight } from "@/components/BlocksEqualHeight";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { ShimmerText } from "@/components/ShimmerText";
import styles from "./ChiSonoHowIWorkVariants.module.scss";

// EXPERIMENTAL — Task 3b live contrast check, not yet confirmed safe to
// ship. HowIWorkColorBlocks is the first light-island-surface usage of
// ShimmerText anywhere in this codebase (every other usage is tone-base/
// tone-mid/dark-photo). Hardcoded to "concretamente" for the same reason
// as TimelineSection.tsx's own comment (scoped to this one heading only).
function renderHeadingWithShimmer(text: string) {
  const emphasisWord = "concretamente";
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <ShimmerText className={styles.headingEmphasis}>{emphasisWord}</ShimmerText>
      {after}
    </>
  );
}

// E — full-bleed 2x2 color-block grid, each tile a different tone
// within the same green family. The boldest, most graphic of the five.
export function HowIWorkColorBlocks({ kicker, heading, intro, parts }: ChiSonoHowIWorkProps) {
  return (
    <section className={styles.blocksSection} aria-labelledby="chi-sono-how-i-work-heading">
      <div className={styles.blocksHeaderSurface}>
        <div className={styles.blocksHeader}>
          {kicker ? (
            <p className={styles.kicker}>
              <SectionKicker>{kicker}</SectionKicker>
            </p>
          ) : null}
          {heading ? (
            <h2 id="chi-sono-how-i-work-heading" className={styles.heading}>
              {renderHeadingWithShimmer(heading)}
            </h2>
          ) : null}
          {intro ? <p className={styles.intro}>{intro}</p> : null}
        </div>
      </div>
      <BlocksEqualHeight>
        {parts.map((part, index) => (
          <li key={part.title ?? index} className={styles.blocksTile}>
            <p className={styles.blocksNumeral} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </p>
            <div className={styles.blocksContent}>
              {part.title ? <h3 className={styles.blocksTitle}>{part.title}</h3> : null}
              <div className={styles.blocksBody}>
                {(part.body ?? []).map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            </div>
          </li>
        ))}
        {/* Continuous gradient field (md+ only, gated in CSS) — one
            sheen/vignette/seam/grain stack for the whole 2x2 grid instead
            of each card painting its own copy. Absolutely positioned
            (inset:0 against .blocksGrid's own position:relative), so
            each sits outside grid auto-placement and just overlays the
            whole container; z-index does the actual layering, not DOM
            order. Placed AFTER the four card <li>s deliberately — the
            CSS's own .blocksTile:nth-child(1..4) selectors (both the
            base per-card gradients and the md+ cancel/z-index rule)
            count DOM position, not "which <li> is a real card"; putting
            these first would shift the cards to nth-child(5..8) and
            silently break the nth-child selectors for EVERY breakpoint,
            not just md+ (confirmed live during this pass — caught before
            shipping, not after). Rendered as <li aria-hidden> rather
            than a plain <div> so they stay valid children of the <ul>
            grid container BlocksEqualHeight owns (list-style:none
            already covers them). See ChiSonoHowIWorkVariants.module.scss's
            own comments for each layer. */}
        <li aria-hidden="true" className={styles.field} />
        <li aria-hidden="true" className={styles.vignette} />
        <li aria-hidden="true" className={styles.seamCross} />
        <li aria-hidden="true" className={styles.grain} />
      </BlocksEqualHeight>
    </section>
  );
}
