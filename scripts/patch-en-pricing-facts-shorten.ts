import { createClient } from "@sanity/client";

// Follow-up to patch-en-service-pages-corrections.ts: facts[3].value's own
// verbatim replacement wrapped to 3 lines on the facts card (85 chars),
// visibly longer than its three siblings (1-2 lines each) — reads as an
// error, not as detail. Shortened to the same fact set, tighter phrasing.
// pricePage-it is never referenced below.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  const beforeItRev = await client.fetch<string>(`*[_id == "pricePage-it"][0]._rev`);
  console.log("BEFORE pricePage-it._rev:", beforeItRev);

  await client
    .patch("pricePage-en")
    .set({ "facts[3].value": "19% deduction, traceable payments, Italian tax returns only" })
    .commit();

  const afterItRev = await client.fetch<string>(`*[_id == "pricePage-it"][0]._rev`);
  console.log("AFTER  pricePage-it._rev:", afterItRev, "unchanged:", beforeItRev === afterItRev);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
