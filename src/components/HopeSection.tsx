import { HopeReveal } from "./HopeReveal";
import styles from "./HopeSection.module.scss";

// Full-bleed accent-band pass: the pivot of the patient-centered arc —
// Recognition ("this is what you feel," many fragments, dense) turns here
// into "it can change" (one thing, still, air around it), before Percorso
// explains how. The composition carries that meaning by CONTRAST with
// Recognition's own scattered constellation: deliberately the opposite,
// not a second scattered thing. It's also the page's first tonal shift —
// hero/recognition/everything after runs light — so the band gets hard
// edges top and bottom (no gradient dissolve here; that technique is the
// hero's own and stays exactly there, an abrupt register change is the
// point in THIS section). Eyebrow + one heading line, nothing else — a
// body paragraph, button, or image would kill the exhale this section
// exists to create; if a future request wants one, it belongs in the
// section after this, not here.
//
// Same substring-match emphasis technique as HeroOverlap.tsx's own
// renderHeadline / RecognitionSection.tsx's own renderEmphasis
// (duplicated rather than shared, per this codebase's established
// convention for small single-purpose helpers).
function renderEmphasis(text: string, emphasisWord: string | undefined, emphasisClassName: string) {
  if (!emphasisWord) return text;
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <em className={emphasisClassName}>{emphasisWord}</em>
      {after}
    </>
  );
}

export function HopeSection({
  eyebrow,
  heading,
  headingEmphasisWord,
}: {
  eyebrow: string;
  heading: string;
  // Must match one word/phrase inside `heading` exactly — same optional,
  // case-sensitive, first-occurrence-only contract as
  // homePage.hero.headlineEmphasisWord and .recognition.fragments'
  // emphasisWord.
  headingEmphasisWord?: string;
}) {
  return (
    <section className={styles.hopeSection} data-lab-section="hope" aria-labelledby="hope-heading">
      <HopeReveal>
        <p className={styles.hopeEyebrow}>{eyebrow}</p>
        <h2 id="hope-heading" className={styles.hopeHeading}>
          {renderEmphasis(heading, headingEmphasisWord, styles.hopeEmphasis!)}
        </h2>
      </HopeReveal>
    </section>
  );
}
