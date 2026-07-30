import { createClient } from "@sanity/client";

// Full-bleed rebuild pass — seeds homePage.profilo (a NEW field group,
// separate from chiSonoSection, see that field group's own schema
// comment for why) for the first time. Replaces content.ts's CHI_SONO
// constant, which this pass's own JSX no longer reads. Per the client's
// own request, the personal-experience material (Siena 2001 panic
// attack, Amsterdam/own-therapy paragraph, the old "Conosco l'ansia da
// vicino" heading) is dropped entirely — three professional-fact
// paragraphs only. EN paragraphs reuse content.ts's own existing
// paragraphsAfterPhoto EN translations verbatim (the new IT paragraphs
// are themselves near-identical to that constant's own paragraphsAfterPhoto
// set), not retranslated from scratch.
//
// DRAFT — NOT APPROVED. §9 checked via the actual deontologyCheck
// validator for IT (all four strings pass — see this pass's own report).
// EN checked by hand.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary write-scoped token in the Sanity " +
      'dashboard (API -> Tokens -> Add API token, "Editor" permission), set it in ' +
      ".env.local, run this script, then delete the token again.",
  );
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const IT_PROFILO = {
  eyebrow: "Chi sono",
  heading: "Non sono un tuttologo. Mi occupo di ansia e attacchi di panico",
  headingEmphasisWord: "ansia e attacchi di panico",
  paragraphs: [
    "Ho studiato Neuroscienze Cognitive e Cliniche all'Università di Maastricht e ho lavorato come ricercatore sui meccanismi dell'ansia e del panico. Poi la specializzazione in Psicoterapia Cognitivo-Neuropsicologica e le esperienze cliniche nei reparti di psichiatria, tra Milano e Brescia.",
    "Lavoro in italiano e in inglese. Negli anni ho accompagnato persone arrivate a Milano da ogni parte del mondo: studiare e vivere all'estero mi ha insegnato quanto conti potersi raccontare nella lingua in cui ci si sente a casa.",
    "Oggi mi occupo esclusivamente di ansia e panico, e delle difficoltà che li accompagnano. Ricevo a Milano, Monza, Cernusco sul Naviglio e online.",
  ],
};

const EN_PROFILO = {
  eyebrow: "About me",
  heading: "I'm not a jack-of-all-trades. I work with anxiety and panic attacks",
  headingEmphasisWord: "anxiety and panic attacks",
  paragraphs: [
    "I studied Cognitive and Clinical Neuroscience at Maastricht University and worked as a researcher on the mechanisms of anxiety and panic. Then came the specialization in Cognitive-Neuropsychological Psychotherapy and clinical experience in psychiatric wards, between Milan and Brescia.",
    "I work in both Italian and English. Over the years I've worked with people who came to Milan from all over the world: studying and living abroad taught me how much it matters to be able to talk about yourself in the language you feel most at home in.",
    "Today I work exclusively with anxiety and panic, and the difficulties that come with them. I see clients in Milan, Monza, Cernusco sul Naviglio and online.",
  ],
};

async function getProfilo(id: string) {
  return client.fetch(`*[_id == $id][0]{ profilo }`, { id });
}

async function patchDoc(id: string, profilo: Record<string, unknown>) {
  const before = await getProfilo(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));

  await client.patch(id).set({ profilo }).commit();

  const after = await getProfilo(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("homePage-it", IT_PROFILO);
  await patchDoc("homePage-en", EN_PROFILO);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
