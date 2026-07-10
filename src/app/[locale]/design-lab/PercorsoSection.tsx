import { TimelineDesktop, TimelineMobileStack, type TimelineStep } from "./Timeline";
import styles from "./design-lab.module.scss";

// Facts/process only, per docs/design-direction.md §9 — no
// "superare"/"guarire"/"risolvere"/"risultati garantiti"/"%"/urgency
// wording ("subito", "non aspettare") anywhere in this section. Steps
// describe the PROCESS, never outcomes.
const steps: TimelineStep[] = [
  {
    numeral: "01",
    title: "Primo colloquio",
    text: "Un incontro per conoscersi e capire la richiesta. 50 minuti, senza impegno di proseguire.",
  },
  {
    numeral: "02",
    title: "Capire insieme",
    text: "Qualche incontro per mettere a fuoco cosa succede e definire una direzione condivisa.",
  },
  {
    numeral: "03",
    title: "Il percorso",
    text: "Incontri regolari, con strumenti cognitivo-comportamentali adattati alla persona.",
  },
  {
    numeral: "04",
    title: "Verifiche lungo la strada",
    text: "Momenti per fare il punto: cosa sta funzionando, cosa adattare.",
  },
];

// Single-block ADD. Desktop/tablet: zigzag timeline with a scroll-driven
// progress fill (Timeline.tsx). Mobile: a completely different DOM — a
// sticky card stack, per spec ("axis and nodes are NOT rendered on
// mobile"). Both variants always render; CSS shows/hides the right one
// per breakpoint (see design-lab.module.scss's file-level comment on
// .percorsoSection for why both stay mounted rather than conditionally
// rendered).
export function PercorsoSection({
  kicker,
  heading,
  paragraph,
}: {
  kicker: string;
  heading: string;
  paragraph: string;
}) {
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
