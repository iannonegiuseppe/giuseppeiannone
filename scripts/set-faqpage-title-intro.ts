import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

function introBlock(docId: string, text: string) {
  return [
    {
      _key: `${docId}-intro`,
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _key: `${docId}-intro-span`, _type: "span", marks: [], text }],
    },
  ];
}

async function main() {
  await client.createIfNotExists({ _id: "faqPage-it", _type: "faqPage" });
  await client
    .patch("faqPage-it")
    .set({
      title: "Le domande che arrivano più spesso",
      intro: introBlock(
        "faqPage-it",
        "Sono raccolte per argomento. Le prime quattro sezioni riguardano il modo in cui lavoro — il primo incontro, i costi, le sedi, il rapporto con il medico. Le altre sei riguardano difficoltà specifiche. Se quello che cerchi non c'è, scrivimi: rispondo entro 24 ore.",
      ),
    })
    .commit();
  console.log("faqPage-it: title + intro set");

  await client.createIfNotExists({ _id: "faqPage-en", _type: "faqPage" });
  await client
    .patch("faqPage-en")
    .set({
      title: "The questions that come up most",
      intro: introBlock(
        "faqPage-en",
        "They are grouped by topic. The first four sections cover how I work — the first session, fees, locations, and where medicine fits. The remaining six cover specific difficulties. If what you are looking for is not here, write to me: I reply within 24 hours.",
      ),
    })
    .commit();
  console.log("faqPage-en: title + intro set");
}

main();
