import Image from "next/image";
import { RevealOnScroll } from "./RevealOnScroll";
import styles from "./design-lab.module.scss";

// Single-block refinement pass: replaces the old centered-text-only green
// band with a media-anchored layout — photo bleeds to the LEFT viewport
// edge (same technique as Come funziona/Di cosa mi occupo), content zone
// left-aligned on the right. Photo "sinks into" the pine via the shared
// tonal filter + a 35% pine multiply overlay + an edge melt gradient
// (right edge desktop/tablet, bottom edge mobile — CSS handles the swap).
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
export function FinalContactSection({
  kicker,
  heading,
  body,
  ctaLabel,
  privacyNote,
  responseNote,
  googleProfileLabel,
}: {
  kicker: string;
  heading: string;
  body: string;
  ctaLabel: string;
  privacyNote: string;
  responseNote: string;
  googleProfileLabel: string;
}) {
  return (
    <div className={styles.finalContactBand} data-lab-section="final-contact">
      <div className={styles.finalContactPhotoZone}>
        <Image
          src="/design-lab/11.webp"
          alt=""
          fill
          sizes="(min-width: 48rem) 40vw, 100vw"
          className={`${styles.finalContactPhotoImg} ${styles.heroOverlapPhotoTreated}`}
        />
        <div className={styles.finalContactPhotoOverlay} aria-hidden="true" />
        <div className={styles.finalContactPhotoMelt} aria-hidden="true" />
      </div>
      <div className={styles.finalContactGridWrap}>
        <div className={styles.finalContactContent}>
          <RevealOnScroll>
            <div>
              <p className={styles.finalContactKicker}>
                <span className={styles.finalContactKickerRule} aria-hidden="true" />
                {kicker}
              </p>
              <h2 className={styles.finalContactHeading}>{heading}</h2>
              <p className={styles.finalContactBody}>{body}</p>
              <a href="#" className={`${styles.btnPrimaryInverted} ${styles.finalContactCta}`}>
                {ctaLabel}
              </a>
              <div className={styles.finalContactQuietLines}>
                <p className={styles.finalContactQuietLine}>{privacyNote}</p>
                <p className={styles.finalContactQuietLine}>{responseNote}</p>
              </div>
              {/* Renders only when siteSettings.googleProfileUrl is set on
                  the real site — shown here to demonstrate the treatment. */}
              <a
                href="#"
                rel="noopener noreferrer"
                className={styles.finalContactGoogle}
              >
                {googleProfileLabel}
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}
