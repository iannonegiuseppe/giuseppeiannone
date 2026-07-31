"use client";

import { useRef } from "react";
import { Button } from "@/components/Button";
import { ContactFormDialog, type ContactFormDialogHandle } from "@/components/ContactFormDialog";
import type { Locale } from "@/sanity/paths";
import styles from "./ctaBridgeBlock.module.scss";

// Item 7: standalone reproduction of the real CtaBridgeSection — same
// reasoning as every other "real component needs a different register on
// this page" case (Metodo, Chi sono, Video). Same copy, same real data.
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

// Light-island + real-button pass: was tone-deep (rich-dark-surface's own
// vignette), read as washed-out grey-green sitting directly below
// Pricing's own tone-mid — two dark sections in a row. Converted to a
// light island, the SAME mechanism as Hope/Credentials/Metodo
// (tone.light-island-surface via the new .ctaBridgeLightWrap — see
// density.module.scss's own comment on why this needed a new class
// rather than mutating .toneDeepSection, which Video/Contact still use).
//
// "use client" + a real Button + ContactFormDialog: the old underlined
// <a href="#contatto"> is replaced by the shared Button component
// (variant="primary" — .glass was built for Hero's video background,
// its own CSS hardcodes color: var(--tone-deep-text) rather than
// following the generic, correctly-hijacked cascade every other
// component here relies on, so it would render the WRONG text color on
// a light island; .primary already reads --color-accent/-accent-contrast
// generically, exactly what light-island-surface hijacks — see this
// pass's own report for the live contrast check). tone="base": this
// surface doesn't repurpose --color-accent for a background gradient the
// way tone-deep did, so the button needs no tone-deep-style override,
// same as every other component reading the tonal system's own
// cascading tokens "for free" (Button.tsx's own comment).
//
// The dialog: a THIRD independent <ContactFormDialog> instance, not a
// shared ref across three unrelated trigger points — this is the
// established pattern already documented twice (WelcomeBlock's own, then
// HeroVideoActions' own "second, independent instance" comment) for
// reusing this exact mechanism without rebuilding it.
export function CtaBridgeBlock({
  title,
  titleEmphasis,
  body,
  linkLabel,
  locale,
  closeLabel,
}: {
  title: string;
  titleEmphasis?: string;
  body: string;
  linkLabel: string;
  locale: Locale;
  closeLabel: string;
}) {
  const contactDialogRef = useRef<ContactFormDialogHandle>(null);

  if (!title || !linkLabel) return null;

  return (
    <section className={styles.ctaBridgeLightWrap} aria-labelledby="cta-bridge-block-title">
      <div className={styles.section}>
        <div className={styles.layout}>
          <div className={styles.headingColumn}>
            <h2 id="cta-bridge-block-title" className={styles.heading}>
              {renderEmphasis(title, titleEmphasis, styles.emphasis!)}
            </h2>
          </div>
          <div className={styles.contentColumn}>
            {body ? <p className={styles.body}>{body}</p> : null}
            <Button
              type="button"
              variant="primary"
              tone="base"
              className={styles.ctaButton}
              onClick={() => contactDialogRef.current?.open()}
            >
              {linkLabel}
            </Button>
          </div>
        </div>
      </div>
      <ContactFormDialog ref={contactDialogRef} locale={locale} closeLabel={closeLabel} />
    </section>
  );
}
