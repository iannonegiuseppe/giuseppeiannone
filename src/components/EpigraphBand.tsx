import { SectionKicker } from "./ui/SectionKicker";
import styles from "./EpigraphBand.module.scss";

// Extracted verbatim from /metodo's own section 4 ("the relationship") —
// dark, kicker + large italic epigraph + a single ~720px column of
// paragraphs. Generalized from metodo's fixed p1/p2/p3 to a `paragraphs`
// array (2-4 items in practice) since nothing about the pattern actually
// requires exactly three.
//
// The caller owns the "themeDark" ancestor wrapper (same rule as
// SplitBlock). This component ALSO paints its own explicit background/
// color pair rather than relying on inherited tokens — metodo's own
// version originally didn't, and the section rendered ivory-on-ivory
// (near-invisible) until that was caught live and fixed. Do not remove
// this pair on the assumption the ancestor wrapper already covers it.
export function EpigraphBand({
  kicker,
  epigraph,
  paragraphs,
}: {
  kicker: string;
  epigraph: string;
  paragraphs: string[];
}) {
  return (
    <section className={styles.relationshipSection} data-sheen="upper-left">
      <div className={styles.relationshipInner}>
        <p className={styles.kicker}>
          <SectionKicker>{kicker}</SectionKicker>
        </p>
        <p className={styles.epigraph}>{epigraph}</p>
        <div className={styles.relationshipColumn}>
          {paragraphs.map((p, i) => (
            <p key={i} className={styles.bodyP}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
