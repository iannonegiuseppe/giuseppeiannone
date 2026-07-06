import styles from "./MethodsSection.module.scss";

interface MethodItem {
  title: string;
  description: string;
}

export function MethodsSection({
  heading,
  items,
}: {
  heading: string;
  items?: MethodItem[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.grid}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            <h3 className={styles.itemTitle}>{item.title}</h3>
            <p className={styles.itemDescription}>{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
