import { createClient } from "@sanity/client";

// Practical-details pass — retires the 8 old label/value fields
// (durataLabel/-Value, pagamentoLabel/-Value, ricevutaLabel/-Value,
// detrazioneLabel/-Value) in favour of a single tariffe.detailsItems
// array, one plain phrase per practical fact (the old label folded into
// the phrase itself: "Ricevuta sempre rilasciata" instead of a separate
// "Ricevuta" caption over "Sempre rilasciata"). detrazioneFootnote is
// UNCHANGED — same field, same value as the previous pass, still the
// always-rendered home for the deduction's traceable-payment condition.
//
// DRAFT — NOT APPROVED. §9 checked via the actual deontologyCheck /
// deontologyCheckAllowingSymbols validators for IT (item 4 is the one
// that needs the "%" carve-out) — see this pass's own report. EN checked
// by hand.
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

const IT_ITEMS = [
  "45 minuti",
  "Contanti, bonifico o carta",
  "Ricevuta sempre rilasciata",
  "Detrazione 19% come spesa sanitaria",
];

const EN_ITEMS = [
  "45 minutes",
  "Cash, bank transfer, or card",
  "Receipt always issued",
  "19% deduction as a medical expense",
];

const UNSET_OLD_FIELDS = [
  "tariffe.durataLabel",
  "tariffe.durataValue",
  "tariffe.pagamentoLabel",
  "tariffe.pagamentoValue",
  "tariffe.ricevutaLabel",
  "tariffe.ricevutaValue",
  "tariffe.detrazioneLabel",
  "tariffe.detrazioneValue",
];

async function getFields(id: string) {
  return client.fetch(`*[_id == $id][0]{ "detailsItems": tariffe.detailsItems, "detrazioneFootnote": tariffe.detrazioneFootnote }`, { id });
}

async function patchDoc(id: string, items: string[]) {
  const before = await getFields(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));

  await client.patch(id).unset(UNSET_OLD_FIELDS).set({ "tariffe.detailsItems": items }).commit();

  const after = await getFields(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("homePage-it", IT_ITEMS);
  await patchDoc("homePage-en", EN_ITEMS);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
