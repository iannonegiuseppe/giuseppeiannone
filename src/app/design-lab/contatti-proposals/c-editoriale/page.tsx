import type { Metadata } from "next";
import { ContactBlock } from "@/components/ContactBlock";
import { SediBlock } from "@/components/SediBlock";
import { SediMapProvider } from "@/components/SediMapContext";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { whatsappUrl } from "@/sanity/contact";
import { resolveRobots } from "@/sanity/metadata";
import { ProposalBanner } from "../ProposalBanner";
import { getContattiProposalData, pickChannel, HOURS_IT } from "../shared";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Contatti — proposta C, editoriale (interno)",
  robots: resolveRobots(true),
};

export default async function ProposalCEditoriale() {
  const { siteSettings, contactCopy, sedes } = await getContattiProposalData();
  const contactSection = contactCopy?.contactSection;

  const whatsapp = pickChannel(siteSettings?.contactChannels, "whatsapp");
  const phone = pickChannel(siteSettings?.contactChannels, "phone");
  const email = pickChannel(siteSettings?.contactChannels, "email");
  const onlineSede = sedes.find((s) => s.isOnline);
  const waHref = whatsapp ? whatsappUrl(whatsapp.value) : undefined;

  return (
    <>
      <ProposalBanner
        label="Proposta C — Editoriale"
        weak="Meno scansionabile delle altre due: il numero è cliccabile ma è presentato come una cifra tipografica, non come un pulsante — chi scorre la pagina in fretta senza leggere il testo può non capire subito che si può toccare. Funziona meglio per chi legge davvero la pagina che per chi la scorre in cerca di un'icona riconoscibile."
      />
      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.kicker}>
            <SectionKicker>Contatti</SectionKicker>
          </p>
          <h1 className={styles.title}>Scrivimi, chiamami, o vieni in studio</h1>
        </header>

        <section className={styles.prose} aria-label="Come contattarmi">
          <p className={styles.paragraph}>
            Puoi scrivermi su{" "}
            {waHref ? (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
                WhatsApp
              </a>
            ) : (
              "WhatsApp"
            )}{" "}
            — è il modo più diretto — oppure telefonarmi o mandarmi un&apos;email: uso lo stesso
            numero per WhatsApp e per le chiamate. Rispondo sempre personalmente, di norma entro 24
            ore.
          </p>

          <div className={styles.figures}>
            {phone ? (
              <a href={waHref ?? `tel:${phone.value}`} className={styles.figureLink} target={waHref ? "_blank" : undefined} rel={waHref ? "noopener noreferrer" : undefined}>
                <p className={styles.figureNumber}>{phone.label}</p>
                <p className={styles.figureCaption}>WhatsApp e telefono</p>
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email.value}`} className={styles.figureLink}>
                <p className={styles.figureEmail}>{email.value}</p>
                <p className={styles.figureCaption}>Email</p>
              </a>
            ) : null}
          </div>
        </section>

        <section className={styles.factsSection} aria-label="Orari">
          <div className={styles.factRow}>
            <p className={styles.factLabel}>Orari</p>
            <p className={styles.factValue}>
              {HOURS_IT.line1} {HOURS_IT.line2}
            </p>
          </div>
        </section>

        <SediMapProvider>
          <SediBlock
            kicker="Dove"
            heading="Quattro studi, più la modalità online"
            intro="Gli orari sono gli stessi ovunque — vedi sopra."
            onlineSubLine={onlineSede?.onlineLine}
            sedes={sedes}
            locale="it"
          />
        </SediMapProvider>

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
