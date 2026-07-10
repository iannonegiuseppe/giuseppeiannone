import { FaqAccordion } from "./FaqAccordion";
import { buildFaqPageJsonLd } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { faqPath } from "@/sanity/paths";
import styles from "./FaqSection.module.scss";

// Single-block pass (v2): rebuilds v1's always-open 2x2 grid into a
// sticky header column + hairline-row accordion — light ivory interlude
// between the pine CTA band and the pine footer. All four answers stay
// mounted in the DOM at all times regardless of open/closed state (both
// for the reader and for AEO: answer engines read rendered text, not
// content hidden behind a toggle) — see FaqAccordion.tsx for the
// exclusive-open behavior and the CSS grid-rows animation technique.
// Placeholder copy, client finalizes.
//
// Facts/process only, per docs/design-direction.md §9 — no "superare",
// "guarire", "risolvere", "risultati", "garantito", "gratuito", "%", or
// urgency wording anywhere in this array.
const faqPairs = [
  {
    question: "Come funziona il primo colloquio?",
    answer:
      "È un incontro per conoscersi e capire la richiesta, senza impegno di proseguire. [segnaposto]",
  },
  {
    question: "Quanto dura una seduta?",
    answer: "Una seduta dura in genere 50 minuti. [segnaposto]",
  },
  {
    question: "Ricevi anche online?",
    answer:
      "Sì: le sedute possono svolgersi in studio, a Milano o Monza, oppure online. [segnaposto]",
  },
  {
    question: "Quanto può durare un percorso?",
    answer:
      "Dipende dalla persona e dalla richiesta: se ne parla apertamente, e la direzione si verifica insieme lungo il percorso. [segnaposto]",
  },
] as const;

// Single source for both the visible copy above and the JSON-LD below —
// the two can never drift, since the JSON-LD is generated FROM this same
// array, not maintained as a separate parallel list.
const faqPageJsonLd = buildFaqPageJsonLd(
  faqPairs.map((pair) => ({ question: pair.question, answerText: pair.answer })),
);

export function FaqSection({
  kicker,
  heading,
  linkLabel,
  locale,
}: {
  kicker: string;
  heading: string;
  linkLabel: string;
  locale: string;
}) {
  // Same locale-narrowing convention as [pillarSlug]/page.tsx (typedLocale)
  // — paths.ts's Locale union is "it" | "en", params.locale is a plain
  // string at the route boundary.
  const typedLocale = locale as "it" | "en";

  const href = faqPath(typedLocale);

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
