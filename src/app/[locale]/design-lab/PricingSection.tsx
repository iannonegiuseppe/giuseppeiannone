import { PriceLine } from "./PriceLine";
import styles from "./design-lab.module.scss";

// Facts, not an offer, per docs/design-direction.md §9 — no plan columns,
// "most popular" badges, crossed-out prices, feature checklists,
// packages/bundles, discount/promo wording, urgency wording, or "%".
// Placeholder amounts are [segnaposto] pending the client's written
// confirmation of real figures.
const priceLines = [
  { label: "Colloquio individuale", price: "€ [segnaposto]", unit: "/ 50 min" },
  { label: "Seduta online", price: "€ [segnaposto]", unit: "/ 50 min" },
];

// Single-block refinement pass: replaces the old single-column band with
// a two-zone layout (left: kicker/heading/paragraph/button; right: price
// lines or, when showPrices is false, a single sentence — the pricing
// detail itself is an open client decision, not something this pass
// settles). See design-lab.module.scss's .pricingBand comment for how the
// button's desktop-vs-mobile position is handled without two DOM
// structures.
export function PricingSection({
  kicker,
  heading,
  body,
  buttonLabel,
  showPrices,
}: {
  kicker: string;
  heading: string;
  body: string;
  buttonLabel: string;
  showPrices: boolean;
}) {
  return (
    <section className={styles.pricingBand} data-lab-section="pricing">
      <div className={styles.pricingLayout}>
        <div className={styles.pricingIntro}>
          <p className={styles.pricingKicker}>
            <span className={styles.pricingKickerRule} aria-hidden="true" />
            {kicker}
          </p>
          <h2 className={styles.pricingHeading}>{heading}</h2>
          <p className={styles.pricingBody}>{body}</p>
        </div>

        <div className={styles.pricingPriceGroup}>
          {showPrices ? (
            <>
              <ul className={styles.priceList}>
                {priceLines.map((line) => (
                  <PriceLine key={line.label} label={line.label} price={line.price} unit={line.unit} />
                ))}
              </ul>
              <p className={styles.pricingFootnote}>
                Ricevuta sanitaria per ogni seduta. [segnaposto — dettagli sulla pagina prezzi]
              </p>
            </>
          ) : (
            <p className={styles.pricingNoPricesSentence}>
              Il costo viene comunicato con chiarezza al primo contatto, prima di qualsiasi impegno.
            </p>
          )}
        </div>

        <a href="#" className={`${styles.btnSecondary} ${styles.pricingButton}`}>
          {buttonLabel}
        </a>
      </div>
    </section>
  );
}
