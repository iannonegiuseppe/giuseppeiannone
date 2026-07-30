import NextImage from "next/image";
import { AnimatedDivider } from "@/components/AnimatedDivider";
import { ContactFormLab } from "./ContactFormLab";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import type { Locale } from "@/sanity/paths";
import styles from "./contactBlock.module.scss";

// Light-surface pass — reversed off tone-deep (dark) onto tone.light-
// island-surface (.contactLightWrap, contactBlock.module.scss), the last
// dark section on the page per this pass's own brief. ContactForm itself
// (validation, GDPR consent, submit mechanics) is now ContactFormLab, a
// fork — the real, shared ContactForm.tsx feeds production's
// FinalContactSection too, and this pass's field-model change (email
// always required, telefono local-state-only — see ContactFormLab.tsx's
// own top comment) can't leak there. contactLab (Sanity) is this block's
// own independent kicker/heading/caption field group, separate from the
// shared finalCta above it in the schema; googleProfileLabel is the one
// exception, still read from finalCta since this pass never touched that
// field or its copy.
//
// No border at either the Spazi->Contact or Contact->"Lo spazio" junction
// (explicit correction this pass — every other tonal change on this page
// is a flat, undivided cut; a rule here would be the odd one out, and was
// also the leading suspect for an earlier, since-fixed dark-seam artefact
// elsewhere on this page).
export function ContactBlock({
  kicker,
  heading,
  headingEmphasisWord,
  photoCaption,
  googleProfileLabel,
  googleProfileUrl,
  locale,
  photoUrl,
  photoAlt,
}: {
  kicker: string;
  heading: string;
  headingEmphasisWord?: string;
  photoCaption: string;
  googleProfileLabel: string;
  googleProfileUrl?: string;
  locale: string;
  photoUrl: string;
  photoAlt: string;
}) {
  const emphasisIndex = headingEmphasisWord ? heading.indexOf(headingEmphasisWord) : -1;
  const headingNode =
    headingEmphasisWord && emphasisIndex !== -1 ? (
      <>
        {heading.slice(0, emphasisIndex)}
        <em className={styles.contactHeadingAccent}>{headingEmphasisWord}</em>
        {heading.slice(emphasisIndex + headingEmphasisWord.length)}
      </>
    ) : (
      heading
    );

  const replyLine = locale === "en" ? "I reply within 24 hours." : "Rispondo entro 24 ore.";

  return (
    <div id="contatto" className={styles.contactLightWrap}>
      <div className={styles.contactInner}>
        <RevealOnScroll className={styles.contactGrid}>
          {/* Columns swap pass: photo now first in the DOM (left column at
              lg+, matching the reference), form second — see
              contactBlock.module.scss's own comment on why this doesn't
              create a Tab-order mismatch at either breakpoint. */}
          <div className={styles.contactPhotoCol}>
            <div className={styles.contactPhotoFrame}>
              <NextImage
                src={photoUrl}
                alt={photoAlt}
                fill
                sizes="(min-width: 64rem) 35vw, 100vw"
                className={styles.contactPhotoImg}
              />
            </div>
            <p className={styles.contactPhotoCaption}>{photoCaption}</p>
          </div>
          <div className={styles.contactTextCol}>
            {/* Correction pass: was bare text — every other kicker on this
                page (Diplomi/Sedi/Spazi/Pricing/Chi sono) precedes its
                label with the small .kickerRule dash; this one was missing
                it. Reused verbatim (same geometry AND same var(--color-
                line) treatment those instances actually use — see
                contactBlock.module.scss's own comment), not the accent/
                40%-alpha treatment this block's own full-width rule uses
                below the heading — that's a different, already-justified
                exception for that ONE rule, not the norm for kicker
                dashes. */}
            <p className={styles.contactKicker}>
              <span className={styles.contactKickerRule} aria-hidden="true" />
              {kicker}
            </p>
            <h2 className={styles.contactHeading} style={{ fontWeight: 400, fontSynthesis: "none" }}>
              {headingNode}
            </h2>
            {/* Correction pass: was a plain static <span> — now the
                project's own real animated rule component (src/components/
                AnimatedDivider.tsx, .divider class), reused rather than
                rebuilt. It already handles prefers-reduced-motion itself
                (skips attaching its observer, and its own CSS forces
                display:none on the sweep) — nothing extra needed here. */}
            <AnimatedDivider className={styles.contactRule} />
            <div className={styles.contactForm}>
              <ContactFormLab locale={locale as Locale} replyLine={replyLine} />
            </div>
            {googleProfileUrl ? (
              <a
                href={googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactGoogle}
              >
                {googleProfileLabel}
              </a>
            ) : null}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
