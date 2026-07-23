import { ContactForm } from "./ContactForm";
import { RevealOnScroll } from "./RevealOnScroll";
import type { Locale } from "@/sanity/paths";
import styles from "./FinalContactSection.module.scss";

// VARIANT B — slim inset accent band. Replaces the REVISION 5 full-bleed-
// photo layout entirely: no photo, no left/right split, no dissolve
// gradient — a single contained, rounded band (mixins.container's own
// gutters, not full-bleed like Hope/Formazione/FAQ) with everything
// centered in one narrow (~35rem/560px) column. Deliberately reads as a
// DIFFERENT device than Hope's full-bleed band, per this pass's own
// explicit instruction — Hope is untouched.
//
// ART-DIRECTION FLAG (carried over, now moot): the REVISION 5 photo
// (11.webp, a stand-in for a real purpose-shot) is dropped by this pass,
// not replaced — the asset itself is untouched in the repo/CMS.
// homePage.finalCta.photo (Sanity schema field) is now orphaned — nothing
// reads it. Left in the schema rather than removed (a schema cleanup is a
// separate, unrequested change), same "flag, don't delete" precedent this
// file already has for ctaLabel/privacyNote (see below) and
// diploma/qualification elsewhere in this codebase.
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
//
// VARIANT B pass — HONESTY-RULE FLAG: responseNote joins ctaLabel/
// privacyNote as orphaned. It duplicated the form's own hardcoded
// "Rispondo entro 24 ore." reassurance line ("Rispondo di persona, in
// genere entro [segnaposto] giorni.") — spec's explicit "delete the
// duplicate promise, only one line survives" instruction. Same "flag,
// don't delete" treatment as its two siblings above; homePage.finalCta.
// responseNote (Sanity schema field, still populated in the live dataset
// for both locales) is left in place, just no longer read anywhere.
export function FinalContactSection({
  kicker,
  heading,
  body,
  googleProfileLabel,
  googleProfileUrl,
  locale,
}: {
  kicker: string;
  heading: string;
  body: string;
  googleProfileLabel: string;
  googleProfileUrl?: string;
  locale: string;
}) {
  const typedLocale = locale as Locale;

  return (
    <div id="contatto" className={styles.finalContactOuter} data-lab-section="final-contact">
      <div className={styles.finalContactBand}>
        <RevealOnScroll>
          <div className={styles.finalContactColumn}>
            <p className={styles.finalContactKicker}>
              <span className={styles.finalContactKickerRule} aria-hidden="true" />
              {kicker}
              <span className={styles.finalContactKickerRule} aria-hidden="true" />
            </p>
            <h2 className={styles.finalContactHeading}>{heading}</h2>
            <p className={styles.finalContactBody}>{body}</p>
            <ContactForm locale={typedLocale} />
            {/* Global restyle pass: replaces the removed availability
                indicator — a static, deontology-safe reassurance line
                (not a specific appointment-time promise unless Giuseppe
                confirms he can always honor one), not CMS-sourced. The
                ONLY surviving response-time line, per this pass's own
                "delete the duplicate promise" instruction — see this
                file's own top-of-file comment. */}
            <p className={styles.finalContactReassurance}>Rispondo entro 24 ore.</p>
            {/* Renders only when a real profile URL exists — currently
                null for both locales in the live dataset, so nothing
                renders (no href="#" placeholder link), per this pass's
                own explicit instruction. */}
            {googleProfileUrl ? (
              <a
                href={googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.finalContactGoogle}
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
