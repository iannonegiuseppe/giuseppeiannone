import styles from "./PracticalClosing.module.scss";

interface PracticalColumn {
  heading: string;
  body: string;
}

// Extracted + generalized from /metodo's own section 7 ("practical and
// closing") — column count is now variable (all three of Milan/Monza/
// online use exactly three, same as metodo, but nothing here requires
// that) and the closing quote is optional: Monza's own page explicitly
// has a practical trio with no closing quote, unlike metodo, Milan and
// the online page.
export function PracticalClosing({
  columns,
  closingQuote,
}: {
  columns: PracticalColumn[];
  closingQuote?: string;
}) {
  return (
    <section className={styles.practicalSection}>
      <div className={styles.practicalColumns}>
        {columns.map((col, i) => (
          <div key={i}>
            <h3 className={styles.h3}>{col.heading}</h3>
            <p className={styles.bodyP}>{col.body}</p>
          </div>
        ))}
      </div>
      {closingQuote ? (
        <>
          <div className={styles.practicalRule} />
          <p className={styles.closingQuote}>{closingQuote}</p>
        </>
      ) : null}
    </section>
  );
}
