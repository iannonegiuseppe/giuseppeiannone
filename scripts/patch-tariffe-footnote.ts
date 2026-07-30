import { createClient } from "@sanity/client";

// Layout-fix pass: shortens tariffe.detrazioneValue back to the bare fact
// (was "19% come spesa sanitaria, con pagamento tracciabile" — too long to
// fit the new compact, one-line-per-fact footer cluster) and moves the
// traceable-payment condition into a NEW, always-rendered field,
// detrazioneFootnote, below the whole four-fact cluster. The condition is
// not dropped (§9: the deduction must never read as unconditional), just
// relocated — dot-path .set() on these two fields only, everything else
// in tariffe untouched.
//
// DRAFT — NOT APPROVED. §9 checked via the actual deontologyCheck /
// deontologyCheckAllowingSymbols validators for IT — see this pass's own
// report. EN checked by hand.
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

const IT_PATCH = {
  "tariffe.detrazioneValue": "19% come spesa sanitaria",
  "tariffe.detrazioneFootnote": "La detrazione si applica ai pagamenti tracciabili.",
};

const EN_PATCH = {
  "tariffe.detrazioneValue": "19% as a medical expense",
  "tariffe.detrazioneFootnote": "The deduction applies to traceable payments.",
};

async function getFields(id: string) {
  return client.fetch(`*[_id == $id][0]{ "detrazioneValue": tariffe.detrazioneValue, "detrazioneFootnote": tariffe.detrazioneFootnote }`, { id });
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
