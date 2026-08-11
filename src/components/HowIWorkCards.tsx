import type { ChiSonoHowIWorkProps } from "@/components/ChiSonoHowIWork";
import styles from "./ChiSonoHowIWorkVariants.module.scss";

// B — four bordered cards on a lighter green fill, small numeral badge
// instead of a giant watermark. A more contained, structured read.
export function HowIWorkCards({ kicker, heading, intro, parts }: ChiSonoHowIWorkProps) {
  return (
    <section className={styles.cardsSection} aria-labelledby="chi-sono-how-i-work-heading">
      <div className={styles.header}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        {heading ? (
          <h2 id="chi-sono-how-i-work-heading" className={styles.heading}>
            {heading}
          </h2>
        ) : null}
        {intro ? <p className={styles.intro}>{intro}</p> : null}
      </div>
      <ul className={styles.cardsGrid}>
        {parts.map((part, index) => (
          <li key={part.title ?? index} className={styles.cardsCard}>
            <span className={styles.cardsBadge} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            {part.title ? <h3 className={styles.cardsTitle}>{part.title}</h3> : null}
            <div className={styles.cardsBody}>
              {(part.body ?? []).map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
