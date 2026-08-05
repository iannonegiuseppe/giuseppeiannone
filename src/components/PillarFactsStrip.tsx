import { FiClock, FiGlobe, FiMapPin, FiMonitor } from "react-icons/fi";
import type { IconType } from "react-icons";
import styles from "./PillarFactsStrip.module.scss";

export interface FactsStripData {
  items?: { label: string; value: string }[];
}

// Refinement pass, item 4/5 — icon per item, positional (index 0-3), not
// content-matched: the schema's own field description already fixes this
// to exactly the 4 concepts below in order (session length, modality,
// languages, location — see pillarPage.ts and the schema's own min(3)/
// max(4) validation), so there's no per-item "icon type" to store and no
// schema change needed. An item beyond index 3 (shouldn't happen given
// max(4), but defensive) simply renders with no icon rather than guessing.
//
// Each icon is chosen to carry information, not decorate (§10.7):
// - clock: a session's own length is literally a duration — no more
//   direct a symbol exists for "how long."
// - monitor: modality's real distinction here is in-person vs. online;
//   "online" is the less-assumed case, so the icon marks that
//   possibility rather than a generic "location" glyph that would just
//   restate the pin below it.
// - globe: languages spoken — a globe reads as "which language(s) reach
//   which places," clearer at a glance than a speech-bubble (which reads
//   as "chat/comment" in most UI vocabulary, not "language").
// - map pin: physical location, the standard, unambiguous symbol for it.
//
// All four are Feather-set outline icons (react-icons/fi) — thin,
// uniform 2px-equivalent stroke, no fill — matching the site's existing
// thin-line device vocabulary (hairlines, kicker rules) rather than
// introducing a heavier icon style.
const FACT_ICONS: IconType[] = [FiClock, FiMonitor, FiGlobe, FiMapPin];

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
        {items.map((item, index) => {
          const Icon = FACT_ICONS[index];
          return (
            <div className={styles.fact} key={`${item.label}-${index}`}>
              {Icon ? <Icon className={styles.factIcon} aria-hidden="true" /> : null}
              <div className={styles.factText}>
                <dt className={styles.factLabel}>{item.label}</dt>
                <dd className={styles.factValue}>{item.value}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
