import type { ReactNode } from "react";
import { ShimmerText } from "./ShimmerText";
import { SectionKicker } from "./ui/SectionKicker";
import styles from "./AsymmetricOffsetBlock.module.scss";

// Same local emphasis-splitter as CenteredHero.tsx — see that file's own
// comment for why this is duplicated rather than shared.
function splitEmphasis(text: string, emphasis: string | undefined, render: (s: string) => ReactNode) {
  const index = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      {render(emphasis)}
      {text.slice(index + emphasis.length)}
    </>
  );
}

// Extracted verbatim from /metodo's own section 5 ("the approach") —
// light, asymmetric offset block pushed right via margin-left: auto, not
// a grid column. Do not straighten this into a two-column layout.
// `p3` is optional — metodo's own version always has exactly two main-
// column paragraphs, but the online-therapy page's time-zone section
// needs a third (Europe / Americas / Asia-Oceania each get their own).
//
// `offset` is optional — Milan/Monza pass none: their own former offset
// content (the "if neither is convenient"/"if a period gets complicated"
// closing argument) now lives inside a new photo section right after this
// one instead (see psicologo-milano/monza page.tsx's own comment), so
// this block renders as the main column alone there. metodo and the
// online-therapy page are unaffected — both always pass a real offset.
export function AsymmetricOffsetBlock({
  kicker,
  heading,
  headingEmphasisWord,
  p1,
  p2,
  p3,
  offset,
}: {
  kicker: string;
  heading: string;
  headingEmphasisWord?: string;
  p1: string;
  p2: string;
  p3?: string;
  offset?: { heading: string; p1: string; p2: string };
}) {
  const headingNode = splitEmphasis(heading, headingEmphasisWord, (s) => <ShimmerText>{s}</ShimmerText>);

  return (
    <section className={styles.approachSection}>
      <div className={styles.approachInner}>
        <p className={styles.kicker}>
          <SectionKicker>{kicker}</SectionKicker>
        </p>
        <h2 className={styles.approachHeading}>{headingNode}</h2>
        <div className={styles.approachColumn}>
          <p className={styles.bodyP}>{p1}</p>
          <p className={styles.bodyP}>{p2}</p>
          {p3 ? <p className={styles.bodyP}>{p3}</p> : null}
        </div>
        {offset ? (
          <div className={styles.approachOffset}>
            <h3 className={styles.h3}>{offset.heading}</h3>
            <p className={styles.bodyP}>{offset.p1}</p>
            <p className={styles.bodyP}>{offset.p2}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
