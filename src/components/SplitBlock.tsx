import styles from "./SplitBlock.module.scss";

interface SplitSide {
  label: string;
  heading: string;
  p1: string;
  p2: string;
  p3?: string;
}

// Extracted verbatim from /metodo's own section 2 (dark left / surface
// right, 50/50, zero gap) — generalized only in that p3 is now optional
// (metodo's own split always sets all three; the city pages only need
// two). The caller owns the "themeDark" ancestor wrapper — this
// component must never carry that class itself, on pain of the
// documented light-island mirror-image trap (CLAUDE.md's own Styling
// section): "themeDark" has to sit ABOVE the element that actually
// paints the background, never on the same element.
export function SplitBlock({ left, right }: { left: SplitSide; right: SplitSide }) {
  return (
    <div className={styles.split}>
      <div className={styles.splitLeft} data-sheen="upper-left">
        <p className={styles.splitLabel}>{left.label}</p>
        <h2 className={styles.splitHeading}>{left.heading}</h2>
        <p className={styles.splitP}>{left.p1}</p>
        <p className={styles.splitP}>{left.p2}</p>
        {left.p3 ? <p className={styles.splitP}>{left.p3}</p> : null}
      </div>
      <div className={styles.splitRight} data-sheen="upper-left">
        <p className={styles.splitLabel}>{right.label}</p>
        <h2 className={styles.splitHeading}>{right.heading}</h2>
        <p className={styles.splitP}>{right.p1}</p>
        <p className={styles.splitP}>{right.p2}</p>
        {right.p3 ? <p className={styles.splitP}>{right.p3}</p> : null}
      </div>
    </div>
  );
}
