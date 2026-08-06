import { createClient } from "@sanity/client";

// Prezzi build pass — pricePage-it/en. Facts only, verbatim to what was
// given: one price (100 €/45 min), same at every location and online; the
// 19% deduction stated neutrally with its traceable-payment condition, per
// docs/design-direction.md §9. No package, bundle, session count, or course
// duration anywhere in this copy. pricePage's schema (defineSimplePageType)
// has no dedicated price/rate fields — title + portableText body + seo —
// so the facts are plain paragraphs, not a structured price-line array;
// not a schema change, using what's there today. createIfNotExists +
// patch.set, never createOrReplace.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

function p(text: string, key: string) {
  return {
    _key: key,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `${key}-span`, _type: "span", marks: [], text }],
  };
}

const bodyIt = [
  p(
    "Una seduta dura 45 minuti e costa 100 €. Il prezzo è lo stesso in ogni sede — Milano, Monza, Cernusco sul Naviglio — e online.",
    "blk-1",
  ),
  p("Il pagamento si effettua in contanti, con bonifico o con carta. Viene sempre rilasciata ricevuta.", "blk-2"),
  p(
    "La spesa è detraibile al 19% come spesa sanitaria, per i pagamenti tracciabili.",
    "blk-3",
  ),
];

const bodyEn = [
  p(
    "A session lasts 45 minutes and costs €100. The price is the same at every location — Milan, Monza, Cernusco sul Naviglio — and online.",
    "blk-1",
  ),
  p("Payment can be made in cash, by bank transfer, or by card. A receipt is always issued.", "blk-2"),
  p(
    "The fee is deductible at 19% as a medical expense, for traceable payments.",
    "blk-3",
  ),
];

async function patchDoc(id: string, fields: Record<string, unknown>) {
  await client.createIfNotExists({ _id: id, _type: "pricePage" });
  await client.patch(id).set(fields).commit();
  console.log(`\n--- ${id} ---`);
  console.log(JSON.stringify(fields, null, 2));
}

async function main() {
  await patchDoc("pricePage-it", {
    title: "Prezzi",
    body: bodyIt,
    seo: {
      metaTitle: "Prezzi — Giuseppe Iannone, Psicoterapeuta",
      metaDescription:
        "Il costo di una seduta: 100 €, 45 minuti, stesso prezzo in studio e online. Detrazione del 19% come spesa sanitaria sui pagamenti tracciabili.",
      noIndex: true,
    },
    language: "it",
  });

  await patchDoc("pricePage-en", {
    title: "Pricing",
    body: bodyEn,
    seo: {
      metaTitle: "Pricing — Giuseppe Iannone, Psychotherapist",
      metaDescription:
        "The cost of a session: €100, 45 minutes, the same price in person and online. 19% tax deduction as a medical expense on traceable payments.",
      noIndex: true,
    },
    language: "en",
  });

  console.log("\n=== pricePage: done ===");
}

main();
