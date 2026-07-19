import { RevealOnScroll } from "./RevealOnScroll";
import styles from "./RecognitionSection.module.scss";

export interface RecognitionFragmentDoc {
  label: string;
  text: string;
  emphasisWord?: string;
  tier: "anchor" | "dominant" | "peripheral";
}

// Asymmetric-constellation rebuild: retires the old scroll-driven "drum"
// (RecognitionStage.tsx/RecognitionHighlightList.tsx), its pinned-stage
// mechanism, and the per-vignette zigzag background-visual crossfade
// (RecognitionBackgroundVisuals.tsx + the recognition-visual-*.svg line-art
// placeholders) entirely — no replacement background motif. The section's
// only visual interest is the composition of fragments itself. One quote
// per screen (the old design) is wrong for this section's job: a visitor
// should land on a recognizable sentence within a second, so several
// fragments now coexist on screen at once, at varying positions (desktop)
// or stacked dominant-first (mobile) — see RecognitionSection.module.scss's
// own comments for the layout mechanics.
//
// Same substring-match emphasis technique as HeroOverlap.tsx's own
// renderHeadline (duplicated rather than shared, per this codebase's
// established convention for small single-purpose helpers — see e.g.
// isScrollable/getScrollContainer's own multi-file duplication). Matches
// the first occurrence of emphasisWord (which may itself be a short
// phrase, e.g. "già stanco") case-sensitively; no match or no value
// renders the sentence as plain text.
function renderEmphasis(text: string, emphasisWord: string | undefined, emphasisClassName: string) {
  if (!emphasisWord) return text;
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <em className={emphasisClassName}>{emphasisWord}</em>
      {after}
    </>
  );
}

const MAX_FRAGMENTS = 6;

const TIER_CLASS_KEY: Record<RecognitionFragmentDoc["tier"], "recognitionFragmentAnchor" | "recognitionFragmentDominant" | "recognitionFragmentPeripheral"> = {
  anchor: "recognitionFragmentAnchor",
  dominant: "recognitionFragmentDominant",
  peripheral: "recognitionFragmentPeripheral",
};

// Anchor-first, then dominant, then peripheral — matches both mobile's
// single-column order (spec: "anchor collapses in first, above the
// dominants") and desktop's slot assignment below, where slot0 is always
// the anchor's own dedicated centre-left position. Stable otherwise, so
// fragments keep their relative dataset order within a tier.
const TIER_RANK: Record<RecognitionFragmentDoc["tier"], number> = {
  anchor: 0,
  dominant: 1,
  peripheral: 2,
};

export function RecognitionSection({
  kicker,
  heading,
  bridgeLine,
  fragments: rawFragments,
}: {
  kicker: string;
  heading: string;
  bridgeLine: string;
  fragments?: RecognitionFragmentDoc[];
}) {
  // Schema enforces at most one anchor (Rule.custom on the array), but
  // this component defends against stale/hand-edited data the same way
  // the six-cap below does: demote every anchor after the first to
  // dominant (for rendering purposes only, not a data mutation) and warn,
  // rather than silently rendering two oversized fragments fighting for
  // the same centre-left slot. Written without a mutable closure variable
  // (findIndex + map, not a running "have we seen one yet" flag) — a
  // reassigned variable read across a .map callback trips this project's
  // lint rule against mutation-during-render.
  const inputFragments = rawFragments ?? [];
  const firstAnchorIndex = inputFragments.findIndex((f) => f.tier === "anchor");
  const withAtMostOneAnchor = inputFragments.map((f, i) =>
    f.tier === "anchor" && i !== firstAnchorIndex ? { ...f, tier: "dominant" as const } : f,
  );
  const anchorCount = inputFragments.filter((f) => f.tier === "anchor").length;
  if (anchorCount > 1) {
    console.warn(
      `RecognitionSection: ${anchorCount} anchor-tier fragments in the dataset — only the first is rendered as the anchor, the rest as dominant.`,
    );
  }

  const sorted = [...withAtMostOneAnchor].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);

  // Cap at 6, per spec — reported rather than silently cramming more in
  // (beyond six the composition turns to mush, and full symptom coverage
  // is "In cosa posso aiutarti?"'s job, not this section's).
  if (sorted.length > MAX_FRAGMENTS) {
    console.warn(
      `RecognitionSection: ${sorted.length} fragments in the dataset, rendering only the first ${MAX_FRAGMENTS}.`,
    );
  }
  const fragments = sorted.slice(0, MAX_FRAGMENTS);

  return (
    <section className={styles.recognitionSection} data-lab-section="recognition">
      <div className={styles.recognitionHeader}>
        <p className={styles.recognitionKicker}>
          <span className={styles.recognitionKickerRule} aria-hidden="true" />
          {kicker}
        </p>
        <h2 className={styles.recognitionHeading}>{heading}</h2>
        <p className={styles.recognitionBridge}>{bridgeLine}</p>
      </div>

      <div className={styles.recognitionConstellation}>
        {fragments.map((fragment, index) => (
          <RevealOnScroll
            key={`${fragment.label}-${index}`}
            // The reveal wrapper IS the grid item (a plain nested div
            // wouldn't participate in .recognitionConstellation's own
            // grid placement) — tier controls typography, the slot class
            // controls this fragment's asymmetric position (desktop only;
            // see the module's own comments for both).
            className={`${styles.recognitionFragment} ${styles[TIER_CLASS_KEY[fragment.tier]]} ${
              styles[`recognitionSlot${index}`] ?? ""
            }`}
          >
            {/* Anchor pass: dropped the label for this tier specifically when
                empty — a bare, unlabeled statement reads as the single
                universal line the composition anchors around, rather than
                one more category alongside Stress/Ansia/etc. Reported in
                this pass's own summary. Dominant/peripheral always show it. */}
            {fragment.label ? <p className={styles.recognitionFragmentLabel}>{fragment.label}</p> : null}
            <p className={styles.recognitionFragmentText}>
              {renderEmphasis(fragment.text, fragment.emphasisWord, styles.recognitionEmphasis!)}
            </p>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
