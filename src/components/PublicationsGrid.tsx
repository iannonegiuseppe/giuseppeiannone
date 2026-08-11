import type { ChiSonoPublicationsProps } from "@/components/ChiSonoPublications";
import styles from "./PublicationsVariants.module.scss";

// A — three grouped columns at lg+ (journal | book | conference side by
// side), one continuous list below it. See PublicationsVariants.module.scss's
// own top comment for how this compares to the other three.
export function PublicationsGrid({ kicker, title, note, groups, headingId }: ChiSonoPublicationsProps) {
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

      <div className={styles.gridWrap}>
        <div className={styles.gridColumns}>
          {groups.map((group) => (
            <div key={group.group}>
              <p className={styles.gridGroupLabel}>{group.label}</p>
              <ul className={styles.gridList}>
                {group.items.map((item, index) => (
                  <li key={index} className={styles.gridItem}>
                    {item.authors ? <p className={styles.gridAuthors}>{item.authors}</p> : null}
                    {item.title ? (
                      <p className={styles.gridTitle}>
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.gridTitleLink}>
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </p>
                    ) : null}
                    {item.source ? <p className={styles.gridSource}>{item.source}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
