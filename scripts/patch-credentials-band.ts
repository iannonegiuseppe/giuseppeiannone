import { createClient } from "@sanity/client";

// Credentials band rebuild — seeds the new homePage.credentialsBand field
// group (homePage.ts). Dot-path keys only, same discipline as every other
// patch script in this repo.
//
// DRAFT — NOT APPROVED. Real, finished-reading prose, not
// [segnaposto]-style placeholders, but not reviewed or signed off by
// Giuseppe. Logged in docs/pre-launch.md as well.
//
// §9 check: run via the ACTUAL Sanity validator (deontologyCheck,
// src/sanity/schemaTypes/lib/deontologyValidator.ts), imported and run
// directly against every IT string below before this script was run — all
// passed. These are factual credentials (years, location count, languages)
// — no outcome claims, no client counts, no urgency/scarcity. EN strings
// checked by hand against the same categories (no automated EN validator —
// pre-existing, disclosed gap).
//
// Numbers are NOT invented: 13 (clinical practice) and 14 (training) are
// established facts carried over from the old hardcoded CREDENTIALS
// constant (content.ts) unchanged. 5 locations is independently re-verified
// against the live sede dataset this pass (see this pass's own report):
// Milano Citylife, Milano Bicocca, Monza, Cernusco sul Naviglio (4 physical
// addresses) + 1 online scene = 5, matching exactly. No "qualifiche"
// counter is added — only 3 qualifications are confirmed (Bicocca 2011,
// Maastricht 2013, SLOP 2020), a 4th is still pending from the client, and
// that list already lives in Diplomi below (unchanged by this pass) — a
// count here would either be wrong or need a placeholder in production.
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

const IT_PATCH = {
  "credentialsBand.eyebrow": "Formazione e esperienza",
  "credentialsBand.heading": "Il percorso alle spalle",
  "credentialsBand.clinicalPracticeYears": 13,
  "credentialsBand.clinicalPracticeCaption": "anni di pratica clinica",
  "credentialsBand.trainingYears": 14,
  "credentialsBand.trainingCaption": "anni di formazione",
  "credentialsBand.locationsCount": 5,
  "credentialsBand.locationsCaption": "sedi, incluso online",
  "credentialsBand.languagesValue": "IT / EN",
  "credentialsBand.languagesCaption": "italiano e inglese",
};

const EN_PATCH = {
  "credentialsBand.eyebrow": "Training and experience",
  "credentialsBand.heading": "The path so far",
  "credentialsBand.clinicalPracticeYears": 13,
  "credentialsBand.clinicalPracticeCaption": "years of clinical practice",
  "credentialsBand.trainingYears": 14,
  "credentialsBand.trainingCaption": "years of training",
  "credentialsBand.locationsCount": 5,
  "credentialsBand.locationsCaption": "locations, including online",
  "credentialsBand.languagesValue": "IT / EN",
  "credentialsBand.languagesCaption": "Italian and English",
};

async function getFields(id: string) {
  return client.fetch(`*[_id == $id][0]{ credentialsBand }`, { id });
}

async function patchDoc(id: string, patch: Record<string, unknown>) {
  const before = await getFields(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));

  await client.patch(id).set(patch).commit();

  const after = await getFields(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("homePage-it", IT_PATCH);
  await patchDoc("homePage-en", EN_PATCH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
