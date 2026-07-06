import { Card } from "@/components/Card";
import styles from "./ContentCardGrid.module.scss";

// Shared by the homepage's "concerns grid" and "latest from the knowledge
// base" — same visual pattern (brief §6 cards), different data source.
export function ContentCardGrid({
  heading,
  items,
}: {
  heading: string;
  items: { id: string; title: string; href: string; description?: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.grid}>
        {items.map((item) => (
          <li key={item.id}>
            <Card
              title={item.title}
              description={item.description}
              href={item.href}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
