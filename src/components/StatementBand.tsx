import styles from "./StatementBand.module.scss";

// Giuseppe's own signed statement — NOT a testimonial. Occupies the
// reference design's testimonial-carousel slot but deliberately isn't
// one: exactly one statement, no carousel/arrows/dots/rotation, no quote
// marks (a signed quote reads as a review), signature is his own name
// only. See docs/design-direction.md §9.
export function StatementBand({
  statement,
  signature,
  role,
}: {
  statement: string;
  signature: string;
  role: string;
}) {
  return (
    <section className={styles.statementSection} data-lab-section="statement">
      <div className={styles.statementInner}>
        <div className={styles.statementTextWrap}>
          <p className={styles.statementNumeral} aria-hidden="true">
            04
          </p>
          <p className={styles.statementText}>{statement}</p>
        </div>
        <p className={styles.statementSignature}>— {signature}</p>
        <p className={styles.statementRole}>{role}</p>
      </div>
    </section>
  );
}
