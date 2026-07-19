import styles from "./PreviewPlaceholder.module.scss";

// PREVIEW-GATE (temporary): calm "in arrivo" content for any nav
// destination that doesn't have real content yet — used both as a
// homepage-anchor section (via PreviewPlaceholderSection.tsx) and as the
// entire body of a standalone placeholder route page (prezzi/pricing,
// faq, contatti/contact). See page.tsx's own PREVIEW-GATE comment block
// for the full list of what's gated and exactly how to reverse it.
//
// Deliberately minimal, matching the task's own tone requirement: no
// badge, no spinner, no yellow, no emoji, no urgency/outcome language
// (the deontology check that governs real Sanity-sourced copy doesn't
// apply to this hardcoded UI chrome, but the same spirit does — this is
// a psychotherapist's site read by anxious people, being reviewed by the
// client).
export function PreviewPlaceholder({ locale }: { locale: string }) {
  const isEn = locale === "en";
  return (
    <div className={styles.previewPlaceholder}>
      <p className={styles.previewPlaceholderPrimary}>
        {isEn ? "This section will be available soon." : "Questa sezione sarà presto disponibile."}
      </p>
      <p className={styles.previewPlaceholderSecondary}>
        {isEn ? "I'm finishing this part of the site." : "Sto completando questa parte del sito."}
      </p>
    </div>
  );
}
