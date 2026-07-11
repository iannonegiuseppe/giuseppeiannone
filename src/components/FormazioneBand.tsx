import { FormazioneCounters, type FormazioneCounter } from "./FormazioneCounters";
import styles from "./FormazioneBand.module.scss";

function CredentialList({ credentials, hidden }: { credentials: string[]; hidden?: boolean }) {
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
//
// CMS-wiring pass: credentials/counters are now homePage.formazione props
// (facts only, per docs/design-direction.md §9 — the deontology validator
// on the schema's own credentials/counters fields enforces this too).
export function FormazioneBand({
  kicker,
  credentials,
  counters,
}: {
  kicker: string;
  credentials?: string[];
  counters?: FormazioneCounter[];
}) {
  const list = credentials ?? [];
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
        <FormazioneCounters counters={counters ?? []} />
        <div className={styles.formazioneMarquee}>
          <div className={styles.formazioneTrack}>
            <CredentialList credentials={list} />
            <CredentialList credentials={list} hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
