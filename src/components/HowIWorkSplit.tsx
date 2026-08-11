import type { ChiSonoHowIWorkProps } from "@/components/ChiSonoHowIWork";
import styles from "./ChiSonoHowIWorkVariants.module.scss";

// D — editorial 2-column: header sticky on the left, the four parts as
// a plain divided list on the right.
export function HowIWorkSplit({ kicker, heading, intro, parts }: ChiSonoHowIWorkProps) {
  return (
    <section className={styles.splitSection} aria-labelledby="chi-sono-how-i-work-heading">
      <div className={styles.splitGrid}>
        <div className={styles.splitHeader}>
          {kicker ? <p className={styles.splitKicker}>{kicker}</p> : null}
          {heading ? (
            <h2 id="chi-sono-how-i-work-heading" className={styles.splitHeading}>
              {heading}
            </h2>
          ) : null}
          {intro ? <p className={styles.splitIntro}>{intro}</p> : null}
        </div>
        <ul className={styles.splitList}>
          {parts.map((part, index) => (
            <li key={part.title ?? index} className={styles.splitItem}>
              {part.title ? <h3 className={styles.splitTitle}>{part.title}</h3> : null}
              <div className={styles.splitBody}>
                {(part.body ?? []).map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
