import type { ChiSonoPublicationsProps } from "@/components/ChiSonoPublications";
import styles from "./PublicationsVariants.module.scss";

// B — one unified card grid, every citation carries its own group tag
// instead of being sorted into three sections. See
// PublicationsVariants.module.scss's own top comment.
export function PublicationsCards({ kicker, title, note, groups, headingId }: ChiSonoPublicationsProps) {
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

      <div className={styles.cardsWrap}>
        <ul className={styles.cardsGrid}>
          {groups.flatMap((group) =>
            group.items.map((item, index) => (
              <li key={`${group.group}-${index}`} className={styles.card}>
                <span className={styles.cardTag}>{group.label}</span>
                {item.title ? (
                  <p className={styles.cardTitle}>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.cardTitleLink}>
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </p>
                ) : null}
                {item.authors ? <p className={styles.cardAuthors}>{item.authors}</p> : null}
                {item.source ? <p className={styles.cardSource}>{item.source}</p> : null}
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
