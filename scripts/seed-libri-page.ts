import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN.");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

function chapter(title: string, description: string) {
  return { title, description };
}

const it = {
  _id: "libriPage-it",
  _type: "libriPage",
  language: "it",
  kicker: "Materiali",
  title: "Quello che ho scritto",
  titleEmphasisWord: "scritto",
  lead: "Un manuale gratuito su ansia e panico, e un libro pubblicato.",

  indexKicker: "Manuale gratuito",
  indexTitle: "Cosa c'è dentro",
  indexTitleEmphasisWord: "dentro",
  indexLead:
    "Il manuale è breve di proposito: [n] pagine, sei capitoli, nessun esercizio da compilare.",

  chapter1: chapter(
    "Cosa succede durante un attacco",
    "La sequenza fisiologica, e perché il corpo reagisce prima del pensiero.",
  ),
  chapter2: chapter(
    "Ansia ordinaria e disturbo",
    "Dove passa il confine, e perché non è una questione di intensità.",
  ),
  chapter3: chapter("L'evitamento", "Perché funziona sul momento, e cosa fa nel tempo."),
  chapter4: chapter(
    "Il corpo e i suoi segnali",
    "Come una sensazione ordinaria diventa un allarme.",
  ),
  chapter5: chapter(
    "Quando serve una valutazione medica",
    "Cosa va escluso prima, e a chi rivolgersi.",
  ),
  chapter6: chapter(
    "Cosa succede in un percorso",
    "Le fasi, il ritmo degli incontri, e cosa si porta in seduta.",
  ),

  coverTitle: "Ansia e panico: come funzionano",
  metaLine: "[n] pagine · PDF · italiano",

  form: {
    kicker: "Ricevilo",
    heading: "Te lo mando per email",
    lead: "Arriva subito, in PDF. L'indirizzo serve solo a inviartelo.",
    consentLabel: "Ho letto l'informativa privacy e acconsento al trattamento dei dati.",
    marketingLabel: "Voglio ricevere occasionalmente altri materiali. (facoltativo)",
    submitLabel: "Inviami il manuale",
  },

  book: {
    kicker: "Anche in libreria",
    title: "[Titolo del libro]",
    body: "[placeholder] Due o tre righe su cosa affronta il libro, per chi è stato scritto e in cosa si distingue dal manuale. [editore], [anno].",
    ctaLabel: "Su Amazon",
  },

  seo: {
    metaDescription:
      "Un manuale gratuito su ansia e panico in PDF, e il libro pubblicato dal Dr. Giuseppe Iannone.",
    noIndex: true,
  },
};

const en = {
  _id: "libriPage-en",
  _type: "libriPage",
  language: "en",
  kicker: "Materials",
  title: "What I have written",
  titleEmphasisWord: "written",
  lead: "A free guide to anxiety and panic, and a published book.",

  indexKicker: "Free guide",
  indexTitle: "What is inside",
  indexTitleEmphasisWord: "inside",
  indexLead: "The guide is deliberately short: [n] pages, six chapters, nothing to fill in.",

  chapter1: chapter(
    "What happens during an attack",
    "The physiological sequence, and why the body reacts before the thought.",
  ),
  chapter2: chapter(
    "Ordinary anxiety and a disorder",
    "Where the line falls, and why it is not a matter of intensity.",
  ),
  chapter3: chapter("Avoidance", "Why it works in the moment, and what it does over time."),
  chapter4: chapter("The body and its signals", "How an ordinary sensation becomes an alarm."),
  chapter5: chapter(
    "When a medical assessment is needed",
    "What has to be ruled out first, and who to see.",
  ),
  chapter6: chapter(
    "What happens in a course of therapy",
    "The phases, the rhythm of sessions, and what gets brought in.",
  ),

  coverTitle: "Anxiety and panic: how they work",
  // Deliberate: the guide itself is Italian — kept explicit here so an
  // English reader knows before submitting an address (owner's own
  // instruction, not an oversight left over from translation).
  metaLine: "[n] pages · PDF · Italian",

  form: {
    kicker: "Get it",
    heading: "I will email it to you",
    lead: "It arrives straight away, as a PDF. The address is used only to send it.",
    consentLabel: "I have read the privacy notice and consent to my data being processed.",
    marketingLabel: "I would like to receive other materials occasionally. (optional)",
    submitLabel: "Send me the guide",
  },

  book: {
    kicker: "Also in print",
    title: "[Book title]",
    body: "[placeholder] Two or three lines on what the book covers, who it is for, and how it differs from the guide. [publisher], [year].",
    ctaLabel: "On Amazon",
  },

  seo: {
    metaDescription:
      "A free PDF guide to anxiety and panic, and the published book by Dr. Giuseppe Iannone.",
    noIndex: true,
  },
};

async function main() {
  const tx = client.transaction();
  tx.createOrReplace(it);
  tx.createOrReplace(en);
  const result = await tx.commit();
  console.log("Seeded:", result.results.map((r) => r.id));
}
main().catch(console.error);
