import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { sanityFetch } from "@/sanity/client";
import type { Locale } from "@/sanity/paths";
import { latestArticlesQuery } from "@/sanity/queries";
import { ChiSonoOverlap } from "./ChiSonoOverlap";
import { ConcernsSection } from "./ConcernsSection";
import { DesignLabFooter } from "./DesignLabFooter";
import { DesignLabHeader } from "./DesignLabHeader";
import { DiplomiSection } from "./DiplomiSection";
import { FaqSection } from "./FaqSection";
import { FinalContactSection } from "./FinalContactSection";
import { FormazioneBand } from "./FormazioneBand";
import { buildNavItems } from "./headerNavItems";
import { HeroOverlap } from "./HeroOverlap";
import { LenisProvider } from "./LenisProvider";
import { MethodsOverlap } from "./MethodsOverlap";
import { MiniContactBand } from "./MiniContactBand";
import { PercorsoSection } from "./PercorsoSection";
import { PricingSection } from "./PricingSection";
import { RecognitionSection } from "./RecognitionSection";
import { type RealArticle, ResourcesSection } from "./ResourcesSection";
import { SedesSection } from "./SedesSection";
import { StatementBand } from "./StatementBand";
import styles from "./design-lab.module.scss";

// Throwaway internal route — Stage 3 williamson-adaptation review
// (docs/adaptation/adaptation-brief.md). Not linked from anywhere, not in
// the sitemap, noindex regardless. Deleted once directions are decided;
// nothing outside this folder is touched by this page existing.
//
// Building section-by-section, extending this same page (Group A one at a
// time for close review, Group B in a single pass, per the agreed rollout
// plan) — then one port to the real homepage + photos into Sanity at the
// end. Hero is locked (Version 2/treated); only that version renders now.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const recognitionBridgeLine =
  "Non serve conoscere il nome di quello che senti. A volte si parte da qui. [segnaposto]";

const bio =
  "Da anni accompagno persone che attraversano ansia, cambiamenti di vita e momenti di difficoltà, con un approccio integrato e concreto.";

const methodsBody =
  "Ogni percorso nasce da un ascolto attento: strumenti cognitivo-comportamentali, adattati alla persona che ho davanti, non a uno schema fisso.";

const pricingBody =
  "Un percorso ha un costo chiaro, comunicato prima di iniziare. Nessuna sorpresa, nessuna promozione.";

const finalContactBody =
  "Se ti riconosci in questi temi, scrivimi: possiamo capire insieme da dove partire.";

const finalContactResponseNote =
  "Rispondo di persona, in genere entro [segnaposto] giorni.";

const sediParagraph =
  "Ricevo in studio a Milano, Monza e Cernusco sul Naviglio, oppure online. [segnaposto]";

const miniContactBody =
  "Se vuoi, scrivimi due righe così come viene: ti rispondo personalmente e capiamo insieme se posso esserti utile. [segnaposto]";

// Giuseppe's own signed statement, not a testimonial — see
// StatementBand.tsx's file-level comment and docs/design-direction.md §9.
const statementText =
  "Il mio lavoro non è dare risposte pronte, ma costruire insieme un modo di stare nelle cose — più chiaro, più sostenibile.";

export default async function DesignLabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  // Tagged "article" per the project's type-driven revalidation
  // convention (src/app/api/revalidate/route.ts revalidates the raw
  // _type string on every write) — same tag family the webhook already
  // produces for this document type, no changes needed there.
  const realArticles = await sanityFetch<RealArticle[]>(
    latestArticlesQuery,
    { locale },
    ["article"],
  );

  const navItems = buildNavItems(typedLocale);

  return (
    <LenisProvider>
      <DesignLabHeader navItems={navItems} locale={typedLocale} />
      <main className={styles.labRoot}>
        <HeroOverlap treatment="treated" />

        <ChiSonoOverlap
          introHeading="Uno spazio per capire cosa succede, e come stare meglio."
          introLinkLabel="Scrivimi"
          kicker="Il percorso"
          heading="Chi sono"
          bio={bio}
          storyLinkLabel="La mia storia"
        />
        <MethodsOverlap
          kicker="Il metodo"
          heading="Come funziona"
          body={methodsBody}
        />

        <FormazioneBand kicker="Formazione e iscrizioni" />

        <ConcernsSection
          kicker="Aree di lavoro"
          heading="Di cosa mi occupo"
          linkLabel="Tutte le aree"
        />
        <StatementBand
          statement={statementText}
          signature="Giuseppe Iannone"
          role="Psicologo Psicoterapeuta"
        />
        <DiplomiSection
          kicker="Percorso formativo"
          heading="Diplomi e formazione"
        />
        <PercorsoSection
          kicker="Come si svolge"
          heading="Come si svolge un percorso"
          paragraph="Ogni percorso è diverso, ma la struttura è chiara fin dall'inizio: ecco cosa aspettarsi."
        />
        <RecognitionSection
          kicker="Situazioni comuni"
          heading="Ti riconosci?"
          bridgeLine={recognitionBridgeLine}
        />
        <MiniContactBand
          kicker="Primo contatto"
          heading="Non serve arrivare con una richiesta chiara."
          body={miniContactBody}
        />
        <SedesSection
          kicker="Dove ricevo"
          heading="Sedi"
          paragraph={sediParagraph}
        />

        <PricingSection
          kicker="Trasparenza"
          heading="Quanto costa un percorso"
          body={pricingBody}
          buttonLabel="Vedi i prezzi"
          showPrices
        />
        <FinalContactSection
          kicker="Primo passo"
          heading="Non sai da dove iniziare?"
          body={finalContactBody}
          ctaLabel="Prenota un primo colloquio"
          privacyNote="I tuoi dati saranno trattati con la massima riservatezza."
          responseNote={finalContactResponseNote}
          googleProfileLabel="Trovami su Google"
        />
        <ResourcesSection
          kicker="Per iniziare"
          heading="Risorse"
          locale={locale}
          realArticles={realArticles}
          allArticlesLabel="Tutte le risorse"
        />

        <FaqSection
          kicker="Domande frequenti"
          heading="Domande frequenti"
          linkLabel="Tutte le domande"
          locale={locale}
        />
        <DesignLabFooter locale={locale} />
      </main>
    </LenisProvider>
  );
}
