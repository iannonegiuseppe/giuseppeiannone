import type { ChiSonoHowIWorkProps } from "@/components/ChiSonoHowIWork";
import styles from "./ChiSonoHowIWorkVariants.module.scss";

// C — a dashed vertical line with a node per step: the process reads
// as a literal connected sequence rather than independent columns.
export function HowIWorkPath({ kicker, heading, intro, parts }: ChiSonoHowIWorkProps) {
  return (
    <section className={styles.pathSection} aria-labelledby="chi-sono-how-i-work-heading">
      <div className={styles.header}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        {heading ? (
          <h2 id="chi-sono-how-i-work-heading" className={styles.heading}>
            {heading}
          </h2>
        ) : null}
        {intro ? <p className={styles.intro}>{intro}</p> : null}
      </div>
      <div className={styles.pathWrap}>
        <div className={styles.pathLine} aria-hidden="true" />
        <ol className={styles.pathList}>
          {parts.map((part, index) => (
            <li key={part.title ?? index} className={styles.pathItem}>
              <span className={styles.pathNode} aria-hidden="true" />
              {part.title ? <h3 className={styles.pathTitle}>{part.title}</h3> : null}
              <div className={styles.pathBody}>
                {(part.body ?? []).map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
