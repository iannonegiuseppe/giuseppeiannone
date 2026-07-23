import { HeroCta } from "./HeroCta";
import styles from "./CtaBridgeSection.module.scss";

// Same substring-match emphasis technique as HopeSection.tsx's own
// renderEmphasis / HeroOverlap.tsx's own renderHeadline / RecognitionSection.tsx's
// own renderEmphasis (duplicated rather than shared, per this codebase's
// established convention for small single-purpose helpers).
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

// CTA bridge — a quiet mid-page invitation between Aree and Diplomi for
// visitors who recognized themselves in the areas list. A link to the
// EXISTING contact section (#contatto, same anchor HeroOverlap.tsx's own
// CTA already targets on both locales — not a locale-conditional id, see
// this pass's own report), never a second form/channel picker.
export function CtaBridgeSection({
  title,
  titleEmphasis,
  body,
  linkLabel,
}: {
  title: string;
  titleEmphasis?: string;
  body: string;
  linkLabel: string;
}) {
  if (!title || !linkLabel) return null;

  return (
    <section className={styles.bridge} data-lab-section="cta-bridge" aria-labelledby="cta-bridge-title">
      <h2 id="cta-bridge-title" className={styles.bridgeTitle}>
        {renderEmphasis(title, titleEmphasis, styles.bridgeEmphasis!)}
      </h2>
      {body ? <p className={styles.bridgeBody}>{body}</p> : null}
      <HeroCta href="#contatto" className={styles.bridgeLink!}>
        {linkLabel}
        <span aria-hidden="true">→</span>
      </HeroCta>
    </section>
  );
}
