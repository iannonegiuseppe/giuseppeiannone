import { TimelineDesktop, TimelineMobileStack, type TimelineStep } from "./Timeline";
import styles from "./PercorsoSection.module.scss";

interface PercorsoStep {
  title: string;
  text: string;
}

// Single-block ADD. Desktop/tablet: zigzag timeline with a scroll-driven
// progress fill (Timeline.tsx). Mobile: a completely different DOM — a
// sticky card stack, per spec ("axis and nodes are NOT rendered on
// mobile"). Both variants always render; CSS shows/hides the right one
// per breakpoint (see sectionsShared.module.scss's file-level comment on
// .percorsoSection for why both stay mounted rather than conditionally
// rendered).
//
// CMS-wiring pass: steps come from homePage.percorso.steps — each step's
// numeral (01-04) is computed from its array position, not stored data.
export function PercorsoSection({
  kicker,
  heading,
  paragraph,
  steps: rawSteps,
}: {
  kicker: string;
  heading: string;
  paragraph: string;
  steps?: PercorsoStep[];
}) {
  const steps: TimelineStep[] = (rawSteps ?? []).map((step, index) => ({
    numeral: String(index + 1).padStart(2, "0"),
    title: step.title,
    text: step.text,
  }));

  return (
    <section className={styles.percorsoSection} data-lab-section="percorso">
      <div className={styles.percorsoHeader}>
        <p className={styles.percorsoKicker}>
          <span className={styles.percorsoKickerRule} aria-hidden="true" />
          {kicker}
          <span className={styles.percorsoKickerRule} aria-hidden="true" />
        </p>
        <h2 className={styles.percorsoHeading}>{heading}</h2>
        <p className={styles.percorsoParagraph}>{paragraph}</p>
      </div>
      <TimelineDesktop steps={steps} />
      <TimelineMobileStack steps={steps} />
    </section>
  );
}
