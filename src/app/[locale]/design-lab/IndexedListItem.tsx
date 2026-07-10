import styles from "./design-lab.module.scss";

// Reusable indexed-list entry (numeral + title + sub-items). Not a link
// yet — area detail pages don't exist — the title is its own element so
// it can become an <a> later without restructuring this component.
export function IndexedListItem({
  numeral,
  title,
  subItems,
}: {
  numeral: string;
  title: string;
  subItems: string[];
}) {
  return (
    <div className={styles.indexedItem}>
      <span className={styles.indexedItemNumeral} aria-hidden="true">
        {numeral}
      </span>
      <div className={styles.indexedItemBody}>
        <h3 className={styles.indexedItemTitle}>{title}</h3>
        <ul className={styles.indexedItemSubList}>
          {subItems.map((item) => (
            <li key={item} className={styles.indexedItemSubItem}>
              <span className={styles.indexedItemDash} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
