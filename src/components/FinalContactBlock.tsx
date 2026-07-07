import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { contactPath, privacyPath, type Locale } from "@/sanity/paths";
import styles from "./FinalContactBlock.module.scss";

// The homepage's closing moment — deliberately NOT a form. The actual
// contact form (fields, required GDPR consent checkbox, server action,
// honeypot) is its own later step; this is a closing CTA plus a privacy
// reassurance note, since there's no submit action here to attach a
// consent checkbox to. ctaLabel reuses the hero's exact CTA text (a
// bookend echo of the page's opening action) rather than a new string.
export function FinalContactBlock({
  locale,
  heading,
  body,
  ctaLabel,
  privacyNoteBody,
  privacyNoteLinkLabel,
}: {
  locale: Locale;
  heading?: string;
  body?: string;
  ctaLabel: string;
  privacyNoteBody: string;
  privacyNoteLinkLabel: string;
}) {
  if (!heading) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      {body ? <p className={styles.body}>{body}</p> : null}
      <ButtonLink
        href={contactPath(locale)}
        variant="solid"
        className={styles.cta}
      >
        {ctaLabel}
      </ButtonLink>
      <p className={styles.privacyNote}>
        {privacyNoteBody}{" "}
        <Link href={privacyPath(locale)} className={styles.privacyLink}>
          {privacyNoteLinkLabel}
        </Link>
      </p>
    </section>
  );
}
