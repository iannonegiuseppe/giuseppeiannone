import { JourneyInteractive } from "./JourneyInteractive";
import styles from "./JourneySection.module.scss";

interface JourneyStepDoc {
  title: string;
  shortLine: string;
  expandedText: string;
}

// Un-gate + interactive rebuild — supersedes the earlier static
// staircase pass (offsets dropped entirely) and, before that, the old
// scroll-driven zigzag timeline (Timeline.tsx). See JourneyInteractive.tsx
// for the hover/click/keyboard-activated left column + always-filled
// right panel this section now renders.
//
// Same substring-match emphasis technique as HeroOverlap.tsx's own
// renderHeadline / RecognitionSection.tsx's own renderEmphasis /
// HopeSection.tsx's own renderEmphasis (duplicated rather than shared,
// per this codebase's established convention for small single-purpose
// helpers).
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

export function JourneySection({
  kicker,
  heading,
  headingEmphasisWord,
  paragraph,
  steps: rawSteps,
}: {
  kicker: string;
  heading: string;
  headingEmphasisWord?: string;
  paragraph?: string;
  steps?: JourneyStepDoc[];
}) {
  const steps = rawSteps ?? [];

  return (
    <section className={styles.journeySection} data-lab-section="journey" id="metodo">
      <div className={styles.journeyHeader}>
        <p className={styles.journeyKicker}>
          <span className={styles.journeyKickerRule} aria-hidden="true" />
          {kicker}
        </p>
        <h2 className={styles.journeyHeading}>
          {renderEmphasis(heading, headingEmphasisWord, styles.journeyEmphasis!)}
        </h2>
        {paragraph ? <p className={styles.journeyParagraph}>{paragraph}</p> : null}
      </div>

      <JourneyInteractive steps={steps} />
    </section>
  );
}
