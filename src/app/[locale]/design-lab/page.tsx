import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ChiSonoOverlap } from "@/components/ChiSonoOverlap";
import { ConcernsSection } from "@/components/ConcernsSection";
import { DiplomiSection } from "@/components/DiplomiSection";
import { FaqSection } from "@/components/FaqSection";
import { FinalContactSection } from "@/components/FinalContactSection";
import { FormazioneBand } from "@/components/FormazioneBand";
import { HeroOverlap } from "@/components/HeroOverlap";
import { MethodsOverlap } from "@/components/MethodsOverlap";
import { MiniContactBand } from "@/components/MiniContactBand";
import { PercorsoSection } from "@/components/PercorsoSection";
import { PricingSection } from "@/components/PricingSection";
import { RecognitionSection } from "@/components/RecognitionSection";
import { type RealArticle, ResourcesSection } from "@/components/ResourcesSection";
import { SedesSection } from "@/components/SedesSection";
import { StatementBand } from "@/components/StatementBand";
import { sanityFetch } from "@/sanity/client";
import { latestArticlesQuery } from "@/sanity/queries";

// Mirror route, post-promotion: every section below is the SAME shared
// component now rendered on the real homepage (src/app/[locale]/page.tsx)
// — this route no longer owns any of that code, it only re-renders it for
// continued internal review. Kept (not deleted) until the client formally
// signs off and this route is retired; noindex/unlinked either way. The
// real Header/Footer (rendered by layout.tsx for every route) already
// cover this one too — this page renders no header/footer of its own.
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

const statementText =
  "Il mio lavoro non è dare risposte pronte, ma costruire insieme un modo di stare nelle cose — più chiaro, più sostenibile.";

export default async function DesignLabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const realArticles = await sanityFetch<RealArticle[]>(
    latestArticlesQuery,
    { locale },
    ["article"],
  );

  return (
    <main>
      <HeroOverlap treatment="treated" label="Hero — approved" />

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

      <ResourcesSection
        kicker="Per iniziare"
        heading="Risorse"
        locale={locale}
        realArticles={realArticles}
        allArticlesLabel="Tutte le risorse"
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

      <FaqSection
        kicker="Domande frequenti"
        heading="Domande frequenti"
        linkLabel="Tutte le domande"
        locale={locale}
      />
    </main>
  );
}
