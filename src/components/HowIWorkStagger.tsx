import type { ChiSonoHowIWorkProps } from "@/components/ChiSonoHowIWork";
import styles from "./ChiSonoHowIWorkVariants.module.scss";

// A — closest to the previously-shipped layout: large ghost numerals,
// staggered columns. Re-themed onto the brand green.
export function HowIWorkStagger({ kicker, heading, intro, parts }: ChiSonoHowIWorkProps) {
  return (
    <section className={styles.staggerSection} aria-labelledby="chi-sono-how-i-work-heading">
      <div className={styles.header}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        {heading ? (
          <h2 id="chi-sono-how-i-work-heading" className={styles.heading}>
            {heading}
          </h2>
        ) : null}
        {intro ? <p className={styles.intro}>{intro}</p> : null}
      </div>
      <div className={styles.staggerRow}>
        {parts.map((part, index) => (
          <div key={part.title ?? index} className={`${styles.staggerPart} ${index % 2 === 1 ? styles.staggerPartOffset : ""}`}>
            <span className={styles.staggerNumeral} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className={styles.staggerContent}>
              {part.title ? <h3 className={styles.staggerTitle}>{part.title}</h3> : null}
              <div className={styles.staggerBody}>
                {(part.body ?? []).map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
