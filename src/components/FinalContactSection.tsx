import type { Image as SanityImage } from "sanity";
import Image from "next/image";
import { ContactForm } from "./ContactForm";
import { RevealOnScroll } from "./RevealOnScroll";
import { urlFor } from "@/sanity/image";
import type { Locale } from "@/sanity/paths";
import styles from "./FinalContactSection.module.scss";
import sharedStyles from "./sharedSections.module.scss";

// REVISION 4 — "fix the broken split": REVISION 3 put the kicker/heading/
// lead/badge onto the photo's own scrim, absolutely positioned; at some
// viewports it escaped the container and sat illegibly over the image
// (owner-reported bug). This revision moves that block OFF the photo
// entirely — it's now row 1, plain in-flow content sharing the exact same
// mixins.container every other section's kicker uses (Sedi's included),
// so its left edge is flush with the rest of the page by construction,
// not by a tuned offset. Row 2 is a clean two-column grid: photo left
// (no text, no scrim, its normal tonal treatment — same technique as
// ConcernsSection's own contained photo), form right. The "Trovami su
// Google" link moves to the section's own bottom, back to a single
// flow-positioned instance.
//
// REVISION 5 — restores a full-bleed-left photo for row 2 (desktop only,
// >=1024px): the photo now bleeds to the true viewport edge and dissolves
// into the pine band via a right-side gradient (.finalContactPhotoDissolve,
// new this pass), instead of sitting as a contained rounded card. Row 1
// (the heading block) is untouched — it stays a plain contained row above,
// never overlapping the photo, which only starts where row 2 begins. Row
// 2's own CSS switches from a two-column grid-with-a-card to a full-bleed
// host at lg+ (see FinalContactSection.module.scss's own comment on
// .finalContactGridWrap for the scrollbar-safe bleed math); mobile/tablet
// (<1024px) keep REVISION 4's exact contained-card stack, unchanged.
//
// ART-DIRECTION FLAG (honesty rule): spec calls for "Giuseppe in the
// studio environment, NOT looking at the camera — a presence, not a
// salesman." No purpose-shot exists yet; 11.webp (Giuseppe listening
// attentively to a client, not looking at camera) is the closest existing
// asset and stands in here. Flagged in the final report.
//
// Spec 2.8 (carried over from the previous version of this section):
// copyright still does not exist anywhere in the real Footer.tsx, despite
// design-direction.md §11 requiring one — a pre-existing gap, not
// introduced or fixed by this pass, out of scope beyond flagging it again.
// Contact form pass: ctaLabel was dropped — the button it drove is
// replaced by ContactForm below, whose submit label ("Invia il
// messaggio") is hardcoded per that pass's own spec, not CMS-sourced.
// HONESTY-RULE FLAG: homePage.finalCta.ctaLabel (Sanity schema field) is
// now orphaned — nothing reads it anymore. Left in the schema rather
// than removed (a schema cleanup is a separate, unrequested change);
// flagged here and in this pass's own report for a follow-up pass.
// Declutter pass — HONESTY-RULE FLAG: privacyNote is no longer rendered
// anywhere in this section (its content — "your data is treated
// confidentially" — is superseded by the consent checkbox's own privacy
// link, and the spec's own "consolidate to ONE quiet line" instruction
// explicitly drops it). homePage.finalCta.privacyNote (Sanity schema
// field) is now orphaned — nothing reads it. Left in the schema rather
// than removed (a schema cleanup is a separate, unrequested change);
// flagged here and in this pass's own report for a follow-up pass, same
// treatment as ctaLabel's own orphaning two passes ago.
export function FinalContactSection({
  kicker,
  heading,
  body,
  responseNote,
  googleProfileLabel,
  googleProfileUrl,
  photo,
  locale,
}: {
  kicker: string;
  heading: string;
  body: string;
  responseNote: string;
  googleProfileLabel: string;
  googleProfileUrl?: string;
  photo?: SanityImage;
  locale: string;
}) {
  const typedLocale = locale as Locale;
  const photoSrc = photo ? urlFor(photo).url() : "/design-lab/11.webp";

  return (
    <div className={styles.finalContactBand} data-lab-section="final-contact">
      <div className={styles.finalContactHeaderRow}>
        <RevealOnScroll>
          <div className={styles.finalContactHeader}>
            <p className={styles.finalContactKicker}>
              <span className={styles.finalContactKickerRule} aria-hidden="true" />
              {kicker}
            </p>
            <h2 className={styles.finalContactHeading}>{heading}</h2>
            <p className={styles.finalContactBody}>{body}</p>
          </div>
        </RevealOnScroll>
      </div>
      <div className={styles.finalContactGridWrap}>
        <div className={styles.finalContactPhotoZone}>
          <Image
            src={photoSrc}
            alt=""
            fill
            // REVISION 5: photo bleeds to 57vw at lg+ (was a 45vw-wide
            // contained card) — matches .finalContactPhotoZone's own
            // width at that breakpoint.
            sizes="(min-width: 64rem) 57vw, 100vw"
            className={`${styles.finalContactPhotoImg} ${sharedStyles.heroOverlapPhotoTreated}`}
          />
          <div className={styles.finalContactPhotoDissolve} aria-hidden="true" />
        </div>
        <div className={styles.finalContactContent}>
          <RevealOnScroll>
            <div>
              <ContactForm locale={typedLocale} responseNote={responseNote} />
              {/* Global restyle pass: replaces the removed availability
                  indicator — a static, deontology-safe reassurance line
                  (not a specific appointment-time promise unless Giuseppe
                  confirms he can always honor one), not CMS-sourced. */}
              <p className={styles.finalContactReassurance}>Rispondo entro 24 ore.</p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
      <div className={styles.finalContactGoogleRow}>
        <a
          href={googleProfileUrl ?? "#"}
          target={googleProfileUrl ? "_blank" : undefined}
          rel="noopener noreferrer"
          className={styles.finalContactGoogle}
        >
          {googleProfileLabel}
        </a>
      </div>
    </div>
  );
}
