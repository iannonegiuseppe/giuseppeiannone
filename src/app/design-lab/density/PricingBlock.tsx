import { Fragment } from "react";
import { AnimatedDivider } from "@/components/AnimatedDivider";
import { ShimmerText } from "@/components/ShimmerText";
import styles from "./pricingBlock.module.scss";

type PricingRow = {
  mode: string;
  subline: string;
  price: string;
};

type PricingBlockProps = {
  eyebrow: string;
  heading: string;
  headingEmphasisWord?: string;
  rows: PricingRow[];
  detailsItems: string[];
  detrazioneFootnote: string;
};

// Same small substring-split-and-wrap helper DesignLabHomepage.tsx/
// CtaBridgeBlock.tsx already each have their own copy of (find the word,
// wrap it) — a third near-duplicate rather than extracting a shared one,
// matching this codebase's own established convention (see AreeSection.
// module.scss's own kicker-rule comment for the same reasoning applied to
// a CSS pattern instead of a JS one). The one real difference from those
// two: this wraps the match in ShimmerText, not a plain <em> — this
// section's own explicit spec ("same shimmer/gradient treatment other
// headings use"), not a default. ShimmerText's own file previously noted
// "wired into exactly one place (Welcome's heading) — do not spread
// without a deliberate follow-up decision"; this IS that decision, made
// by this pass's own brief, not taken unilaterally.
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

// New /design-lab-only section (see homePage.ts's own "tariffe" field
// group comment for the reuse-vs-new call against the real, still-gated
// PricingSection.tsx, and this pass's own report for the full reasoning).
// Structured like AreeSection.tsx: a self-painted, full-width root
// (background from --color-bg, retoned by tone.tone-mid-surface on the
// wrapping wrapper the same way Aree's own .toneMidWrap already works —
// see DesignLabHomepage.tsx's own usage) with a container-constrained
// inner for the actual content — NOT Metodo's own pattern (a container-
// constrained root needing a separate full-bleed wrapper), since nothing
// here needs to match Metodo's specific "existing shared .section class"
// constraint.
export function PricingBlock({
  eyebrow,
  heading,
  headingEmphasisWord,
  rows,
  detailsItems,
  detrazioneFootnote,
}: PricingBlockProps) {
  return (
    <section className={styles.pricingSection} aria-labelledby="tariffe-heading" data-lab-section="tariffe">
      <div className={styles.pricingInner}>
        <div className={styles.pricingHeader}>
          <p className={styles.pricingKicker}>
            <span className={styles.pricingKickerRule} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="tariffe-heading" className={styles.pricingHeading}>
            {renderHeadingWithShimmer(heading, headingEmphasisWord, styles.pricingHeadingEmphasis!)}
          </h2>
        </div>

        {/* Rules pass: the top rule above "In studio" is gone entirely —
            the list opens straight into the first row. Each row now gets
            its own AnimatedDivider below it (reused, not a variant) instead
            of a plain CSS border — one after "In studio", one after
            "Online", full row width. AnimatedDivider itself is a sibling
            of .pricingRow inside the same <li> (not a direct child of the
            <ul>, which only [<li>] may contain) so it spans the row's own
            width without needing a separate wrapper. */}
        <ul className={styles.pricingRowList} role="list">
          {rows.map((row, index) => (
            <li key={row.mode} className={styles.pricingRowItem}>
              <div className={styles.pricingRow}>
                <div className={styles.pricingRowMode}>
                  <p className={styles.pricingModeName}>{row.mode}</p>
                  <p className={styles.pricingSubline}>{row.subline}</p>
                </div>
                <p className={styles.pricingPrice}>{row.price}</p>
              </div>
              <AnimatedDivider className={styles.pricingRowDivider} delayIndex={index} />
            </li>
          ))}
        </ul>

        {/* Practical-details pass: replaces the old 4-column label/value
            block with one flowing line. Each item is plain copy (no
            literal separators stored in Sanity) — the middot between
            items is rendered here, aria-hidden, with a real space on
            either side so screen readers still get a natural pause
            between phrases even though the glyph itself isn't announced.
            The separator glued to a non-breaking space BEFORE it (not
            after) so a line break can only land on the normal space
            AFTER the separator — the middot stays attached to the end of
            the phrase before it, never stranded alone at a new line's
            start (verified live at 375px, see this pass's own report). */}
        <div className={styles.pricingFooter}>
          <p className={styles.pricingDetailsLine}>
            {detailsItems.map((item, index) => (
              <Fragment key={item}>
                {item}
                {index < detailsItems.length - 1 ? (
                  <span className={styles.pricingDetailsSeparator} aria-hidden="true">
                    {" ·"}
                  </span>
                ) : null}
                {index < detailsItems.length - 1 ? " " : null}
              </Fragment>
            ))}
          </p>

          {/* §9: the 19% deduction fact above must never read as
              unconditional — this footnote is the always-rendered home
              for that condition. */}
          <p className={styles.pricingFootnote}>{detrazioneFootnote}</p>
        </div>
      </div>
    </section>
  );
}
