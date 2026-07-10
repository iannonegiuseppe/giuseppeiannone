import { FormazioneCounters, type FormazioneCounter } from "./FormazioneCounters";
import styles from "./design-lab.module.scss";

// v2: longer "regalie" list. Facts only, per docs/design-direction.md
// §9 — registration, qualification, education, membership. No
// evaluative/promotional wording, no award names, no logos/badges/seals/
// star icons, no client counts or percentages. All placeholders pending
// the client's WRITTEN confirmation, marked [segnaposto] exactly as
// elsewhere in the lab — no real-sounding association/course names
// invented beyond the bracketed slots.
const credentials = [
  "Iscrizione all'Albo degli Psicologi della Lombardia — n. [segnaposto]",
  "Psicologo Psicoterapeuta — indirizzo cognitivo-comportamentale",
  "[segnaposto — società/associazione professionale 1]",
  "[segnaposto — società/associazione professionale 2]",
  "[segnaposto — corso/specializzazione 1]",
  "[segnaposto — corso/specializzazione 2]",
  "[segnaposto — corso/specializzazione 3]",
  "Laurea in Psicologia — [università, segnaposto]",
];

// [valori da confermare per iscritto dal cliente] — plausible dummy
// numerics so the count-up animation is reviewable; forbidden as counter
// subjects per docs/design-direction.md §9: clients, patients, sessions,
// percentages, success/results metrics, reviews — these three are none
// of those (career tenure, training hours, supervision hours).
const counters: FormazioneCounter[] = [
  { value: 10, label: "ANNI DI ESPERIENZA CLINICA" },
  { value: 2500, label: "ORE DI FORMAZIONE" },
  { value: 400, label: "ORE DI SUPERVISIONE CLINICA" },
];

function CredentialList({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      className={hidden ? `${styles.formazioneList} ${styles.formazioneListDuplicate}` : styles.formazioneList}
      aria-hidden={hidden ? "true" : undefined}
    >
      {credentials.map((item) => (
        <li key={item} className={styles.formazioneItem}>
          {item}
          <span className={styles.formazioneSeparator} aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
}

// Pure-CSS marquee (no JS): the track holds the credential list twice,
// looping seamlessly via translateX(0 -> -50%) since both copies are
// identical width. The duplicate is aria-hidden so screen readers see
// exactly one static list, in DOM order — the animation never affects
// reading order. prefers-reduced-motion drops the animation entirely: the
// duplicate is display:none and the single real list renders as a static
// (wrapped, or vertical on mobile) row instead.
export function FormazioneBand({ kicker }: { kicker: string }) {
  return (
    <section className={styles.formazioneSection} data-lab-section="formazione">
      <div className={styles.formazioneBand}>
        <div className={styles.formazioneHeader}>
          <p className={styles.formazioneKicker}>
            <span className={styles.formazioneKickerRule} aria-hidden="true" />
            {kicker}
            <span className={styles.formazioneKickerRule} aria-hidden="true" />
          </p>
        </div>
        <FormazioneCounters counters={counters} />
        <div className={styles.formazioneMarquee}>
          <div className={styles.formazioneTrack}>
            <CredentialList />
            <CredentialList hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
