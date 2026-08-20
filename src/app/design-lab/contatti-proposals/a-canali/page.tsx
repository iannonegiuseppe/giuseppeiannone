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
  title: "Contatti — proposta A, i canali (interno)",
  robots: resolveRobots(true),
};

export default async function ProposalACanali() {
  const { siteSettings, contactCopy, sedes } = await getContattiProposalData();
  const contactSection = contactCopy?.contactSection;

  const whatsapp = pickChannel(siteSettings?.contactChannels, "whatsapp");
  const phone = pickChannel(siteSettings?.contactChannels, "phone");
  const email = pickChannel(siteSettings?.contactChannels, "email");
  const onlineSede = sedes.find((s) => s.isOnline);

  return (
    <>
      <ProposalBanner
        label="Proposta A — I canali"
        weak="I tre canali occupano il primo schermo intero: a 390px la mappa (l'elemento più vivo, con foto reali dei singoli studi) arriva solo dopo due sezioni di scroll. Rischio opposto, mitigato ma non eliminato: tre riquadri di contatto possono leggersi come una griglia da modulo amministrativo se il testo sopra non fa abbastanza lavoro."
      />
      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.kicker}>
            <SectionKicker>Contatti</SectionKicker>
          </p>
          <h1 className={styles.title}>Come contattarmi</h1>
          <p className={styles.intro}>
            Puoi scrivermi, chiamarmi o passare in uno degli studi. Rispondo sempre personalmente,
            di norma entro 24 ore.
          </p>
        </header>

        <section className={styles.channelsSection} aria-label="Canali di contatto">
          {whatsapp ? (
            <a
              href={whatsappUrl(whatsapp.value, "it")}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channelPrimary}
            >
              <span className={styles.channelPrimaryEyebrow}>WhatsApp</span>
              <span className={styles.channelPrimaryLabel}>{whatsapp.label}</span>
              {phone ? <span className={styles.channelPrimarySub}>{phone.label}</span> : null}
            </a>
          ) : null}

          <div className={styles.channelSecondaryRow}>
            {phone ? (
              <a href={`tel:${phone.value}`} className={styles.channelSecondary}>
                <span className={styles.channelSecondaryEyebrow}>Telefono</span>
                <span className={styles.channelSecondaryValue}>{phone.label}</span>
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email.value}`} className={styles.channelSecondary}>
                <span className={styles.channelSecondaryEyebrow}>Email</span>
                <span className={styles.channelSecondaryValue}>{email.value}</span>
              </a>
            ) : null}
          </div>
        </section>

        <section className={styles.hoursSection} aria-label="Orari">
          <p className={styles.hoursLabel}>Orari</p>
          <p className={styles.hoursLine}>{HOURS_IT.line1}</p>
          <p className={styles.hoursLine}>{HOURS_IT.line2}</p>
        </section>

        <SediMapProvider>
          <SediBlock
            kicker="Dove"
            heading="Quattro studi, più la modalità online"
            intro="Gli orari sono gli stessi in ogni sede — vedi sopra."
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
