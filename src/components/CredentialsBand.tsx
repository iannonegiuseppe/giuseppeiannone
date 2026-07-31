import { AnimatedDivider } from "@/components/AnimatedDivider";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ScrambleValue } from "./ScrambleValue";
import styles from "./CredentialsBand.module.scss";

export interface CredentialsBandItem {
  value: string;
  caption: string;
  description: string;
}

// Extracted from DesignLabHomepage.tsx's own former inline "5.
// Credentials" section (design-lab-to-production migration) — same
// mechanism as Hope (tone.light-island-surface via .credentialsBandLight,
// see that class's own comment). No behavior change: fallbacks/coercion
// for missing Sanity data stay the caller's responsibility, same as
// before this extraction.
export function CredentialsBand({
  eyebrow,
  heading,
  items,
}: {
  eyebrow: string;
  heading: string;
  items: CredentialsBandItem[];
}) {
  return (
    <section className={styles.credentialsBandLight} aria-label="Credenziali">
      <div className={styles.credentialsInner}>
        <RevealOnScroll>
          <p className={styles.credentialsKicker}>
            <span className={styles.credentialsKickerRule} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 className={styles.credentialsHeading}>{heading}</h2>
          <AnimatedDivider className={styles.credentialsRule} />
          <ul className={styles.credentialsListLight}>
            {items.map((item, index) => (
              <li key={index} className={styles.credentialsItemLight}>
                <p className={styles.credentialsValueLight}>
                  <ScrambleValue value={item.value} />
                </p>
                <p className={styles.credentialsCaptionLight}>{item.caption}</p>
                <p className={styles.credentialsDescription}>{item.description}</p>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  );
}
