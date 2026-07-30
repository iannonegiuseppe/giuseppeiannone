import NextImage from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import type { Locale } from "@/sanity/paths";
import densityStyles from "./density.module.scss";
import styles from "./contactBlock.module.scss";

// Cyprus rebuild, item 16, since re-toned by the tonal-scale pass:
// tone-deep, unconditionally (no more light/dark variant split — see
// that pass's own report for why the split was retired). Uses
// .toneDeepSection/.toneDeepGrain/.toneDeepContent (density.module.scss),
// NOT the plain .richDarkWrap Hope/Footer use: this component's own
// kicker/heading/body/caption read the GENERIC --color-accent/-text/
// -muted tokens directly (unlike Hope/Footer, which hardcode --color-bg
// internally) — richDarkWrap alone never reassigns those, only
// --color-accent for its own background, which meant .contactKicker's
// `color: var(--color-accent)` was silently invalid (a gradient assigned
// to `color`) even before this pass. Real, pre-existing bug, found while
// auditing this file for the same class of issue this pass's own brief
// asked about — fixed here as part of the same token migration.
export function ContactBlock({
  kicker,
  heading,
  body,
  googleProfileLabel,
  googleProfileUrl,
  locale,
  photoUrl,
  photoAlt,
}: {
  kicker: string;
  heading: string;
  body: string;
  googleProfileLabel: string;
  googleProfileUrl?: string;
  locale: string;
  photoUrl: string;
  photoAlt: string;
}) {
  const content = (
    <div className={styles.contactInner}>
      <RevealOnScroll className={styles.contactGrid}>
        <div className={styles.contactTextCol}>
          <p className={styles.contactKicker}>{kicker}</p>
          <h2 className={styles.contactHeading}>{heading}</h2>
          <p className={styles.contactBody}>{body}</p>
          <div className={styles.contactForm}>
            <ContactForm locale={locale as Locale} />
          </div>
          <p className={styles.contactReassurance}>Rispondo entro 24 ore.</p>
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
          <p className={styles.contactPhotoCaption}>Dr. Giuseppe Iannone — Psicoterapeuta</p>
        </div>
      </RevealOnScroll>
    </div>
  );

  return (
    <div id="contatto" className={densityStyles.toneDeepSection}>
      <div className={densityStyles.toneDeepGrain} aria-hidden="true" />
      <div className={densityStyles.toneDeepContent}>{content}</div>
    </div>
  );
}
