import { createClient } from "@sanity/client";

// Chi sono pass 3 (publications + pull-quote follow-up) — writes
// chiSonoSection.publications and .pullQuoteFollowUp, both locales.
// createIfNotExists + patch.set, touches only these two fields — does
// NOT touch the existing pullQuote field itself (already holds the real
// quote text from before this whole rebuild).
//
// Publications: citation text is a deliberate bracketed placeholder, not
// the real title/journal/year — those exist (both links resolved, see
// this pass's own report) but were withheld on purpose pending Giuseppe's
// own confirmation. The url on each entry IS real from day one.
// EN kicker/title ("Published research"/"Scientific papers") are a plain
// translation of the IT section label the draft gives — the draft itself
// only said "Same as IT" for English and left title translation
// unspecified; flagged as an inferred label, not clinical content.
//
// Pull-quote follow-up: transcribed verbatim from "LA SPIA SUL
// CRUSCOTTO"/"THE WARNING LIGHT" in contents/chi-sono-testo-completo.md,
// the three paragraphs after the quote itself.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function patchDoc(id: string, fields: Record<string, unknown>) {
  await client.createIfNotExists({ _id: id, _type: "chiSonoSection" });
  await client.patch(id).set(fields).commit();
  console.log(`\n--- ${id} ---`);
  console.log(JSON.stringify(fields, null, 2));
}

const publicationsIt = {
  kicker: "RICERCA PUBBLICATA",
  title: "Lavori scientifici",
  items: [
    {
      topicLabel: "su ansia",
      citation: "[titolo, rivista e anno da confermare]",
      url: "https://pubmed.ncbi.nlm.nih.gov/26881136/",
    },
    {
      topicLabel: "su depressione",
      citation: "[titolo, rivista e anno da confermare]",
      url: "https://onlinelibrary.wiley.com/doi/abs/10.1002/da.23023",
    },
  ],
};

const publicationsEn = {
  kicker: "PUBLISHED RESEARCH",
  title: "Scientific papers",
  items: [
    {
      topicLabel: "on anxiety",
      citation: "[title, journal and year pending confirmation]",
      url: "https://pubmed.ncbi.nlm.nih.gov/26881136/",
    },
    {
      topicLabel: "on depression",
      citation: "[title, journal and year pending confirmation]",
      url: "https://onlinelibrary.wiley.com/doi/abs/10.1002/da.23023",
    },
  ],
};

const pullQuoteFollowUpIt = [
  "Si può tagliare il filo che porta il segnale luminoso e continuare a guidare. Si avrebbe l'illusione che il guasto non ci sia.",
  "Non ho nulla contro i farmaci: in molti casi sono alleati preziosi, soprattutto insieme alla psicoterapia. Ma quando i sintomi vengono soltanto spenti, la domanda che li ha prodotti resta senza risposta.",
  "In psicoterapia si va a leggere il significato dei sintomi, e a contestualizzarli in una storia — la tua.",
];

const pullQuoteFollowUpEn = [
  "You could cut the wire that carries the signal and keep driving. You'd have the illusion that there was no fault.",
  "I have nothing against medication: in many cases it's a valuable ally, particularly alongside psychotherapy. But when symptoms are only switched off, the question that produced them goes unanswered.",
  "In psychotherapy we read what the symptoms mean, and place them in a history — yours.",
];

async function main() {
  await patchDoc("chiSonoSection-it", { publications: publicationsIt, pullQuoteFollowUp: pullQuoteFollowUpIt });
  await patchDoc("chiSonoSection-en", { publications: publicationsEn, pullQuoteFollowUp: pullQuoteFollowUpEn });
  console.log("\n=== chi sono publications + pull-quote follow-up: done ===");
}

main();
