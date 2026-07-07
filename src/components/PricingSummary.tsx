import { ButtonLink } from "@/components/Button";
import { pricePath, type Locale } from "@/sanity/paths";
import styles from "./PricingSummary.module.scss";

// Deliberately quiet: an outline button, no accent-soft background — the
// homepage already has one colored CTA band ("not sure where you fit");
// repeating that treatment here would read as one more banner rather than
// a calm, secondary pointer to the full pricing page.
export function PricingSummary({
  locale,
  heading,
  body,
  buttonLabel,
}: {
  locale: Locale;
  heading?: string;
  body?: string;
  buttonLabel?: string;
}) {
  if (!heading || !buttonLabel) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      {body ? <p className={styles.body}>{body}</p> : null}
      <ButtonLink href={pricePath(locale)} variant="outline">
        {buttonLabel}
      </ButtonLink>
    </section>
  );
}
