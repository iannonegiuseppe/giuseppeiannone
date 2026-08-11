import type { Metadata } from "next";
import { ContactBlock } from "@/components/ContactBlock";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { resolveRobots } from "@/sanity/metadata";
import { ProposalBanner } from "../ProposalBanner";
import { getPrezziProposalData, pricingOrPlaceholder } from "../shared";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Prezzi — proposta B, il percorso (interno)",
  robots: resolveRobots(true),
};

export default async function ProposalBPercorso() {
  const { siteSettings, contactCopy } = await getPrezziProposalData();
  const fees = pricingOrPlaceholder(siteSettings?.pricing);
  const contactSection = contactCopy?.contactSection;

  const STEPS = [
    {
      title: "La prima seduta",
      body: "[placeholder] Una seduta completa, alla tariffa ordinaria — non un colloquio conoscitivo a parte.",
    },
    {
      title: "Individuale o di coppia",
      body: `[placeholder] Seduta individuale: ${fees.individualDuration}, ${fees.individualFee}. Seduta di coppia: ${fees.coupleDuration}, ${fees.coupleFee}.`,
    },
    {
      title: "In ogni sede, o online",
      body: "[placeholder] Milano (Citylife, Bicocca), Monza, Cernusco sul Naviglio, oppure online — stessa tariffa ovunque.",
    },
    {
      title: "Il pagamento",
      body: "[placeholder] Alla fine di ogni seduta: contanti, bonifico o carta. Ricevuta sempre rilasciata, detraibile al 19% per i pagamenti tracciabili.",
    },
  ];

  return (
    <>
      <ProposalBanner
        label="Proposta B — Il percorso"
        weak="Una sequenza numerata può leggersi come un funnel anche quando il contenuto resta neutro — servirebbe verificare col cliente che 'passo 1, passo 2...' non suoni come un invito a procedere piuttosto che un'informazione."
      />
      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.kicker}>
            <SectionKicker>Come funziona</SectionKicker>
          </p>
          <h1 className={styles.title}>Prezzi</h1>
          <p className={styles.subhead}>
            [placeholder — una riga che introduce la sequenza sotto]
          </p>
        </header>

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumeral} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>{step.title}</h2>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

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
