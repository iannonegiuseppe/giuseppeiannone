import { getTranslations } from "next-intl/server";
import styles from "./PillarRecognition.module.scss";

export interface RecognitionData {
  items?: string[];
}

// Mirrors the homepage's Recognition block (RecognitionSection.tsx)
// deliberately, in typographic language only — EB Garamond italic quotes,
// an accent hairline to each one's left, same device the site already
// uses for kickers (ContactBlock/FaqSection's own kickerRule) rather than
// a new one (§10.2). Not a reuse of that component itself: its layout is
// a bespoke asymmetric constellation (anchor/dominant/peripheral tiers,
// capped fragment count) built specifically for the homepage's own
// composition, whereas this brief calls for a plain uniform two-per-row
// grid — a different layout, not a parameterization of that one.
//
// The disclaimer line is fixed chrome (messages/*.json), not a Sanity
// field — a deontology-mandated disclaimer is safer fixed than editable.
export async function PillarRecognition({
  locale,
  recognition,
}: {
  locale: string;
  recognition?: RecognitionData;
}) {
  const items = recognition?.items ?? [];
  if (items.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "PillarPage" });

  return (
    <div className={styles.recognition}>
      <ul className={styles.grid}>
        {items.map((item, index) => (
          <li className={styles.item} key={`${item}-${index}`}>
            <p className={styles.quote}>{item}</p>
          </li>
        ))}
      </ul>
      <p className={styles.disclaimer}>{t("recognitionDisclaimer")}</p>
    </div>
  );
}
