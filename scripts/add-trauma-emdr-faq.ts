import { createClient } from "@sanity/client";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Trauma pillar — adds the "Fai EMDR?" / "Do you do EMDR?" FAQ question
// that was deliberately omitted when the pillar was first built (bracketed
// placeholder answer in the draft at the time — see docs/pre-launch.md's
// now-resolved tracking entry). Giuseppe's own answer, given directly:
// he doesn't practise EMDR. Appends the new reference to both locales'
// faqItems array (doesn't touch the existing 5). Same createIfNotExists +
// patch.set convention as every other write this project.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

function faqAnswer(text: string) {
  return [
    {
      _key: "faq-answer-1",
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _key: "faq-answer-span-1", _type: "span", marks: [], text }],
    },
  ];
}

async function main() {
  await upsertDoc(client, "faqItem-trauma-6-it", "faqItem", {
    question: "Fai EMDR?",
    answer: faqAnswer(
      "No. Ho una formazione in Psicoterapia Cognitivo-Neuropsicologica, ed è l'approccio con cui lavoro. Se stai cercando specificamente l'EMDR, il primo colloquio serve anche a questo: capire se quello che offro corrisponde a quello che cerchi.",
    ),
    language: "it",
  });

  await upsertDoc(client, "faqItem-trauma-6-en", "faqItem", {
    question: "Do you do EMDR?",
    answer: faqAnswer(
      "No. I trained in Cognitive-Neuropsychological Psychotherapy, and that's the approach I work with. If you're specifically looking for EMDR, the first session is partly for that too: working out whether what I offer matches what you're looking for.",
    ),
    language: "en",
  });

  await upsertTranslationMetadata(client, "faqItem-trauma-6", "faqItem", "faqItem-trauma-6-it", "faqItem-trauma-6-en");

  const it = await client.fetch<{ faqItems?: { _key: string }[] }>(
    `*[_id == "pillarPage-trauma-it"][0]{faqItems}`,
  );
  const en = await client.fetch<{ faqItems?: { _key: string }[] }>(
    `*[_id == "pillarPage-trauma-en"][0]{faqItems}`,
  );
  const nextItKey = `faq-ref-${it.faqItems?.length ?? 5}`;
  const nextEnKey = `faq-ref-${en.faqItems?.length ?? 5}`;

  await client
    .patch("pillarPage-trauma-it")
    .setIfMissing({ faqItems: [] })
    .append("faqItems", [{ _key: nextItKey, _type: "reference", _ref: "faqItem-trauma-6-it" }])
    .commit();
  console.log("pillarPage-trauma-it: faqItems appended");

  await client
    .patch("pillarPage-trauma-en")
    .setIfMissing({ faqItems: [] })
    .append("faqItems", [{ _key: nextEnKey, _type: "reference", _ref: "faqItem-trauma-6-en" }])
    .commit();
  console.log("pillarPage-trauma-en: faqItems appended");

  console.log("\n=== trauma EMDR FAQ: done ===");
}

main();
