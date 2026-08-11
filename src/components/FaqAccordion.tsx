"use client";

import { useId, useState } from "react";
import { PortableText, type PortableTextComponents } from "next-sanity";
import styles from "./FaqSection.module.scss";

export type FaqAccordionPair = {
  question: string;
  // Portable Text (faqAnswer schema type) — CMS-wiring pass, was a plain
  // string before.
  answer: unknown;
};

// Content-load pass fix: each "normal" block now renders as its OWN <p>
// (carrying the same answer class every caller already used), instead of
// the previous bare fragment that relied on a single wrapping <p> from
// the caller — that made every block's text run together with zero
// separation, not even a space (confirmed live before this fix: a
// fabricated 2-paragraph value rendered as one unbroken sentence run).
// Multi-paragraph answers are no longer a theoretical case once real
// prose content loads, so this can't stay an accepted limitation.
// className is a parameter, not a module-level constant, so the caller's
// answerWidth choice (indented vs full, see FaqAccordion's own prop
// comment below) still reaches every paragraph, not just a first/outer
// one. Marks (bold/em/link) are untouched — this only replaces the block-
// level wrapper, not PortableText's own default mark/annotation
// rendering, which was never overridden here.
function makeAnswerComponents(answerClassName: string | undefined): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => <p className={answerClassName}>{children}</p>,
    },
  };
}

// Exclusive-select accordion (radio-like, not independent toggles) BY
// DEFAULT: exactly one panel open at all times, clicking the already-open
// row is a no-op rather than closing it to zero-open. All panels stay
// mounted at all times (closed ones are visually collapsed via CSS
// grid-rows, never unmounted) so every answer is present in the rendered
// HTML regardless of open state — the SEO/AEO requirement this exists
// for. Animation is CSS-only (grid-template-rows 0fr<->1fr on the panel
// wrapper, opacity on the answer text, rotate on the icon).
//
// Controlled multi-open mode (/faq build pass): `openIndices`/`onToggle`
// are an opt-in pair — when BOTH are omitted this component is exactly
// what it was before (internal useState(0), exclusive-select, same no-op-
// on-already-open click), unchanged in markup/classes/animation/aria for
// every existing caller (FaqSection.tsx, PillarFaq.tsx — neither passes
// these, neither needs to change). When BOTH are present, the parent owns
// open state via a plain Set<number>: any number of panels may be open,
// zero open is valid, and this component just reports clicks upward via
// onToggle instead of managing openIndex itself. Deliberately an all-or-
// nothing pair (not two independent optional props) — a half-controlled
// component (external open state, internal click handling or vice versa)
// is a bug waiting to happen, not a real third mode.
export function FaqAccordion({
  pairs,
  openIndices,
  onToggle,
  answerWidth,
}: {
  pairs: readonly FaqAccordionPair[];
  openIndices?: Set<number>;
  onToggle?: (index: number) => void;
  // Opt-in, /faq-only (default omitted = unchanged "indented" look for
  // FaqSection.tsx/PillarFaq.tsx): drops the answer's inherited indent
  // (aligned under the question text) and 56ch cap, so it spans the full
  // panel width instead. See FaqSection.module.scss's own
  // .faqRowAnswerFull comment for why this is a second class there
  // rather than an edit to .faqRowAnswer itself.
  answerWidth?: "indented" | "full";
}) {
  const [internalOpenIndex, setInternalOpenIndex] = useState(0);
  const baseId = useId();
  const isControlled = openIndices !== undefined && onToggle !== undefined;

  return (
    <div className={styles.faqAccordion}>
      {pairs.map((pair, index) => {
        const isOpen = isControlled ? openIndices.has(index) : index === internalOpenIndex;
        const headerId = `${baseId}-header-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div className={styles.faqRow} key={pair.question}>
            <h3 className={styles.faqRowHeading}>
              <button
                type="button"
                id={headerId}
                className={styles.faqRowButton}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => (isControlled ? onToggle(index) : setInternalOpenIndex(index))}
              >
                <span className={styles.faqRowIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.faqRowQuestion}>{pair.question}</span>
                <span className={styles.faqRowIcon} aria-hidden="true">
                  <span className={styles.faqRowIconBarH} />
                  <span className={styles.faqRowIconBarV} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={styles.faqRowPanelWrap}
              data-open={isOpen}
            >
              <div className={styles.faqRowPanelInner}>
                <PortableText
                  value={pair.answer as never}
                  components={makeAnswerComponents(
                    answerWidth === "full"
                      ? `${styles.faqRowAnswer} ${styles.faqRowAnswerFull}`
                      : styles.faqRowAnswer,
                  )}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
