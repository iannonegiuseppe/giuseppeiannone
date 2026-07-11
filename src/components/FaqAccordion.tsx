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

// Renders each "normal" block's children directly (marks intact) instead
// of next-sanity's default <p> wrapper — the existing <p className=
// {faqRowAnswer}> below already provides the paragraph element and its
// styling, so double-wrapping would both be invalid-ish nesting and pull
// in an unstyled inner <p>'s default browser margin. Answers with more
// than one paragraph block will run the text together with no visual
// break — an accepted limitation given the schema's own single-paragraph
// convention (the pre-CMS hardcoded copy and the seed script both use
// exactly one paragraph per answer).
const answerComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <>{children}</>,
  },
};

// Exclusive-select accordion (radio-like, not independent toggles):
// exactly one panel open at all times, per spec — clicking the already-
// open row is a no-op rather than closing it to zero-open. All panels
// stay mounted at all times (closed ones are visually collapsed via CSS
// grid-rows, never unmounted) so every answer is present in the rendered
// HTML regardless of open state — the SEO/AEO requirement this exists
// for. Animation is CSS-only (grid-template-rows 0fr<->1fr on the panel
// wrapper, opacity on the answer text, rotate on the icon); this
// component only owns which index is open.
export function FaqAccordion({ pairs }: { pairs: readonly FaqAccordionPair[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const baseId = useId();

  return (
    <div className={styles.faqAccordion}>
      {pairs.map((pair, index) => {
        const isOpen = index === openIndex;
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
                onClick={() => setOpenIndex(index)}
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
                <p className={styles.faqRowAnswer}>
                  <PortableText value={pair.answer as never} components={answerComponents} />
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
