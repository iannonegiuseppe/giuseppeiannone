import styles from "./PillarFactsStrip.module.scss";

export interface FactsStripData {
  items?: { label: string; value: string }[];
}

// Neutral format facts only (session length, modality, languages,
// location) — the restriction is enforced by the schema's own field
// description (pillarPage.ts), not re-checked here; this component only
// renders whatever it's given.
export function PillarFactsStrip({ factsStrip }: { factsStrip?: FactsStripData }) {
  const items = factsStrip?.items ?? [];
  if (items.length === 0) return null;

  return (
    <div className={styles.factsStrip}>
      <dl className={styles.factsList}>
        {items.map((item, index) => (
          <div className={styles.fact} key={`${item.label}-${index}`}>
            <dt className={styles.factLabel}>{item.label}</dt>
            <dd className={styles.factValue}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
