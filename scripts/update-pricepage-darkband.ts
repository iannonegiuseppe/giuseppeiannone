import { createClient } from "@sanity/client";

// /prezzi dark-band restructure pass — verbatim copy, both locales, into
// the new column1/column2 {block1Heading, block1Body, block2Heading,
// block2Body} shape. emphasisWord picked from the new copy itself (no new
// phrase was specified this pass) — see page.tsx's own renderBlockBody
// comment for why this particular sentence.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  await client
    .patch("pricePage-it")
    .set({
      "darkBand.emphasisWord": "Quello che leggi qui è quello che paghi",
      "darkBand.column1": {
        block1Heading: "Una sola tariffa per tipo di seduta",
        block1Body:
          "La tariffa dipende dal tipo di incontro — individuale o di coppia — ed è la stessa nei due studi di Milano, a Monza, a Cernusco sul Naviglio e in videochiamata. Quello che leggi qui è quello che paghi: la cifra è scritta per intero prima ancora che tu mi scriva. Se qualcosa dovesse cambiare in corso di percorso, ne parliamo prima, in seduta.",
        block2Heading: "Cosa comprende",
        block2Body:
          "I quarantacinque minuti dell'incontro e il lavoro clinico che li accompagna: la valutazione iniziale, e il filo che tiene insieme una seduta e la successiva.",
      },
      "darkBand.column2": {
        block1Heading: "Quando si paga",
        block1Body:
          "Alla fine di ogni seduta, in contanti, con bonifico o con carta. La ricevuta viene rilasciata sempre, senza doverla chiedere: è il documento da conservare per la detrazione del 19% come spesa sanitaria, che si applica ai pagamenti tracciabili.",
        block2Heading: "Il primo incontro",
        block2Body:
          "È una seduta a tutti gli effetti, alla tariffa ordinaria. Serve a capire di cosa stiamo parlando e a valutare insieme se e come proseguire, e resta un incontro a sé se decidi di fermarti lì.",
      },
    })
    .commit();
  console.log("pricePage-it: darkBand column1/column2/emphasisWord set");

  await client
    .patch("pricePage-en")
    .set({
      "darkBand.emphasisWord": "What you read here is what you pay",
      "darkBand.column1": {
        block1Heading: "One fee per type of session",
        block1Body:
          "The fee depends on the type of session — individual or couple — and is the same at both Milan studios, in Monza, in Cernusco sul Naviglio and by video call. What you read here is what you pay: the figure is set out in full before you even write to me. If anything were to change during a course of work, we discuss it beforehand, in session.",
        block2Heading: "What it covers",
        block2Body:
          "The forty-five minutes of the session and the clinical work around them: the initial assessment, and the thread that holds one session and the next together.",
      },
      "darkBand.column2": {
        block1Heading: "When you pay",
        block1Body:
          "At the end of each session, by cash, bank transfer or card. A receipt is issued every time without your having to ask: it is the document to keep for the 19% medical-expense deduction, which applies to traceable payments.",
        block2Heading: "The first session",
        block2Body:
          "It is a full session at the ordinary fee. It is there to understand what we are dealing with and to assess together whether and how to continue, and it stays a single consultation if you decide to stop there.",
      },
    })
    .commit();
  console.log("pricePage-en: darkBand column1/column2/emphasisWord set");
}

main();
