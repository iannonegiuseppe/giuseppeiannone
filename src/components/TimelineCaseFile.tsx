import type { TimelineEntryResolved } from "@/components/TimelineEntry";
import { TimelineCaseFileEntry } from "@/components/TimelineCaseFileEntry";
import styles from "./TimelineVariants.module.scss";

const GRADIENTS = [styles.gradA, styles.gradB, styles.gradC];

// Preview variant — "The Case File." Margin tab (place name) stays
// outside the gradient card, like a folder tab sticking out from the
// body it labels; the quote renders as a dashed marginal annotation
// rather than a boxed pull-quote. Per-entry rendering (and its scroll
// reveal) lives in TimelineCaseFileEntry.tsx — this stays a plain
// server component. See TimelineVariants.module.scss's own top comment
// for the shared gradient/contrast system and this section's own
// comment for the motion pass.
export function TimelineCaseFile({ entries, locale = "it" }: { entries: TimelineEntryResolved[]; locale?: "it" | "en" }) {
  const noteTag = locale === "en" ? "Margin note" : "Nota a margine";
  return (
    <ol className={styles.cfList}>
      {entries.map((entry, index) => (
        <TimelineCaseFileEntry key={entry.id} entry={entry} gradient={GRADIENTS[index % GRADIENTS.length] ?? ""} noteTag={noteTag} />
      ))}
    </ol>
  );
}
