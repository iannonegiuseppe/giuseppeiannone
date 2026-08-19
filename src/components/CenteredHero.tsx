import type { ReactNode } from "react";
import { ShimmerText } from "./ShimmerText";
import { SectionKicker } from "./ui/SectionKicker";
import styles from "./CenteredHero.module.scss";

// Extracted verbatim from /metodo's own section 1 (metodo/page.tsx +
// page.module.scss, both unchanged in structure) — the light-island,
// centred hero pattern, now shared across /metodo and the three
// city/online pages. Same indexOf-based emphasis-split mechanism every
// real page's own heading/title split already uses (chi-sono, prezzi,
// contatti, metodo itself) — duplicated here rather than centralized,
// matching that established per-file convention.
function splitEmphasis(text: string, emphasis: string | undefined, render: (s: string) => ReactNode) {
  const index = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      {render(emphasis)}
      {text.slice(index + emphasis.length)}
    </>
  );
}

export function CenteredHero({
  kicker,
  title,
  titleEmphasisWord,
  lead,
}: {
  kicker: string;
  title: string;
  titleEmphasisWord?: string;
  lead: string;
}) {
  const titleNode = splitEmphasis(title, titleEmphasisWord, (s) => <ShimmerText>{s}</ShimmerText>);

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <p className={styles.kicker}>
          <SectionKicker>{kicker}</SectionKicker>
        </p>
        <h1 className={styles.heroTitle}>{titleNode}</h1>
        <p className={styles.heroLead}>{lead}</p>
      </div>
    </section>
  );
}
