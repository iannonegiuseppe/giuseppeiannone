import Link from "next/link";
import type { BreadcrumbItem } from "./breadcrumbs";
import styles from "./BreadcrumbsNav.module.scss";

// Renders the exact same trail passed to buildBreadcrumbListJsonLd, so the
// visible breadcrumb nav and the BreadcrumbList structured data can never
// disagree with each other.
export function Breadcrumbs({ trail }: { trail: BreadcrumbItem[] }) {
  if (trail.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={item.path} className={styles.item}>
              {isLast ? (
                <span aria-current="page" className={styles.current}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className={styles.link}>
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
