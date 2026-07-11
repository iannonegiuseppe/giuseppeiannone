import { PriceLine } from "./PriceLine";
import styles from "./PricingSection.module.scss";
import sharedStyles from "./sharedSections.module.scss";

interface PriceLineData {
  label: string;
  price: string;
  unit: string;
}

// Single-block refinement pass: replaces the old single-column band with
// a two-zone layout (left: kicker/heading/paragraph/button; right: price
// lines or, when showPrices is false, a single sentence — the pricing
// detail itself is an open client decision, not something this pass
// settles). See sectionsShared.module.scss's .pricingBand comment for how the
// button's desktop-vs-mobile position is handled without two DOM
// structures.
//
// CMS-wiring pass: priceLines/footnote/noPricesSentence come from
// homePage.prezzi — the deontology validator on those schema fields
// enforces the "facts, not an offer" rule this file's own comment used to
// carry alone.
export function PricingSection({
  kicker,
  heading,
  body,
  buttonLabel,
  showPrices,
  priceLines,
  footnote,
  noPricesSentence,
}: {
  kicker: string;
  heading: string;
  body: string;
  buttonLabel: string;
  showPrices: boolean;
  priceLines?: PriceLineData[];
  footnote?: string;
  noPricesSentence?: string;
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
                {(priceLines ?? []).map((line) => (
                  <PriceLine key={line.label} label={line.label} price={line.price} unit={line.unit} />
                ))}
              </ul>
              <p className={styles.pricingFootnote}>{footnote}</p>
            </>
          ) : (
            <p className={styles.pricingNoPricesSentence}>{noPricesSentence}</p>
          )}
        </div>

        <a href="#" className={`${sharedStyles.btnSecondary} ${styles.pricingButton}`}>
          {buttonLabel}
        </a>
      </div>
    </section>
  );
}
