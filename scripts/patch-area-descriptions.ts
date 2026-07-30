import { createClient } from "@sanity/client";

// Aree card-grid rebuild — replaces each area document's own `descriptor`
// field (the previous [segnaposto]-tagged one-liner) with the real draft
// sentence. Patches each of the 12 area documents (6 areas x 2 languages)
// directly by _id — dot-path .set() on "descriptor" only, never touching
// title/slug/order/language on the same document.
//
// DRAFT — NOT APPROVED. Real, finished-reading prose, not
// [segnaposto]-style placeholders, but not reviewed or signed off by
// Giuseppe. Logged in docs/pre-launch.md as well.
//
// §9 check: run via the ACTUAL Sanity validator (deontologyCheck,
// src/sanity/schemaTypes/lib/deontologyValidator.ts) against all six IT
// strings before this script was run — all passed. These describe states/
// experiences and name disorders only — no outcome promises, no urgency.
// EN checked by hand against the same categories (no automated EN
// validator — pre-existing, disclosed gap).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary write-scoped " +
      "token in the Sanity dashboard (API → Tokens → Add API token, " +
      '"Editor" permission), set it in .env.local, run this script, ' +
      "then delete the token again.",
  );
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-07-05",
  useCdn: false,
});

const DESCRIPTORS: Record<string, string> = {
  "area-ansia-it":
    "Quando la preoccupazione diventa costante e occupa le giornate, anche quando non c'è un motivo preciso.",
  "area-panico-it":
    "Il corpo che si allarma all'improvviso, e i luoghi che si iniziano a evitare per non rischiare.",
  "area-depressione-it":
    "Quando l'energia e l'interesse si spengono, e anche le cose semplici richiedono uno sforzo.",
  "area-sessuali-it":
    "Difficoltà nell'intimità che spesso si intrecciano con ansia, stress e con la relazione di coppia.",
  "area-stress-it":
    "Quando la stanchezza non si recupera più con il riposo e il lavoro occupa tutto lo spazio.",
  "area-relazionali-it":
    "Nei legami che contano, quando comunicare diventa faticoso o ci si sente sempre in secondo piano.",

  "area-ansia-en":
    "When worry becomes constant and takes over your days, even without a clear reason.",
  "area-panico-en":
    "The body that suddenly sounds the alarm, and the places you start avoiding just in case.",
  "area-depressione-en":
    "When energy and interest fade, and even simple things take real effort.",
  "area-sessuali-en":
    "Difficulties with intimacy that are often tangled up with anxiety, stress, and the relationship itself.",
  "area-stress-en":
    "When tiredness stops going away with rest, and work takes up all the space.",
  "area-relazionali-en":
    "In relationships that matter, when communicating feels exhausting or you always feel like an afterthought.",
};

async function getDescriptor(id: string) {
  return client.fetch(`*[_id == $id][0]{ title, descriptor }`, { id });
}

async function patchDoc(id: string, descriptor: string) {
  const before = await getDescriptor(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before));

  await client.patch(id).set({ descriptor }).commit();

  const after = await getDescriptor(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after));
}

async function main() {
  for (const [id, descriptor] of Object.entries(DESCRIPTORS)) {
    await patchDoc(id, descriptor);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
