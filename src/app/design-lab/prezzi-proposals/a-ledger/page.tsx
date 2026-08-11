import type { Metadata } from "next";
import { ContactBlock } from "@/components/ContactBlock";
import { PricingBlock } from "@/components/PricingBlock";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { resolveRobots } from "@/sanity/metadata";
import { ProposalBanner } from "../ProposalBanner";
import { getPrezziProposalData, pricingOrPlaceholder } from "../shared";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Prezzi — proposta A, il foglio (interno)",
  robots: resolveRobots(true),
};

const FACTS = [
  {
    label: "Dove",
    value: "Milano (Citylife, Bicocca), Monza, Cernusco sul Naviglio, online — stessa tariffa ovunque.",
  },
  {
    label: "Prima seduta",
    value: "Una seduta completa, alla tariffa ordinaria.",
  },
  {
    label: "Come si paga",
    value: "Alla fine di ogni seduta: contanti, bonifico o carta. Ricevuta sempre rilasciata.",
  },
  {
    label: "Detrazione",
    value: "Detraibile al 19% come spesa sanitaria, per i pagamenti tracciabili.",
  },
];

export default async function ProposalALedger() {
  const { siteSettings, contactCopy } = await getPrezziProposalData();
  const fees = pricingOrPlaceholder(siteSettings?.pricing);
  const contactSection = contactCopy?.contactSection;

  return (
    <>
      <ProposalBanner
        label="Proposta A — Il foglio"
        weak="Amministrativa per scelta: se il resto del sito è caldo/editoriale, questa densità di tabella può sembrare fuori tono al primo sguardo — è il prezzo della chiarezza massima."
      />
      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.kicker}>
            <SectionKicker>Tariffe</SectionKicker>
          </p>
          <h1 className={styles.title}>Prezzi</h1>
          <p className={styles.subhead}>
            [placeholder — una riga, tono diretto: cosa costa, dove, come si paga]
          </p>
        </header>

        <PricingBlock
          eyebrow="Le tariffe"
          heading="Costo delle sedute"
          rows={[
            { mode: "Seduta individuale", subline: fees.individualDuration, price: fees.individualFee },
            { mode: "Seduta di coppia", subline: fees.coupleDuration, price: fees.coupleFee },
          ]}
          detailsItems={["Contanti", "Bonifico", "Carta"]}
          detrazioneFootnote="Detraibile al 19% come spesa sanitaria, per i pagamenti tracciabili."
        />

        <section className={styles.factsSection} aria-label="Come funziona">
          <dl className={styles.factsGrid}>
            {FACTS.map((fact) => (
              <div key={fact.label} className={styles.factRow}>
                <dt className={styles.factLabel}>{fact.label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <ContactBlock
          kicker={contactSection?.kicker ?? ""}
          heading={contactSection?.heading ?? ""}
          headingEmphasisWord={contactSection?.headingEmphasisWord}
          photoCaption={contactSection?.photoCaption ?? ""}
          googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
          googleProfileUrl={siteSettings?.googleProfileUrl}
          locale="it"
          photoUrl="/design-lab/photos/09.webp"
          photoAlt="Giuseppe Iannone, ritratto."
        />
      </main>
    </>
  );
}
