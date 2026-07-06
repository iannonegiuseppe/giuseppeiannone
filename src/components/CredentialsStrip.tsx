import styles from "./CredentialsStrip.module.scss";

// Brief §6: "factual only ... as plain text pairs — not animated
// counters." Each item is one complete, editor-authored phrase; nothing
// here numeric is ever styled differently from the surrounding text.
export function CredentialsStrip({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className={styles.section}>
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
