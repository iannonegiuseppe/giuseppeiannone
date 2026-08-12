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
  title: "Contatti — proposta B, la mappa (interno)",
  robots: resolveRobots(true),
};

export default async function ProposalBMappa() {
  const { siteSettings, contactCopy, sedes } = await getContattiProposalData();
  const contactSection = contactCopy?.contactSection;

  const whatsapp = pickChannel(siteSettings?.contactChannels, "whatsapp");
  const phone = pickChannel(siteSettings?.contactChannels, "phone");
  const email = pickChannel(siteSettings?.contactChannels, "email");
  const onlineSede = sedes.find((s) => s.isOnline);

  return (
    <>
      <ProposalBanner
        label="Proposta B — La mappa"
        weak="La logistica precede il tono umano: a 390px si scorre l'intera lista dei quattro studi più la mappa (entrambe impilate, la mappa non è affiancata alla lista sotto i 1024px) prima ancora di vedere come scrivergli. La riga di apertura sopra la mappa attenua il problema ma non lo risolve: chi apre la pagina per un motivo emotivo, non logistico, aspetta di più per arrivare al punto."
      />
      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.kicker}>
            <SectionKicker>Contatti</SectionKicker>
          </p>
          <h1 className={styles.title}>Dove e come trovarmi</h1>
          <p className={styles.intro}>
            Quattro studi e la modalità online, con lo stesso modo di lavorare ovunque.
          </p>
        </header>

        <SediMapProvider>
          <SediBlock
            kicker="Sedi"
            heading="Scegli il posto più comodo per te"
            onlineSubLine={onlineSede?.onlineLine}
            sedes={sedes}
            locale="it"
          />
        </SediMapProvider>

        <section className={styles.railSection} aria-label="Contatti e orari">
          <div className={styles.rail}>
            {whatsapp ? (
              <a
                href={whatsappUrl(whatsapp.value)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.railItemWhatsapp}
              >
                <span className={styles.railLabel}>WhatsApp</span>
                <span className={styles.railValueChip}>{phone?.label ?? whatsapp.label}</span>
              </a>
            ) : null}
            {phone ? (
              <a href={`tel:${phone.value}`} className={styles.railItem}>
                <span className={styles.railLabel}>Telefono</span>
                <span className={styles.railValue}>{phone.label}</span>
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email.value}`} className={styles.railItem}>
                <span className={styles.railLabel}>Email</span>
                <span className={styles.railValue}>{email.value}</span>
              </a>
            ) : null}
            <div className={styles.railItem}>
              <span className={styles.railLabel}>Orari</span>
              <span className={styles.railValue}>{HOURS_IT.line1}</span>
              <span className={styles.railValueMuted}>{HOURS_IT.line2}</span>
            </div>
          </div>
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
