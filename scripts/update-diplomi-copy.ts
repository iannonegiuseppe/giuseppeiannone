import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  await client
    .patch("homePage-it")
    .set({
      "diplomi.kicker": "Titoli e formazione",
      "diplomi.heading": "I documenti su cui si basa il mio lavoro",
      "diplomi.headingEmphasisWord": "documenti",
      "diplomi.intro":
        "Ogni titolo è consultabile per intero. Alcuni dati personali sono stati oscurati; date, istituzioni e firme restano come sull'originale.",
      "diplomi.alboLine": "Esercito la professione di psicologo e psicoterapeuta in Lombardia.",
    })
    .commit();
  console.log("homePage-it: diplomi copy updated");

  await client
    .patch("homePage-en")
    .set({
      "diplomi.kicker": "Qualifications and training",
      "diplomi.heading": "The documents my work is built on",
      "diplomi.headingEmphasisWord": "documents",
      "diplomi.intro":
        "Each qualification can be viewed in full. Some personal details have been redacted; dates, institutions and signatures remain as on the original.",
      "diplomi.alboLine": "I practise as a psychologist and psychotherapist in Lombardy.",
    })
    .commit();
  console.log("homePage-en: diplomi copy updated");

  const it = await client.fetch(
    `*[_id=="homePage-it"][0]{ "c": diplomi{kicker, heading, headingEmphasisWord, intro, alboLine} }`,
  );
  const en = await client.fetch(
    `*[_id=="homePage-en"][0]{ "c": diplomi{kicker, heading, headingEmphasisWord, intro, alboLine} }`,
  );
  console.log("\n=== re-fetched IT ===");
  console.log(JSON.stringify(it.c, null, 2));
  console.log("\n=== re-fetched EN ===");
  console.log(JSON.stringify(en.c, null, 2));
}

main();
