import { createClient } from "@sanity/client";

// Fee change pass (individual 100€/45min unchanged, couple now 130€/60min).
// Every write below is patch.set on individual leaf paths only — never
// createOrReplace, never .set() on a whole object or a whole portable-text
// block array. Portable text edits address the exact block/span by _key
// (fetched fresh immediately before this script was written, see this
// pass's own report), not by array index, so a reorder elsewhere could
// never make this silently patch the wrong block.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function patchLeaf(id: string, fields: Record<string, unknown>, docType: string) {
  await client.createIfNotExists({ _id: id, _type: docType });
  await client.patch(id).set(fields).commit();
  console.log(`${id}: patched ${Object.keys(fields).join(", ")}`);
}

async function main() {
  // --- Task 1: siteSettings.pricing (both locales, identical values) ---
  const pricingFields = {
    "pricing.individualFee": 100,
    "pricing.individualDurationMin": 45,
    "pricing.coupleFee": 130,
    "pricing.coupleDurationMin": 60,
    "pricing.currency": "EUR",
  };
  await patchLeaf("siteSettings-it", pricingFields, "siteSettings");
  await patchLeaf("siteSettings-en", pricingFields, "siteSettings");

  // --- Task 2: content edits ---
  await patchLeaf(
    "pillarPage-coppia-it",
    { "factsStrip.items[0].value": "60 minuti, 130 €" },
    "pillarPage",
  );
  await patchLeaf(
    "pillarPage-coppia-en",
    { "factsStrip.items[0].value": "60 minutes, €130" },
    "pillarPage",
  );

  await patchLeaf(
    "faqItem-coppia-2-it",
    {
      'answer[_key=="faq-answer-1"].children[_key=="faq-answer-span-1"].text':
        "Sessanta minuti. Il costo è di 130 € a seduta, uguale in studio e online.",
    },
    "faqItem",
  );
  await patchLeaf(
    "faqItem-coppia-2-en",
    {
      'answer[_key=="faq-answer-1"].children[_key=="faq-answer-span-1"].text':
        "Sixty minutes. The fee is €130 per session, the same in the studio and online.",
    },
    "faqItem",
  );

  await patchLeaf(
    "pricePage-it",
    {
      'body[_key=="blk-1"].children[_key=="blk-1-span"].text':
        "Una seduta individuale dura 45 minuti e costa 100 €. Una seduta di coppia dura 60 minuti e costa 130 €. Il prezzo è lo stesso in ogni sede — Milano, Monza, Cernusco sul Naviglio — e online.",
      "seo.metaDescription":
        "Seduta individuale 100 € (45 minuti), seduta di coppia 130 € (60 minuti). Stesso prezzo in studio e online. Detrazione del 19% sui pagamenti tracciabili.",
    },
    "pricePage",
  );
  await patchLeaf(
    "pricePage-en",
    {
      'body[_key=="blk-1"].children[_key=="blk-1-span"].text':
        "An individual session lasts 45 minutes and costs €100. A couple session lasts 60 minutes and costs €130. The price is the same at every location — Milan, Monza, Cernusco sul Naviglio — and online.",
      "seo.metaDescription":
        "Individual session €100 (45 minutes), couple session €130 (60 minutes). Same price in the studio and online. 19% tax deduction on traceable payments.",
    },
    "pricePage",
  );

  await patchLeaf(
    "chiSonoSection-it",
    {
      "howIWork.parts[0].body[0]":
        "Dura quarantacinque minuti — sessanta se venite in coppia. Mi racconti cosa succede — da quanto, in quali situazioni, cosa hai già provato a fare. Non è un test e non richiede di aver già capito qualcosa: le domande le faccio io.",
    },
    "chiSonoSection",
  );
  await patchLeaf(
    "chiSonoSection-en",
    {
      "howIWork.parts[0].body[0]":
        "Forty-five minutes — sixty if you come as a couple. You tell me what's happening — how long, in what situations, what you've already tried. It isn't a test and it doesn't require having worked anything out beforehand: I ask the questions.",
    },
    "chiSonoSection",
  );

  console.log("\n=== pricing update: all patches committed ===");
}

main();
