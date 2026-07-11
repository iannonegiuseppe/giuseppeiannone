import { FaqAccordion } from "./FaqAccordion";
import { buildFaqPageJsonLd, plainTextFromPortableText } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { faqPath } from "@/sanity/paths";
import styles from "./FaqSection.module.scss";

interface FaqItemDoc {
  _id: string;
  question: string;
  answer: unknown;
}

// Single-block pass (v2): rebuilds v1's always-open 2x2 grid into a
// sticky header column + hairline-row accordion — light ivory interlude
// between the pine CTA band and the pine footer. All four answers stay
// mounted in the DOM at all times regardless of open/closed state (both
// for the reader and for AEO: answer engines read rendered text, not
// content hidden behind a toggle) — see FaqAccordion.tsx for the
// exclusive-open behavior and the CSS grid-rows animation technique.
//
// CMS-wiring pass: items come from homePage.faq.items (4 references to
// the existing faqItem document type — see queries.ts's homePageQuery).
// JSON-LD is built from the SAME items, flattened to plain text via
// plainTextFromPortableText (the same helper pillar/subtopic pages'
// faqBlock JSON-LD already uses), so the visible copy and the structured
// data can never drift.
export function FaqSection({
  kicker,
  heading,
  linkLabel,
  locale,
  items,
}: {
  kicker: string;
  heading: string;
  linkLabel: string;
  locale: string;
  items?: FaqItemDoc[];
}) {
  // Same locale-narrowing convention as [pillarSlug]/page.tsx (typedLocale)
  // — paths.ts's Locale union is "it" | "en", params.locale is a plain
  // string at the route boundary.
  const typedLocale = locale as "it" | "en";

  const href = faqPath(typedLocale);
  const faqPairs = items ?? [];
  const faqPageJsonLd = buildFaqPageJsonLd(
    faqPairs.map((item) => ({
      question: item.question,
      answerText: plainTextFromPortableText(item.answer),
    })),
  );

  return (
    <section className={styles.faqSection} data-lab-section="faq">
      <JsonLdScript data={faqPageJsonLd} />
      <div className={styles.faqContainer}>
        <div className={styles.faqHeaderColumn}>
          <p className={styles.faqKicker}>
            <span className={styles.faqKickerRule} aria-hidden="true" />
            {kicker}
          </p>
          <h2 className={styles.faqHeading}>{heading}</h2>
          {/* Sticks together with the kicker/heading above (see
              .faqHeaderColumn) at desktop; hidden below md, where
              .faqLinkMobile below takes over instead. Same href/label as
              that instance — only visibility differs, by breakpoint. */}
          <a href={href} className={`${styles.faqLink} ${styles.faqLinkDesktop}`}>
            {linkLabel}
            <span className={styles.faqLinkGlyph} aria-hidden="true">
              ⟶
            </span>
          </a>
        </div>
        <div className={styles.faqAccordionColumn}>
          <FaqAccordion pairs={faqPairs} />
        </div>
        <a href={href} className={`${styles.faqLink} ${styles.faqLinkMobile}`}>
          {linkLabel}
          <span className={styles.faqLinkGlyph} aria-hidden="true">
            ⟶
          </span>
        </a>
      </div>
    </section>
  );
}
