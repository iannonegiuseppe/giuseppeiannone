import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
import { homePath, type Locale } from "@/sanity/paths";
import { latestArticlesQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings } from "@/sanity/seo";

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

// TEMPORARY EN GATE: this composition's copy is hardcoded Italian —
// translations arrive with the content phase, not this promotion pass.
// Until then the EN homepage redirects to the IT root (below) and its
// hreflang pair is suppressed here (localizedPaths omits `en`) rather
// than dismantling the hreflang system itself — every other page keeps
// emitting both. Remove this gate, restore `en: "/en"` here, and drop
// the redirect once real EN copy exists.
//
// SPEC-VS-LIBRARY MISMATCH, flagged rather than silently guessed: the
// spec calls for a 302. next/navigation's redirect() only offers 307
// (TemporaryRedirect, the default used below), 303 (SeeOther), or 308
// (PermanentRedirect) — there is no literal 302 in the App Router's
// page-level redirect primitive; forcing one would mean bypassing
// redirect() for a hand-rolled Response, a bigger change than this gate
// warrants. 307 is used instead — the modern, unambiguous equivalent of
// "temporary redirect" (preserves method, unlike 302's historically
// inconsistent handling across clients) — and is what's actually shipped
// here; reported plainly rather than claimed as 302.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const siteSettings = await getSiteSettings(locale);

  return await buildMetadata({
    locale: locale as Locale,
    title: "Giuseppe Iannone",
    seo: siteSettings?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: { it: "/" },
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // TEMPORARY EN GATE — see generateMetadata's own comment above.
  if (locale === "en") {
    redirect(homePath("it"));
  }

  // Tagged "article" per the project's type-driven revalidation convention
  // (src/app/api/revalidate/route.ts revalidates the raw _type string on
  // every write) — same tag family the webhook already produces for this
  // document type, no changes needed there.
  const realArticles = await sanityFetch<RealArticle[]>(
    latestArticlesQuery,
    { locale },
    ["article"],
  );

  return (
    <main>
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
