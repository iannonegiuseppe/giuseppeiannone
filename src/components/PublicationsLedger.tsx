import type { ChiSonoPublicationsProps } from "@/components/ChiSonoPublications";
import styles from "./PublicationsVariants.module.scss";

function ordinal(n: number): string {
  return n.toString().padStart(2, "0");
}

// D — one editorial list, every entry numbered in sequence across all
// groups. See PublicationsVariants.module.scss's own top comment.
export function PublicationsLedger({ kicker, title, note, groups, headingId }: ChiSonoPublicationsProps) {
  const flat = groups.flatMap((group) => group.items.map((item) => ({ ...item, groupLabel: group.label })));

  return (
    <section aria-labelledby={headingId}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
          {title ? (
            <h2 id={headingId} className={styles.title}>
              {title}
            </h2>
          ) : null}
        </div>
        {note ? <p className={styles.note}>{note}</p> : null}
      </div>

      <div className={styles.ledgerWrap}>
        <ol className={styles.ledgerList}>
          {flat.map((item, index) => (
            <li key={index} className={styles.ledgerItem}>
              <span className={styles.ledgerNumber} aria-hidden="true">
                {ordinal(index + 1)}
              </span>
              <div>
                <p className={styles.ledgerGroup}>{item.groupLabel}</p>
                {item.title ? (
                  <p className={styles.ledgerTitle}>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.ledgerTitleLink}>
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </p>
                ) : null}
                <p className={styles.ledgerMeta}>
                  {item.authors ? <span className={styles.ledgerAuthors}>{item.authors}</span> : null}
                  {item.authors && item.source ? " — " : null}
                  {item.source}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
