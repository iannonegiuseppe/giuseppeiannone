import type { ReactNode } from "react";
import styles from "./SectionKicker.module.scss";

// Drop-in rule dash for a kicker line — see SectionKicker.module.scss's
// own comment for exactly which six pre-existing implementations this
// was copied from and why the geometry/colour won't drift from them.
//
// Deliberately does NOT own the kicker text's own font-size/weight/
// letter-spacing/color: every existing kicker keeps its own established
// typography (they differ slightly across callers already, e.g.
// TimelineSection's own gold vs. ChiSonoCredentials' own taupe) — this
// only wraps whatever text a caller passes as children with the flex
// layout + rule, meant to sit inside that caller's own existing kicker
// element (e.g. <p className={styles.kicker}><SectionKicker>{text}
// </SectionKicker></p>), not to replace it.
export function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <span className={styles.wrap}>
      <span className={styles.rule} aria-hidden="true" />
      {children}
    </span>
  );
}
