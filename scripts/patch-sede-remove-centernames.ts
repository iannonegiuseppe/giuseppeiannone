import { createClient } from "@sanity/client";

// Client decision: partner-centre names (Bilingual Therapy, Dinamica
// Bicocca, Centro di Psicologia — "Centro Andrologico Italiano" was
// already removed entirely in an earlier pass, see patch-locations-
// sede.ts's own comment, and isn't live) must not appear anywhere on the
// site. `centerName` stays in the schema (sede.ts) — not deleted, per
// instruction, "in case the decision changes" — this script only clears
// the VALUE on the live documents via patch().unset(), never
// createOrReplace, so nothing else on these documents is touched.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

// Every doc/address-key pair known (from the live query run before this
// script) to currently hold a centerName value. sede-monza has none in
// either locale — deliberately not listed, nothing to clear there.
const TARGETS = [
  { id: "sede-milano", keys: ["addr-1", "addr-2"] },
  { id: "sede-milano-en", keys: ["addr-1", "addr-2"] },
  { id: "sede-cernusco", keys: ["addr-2"] },
  { id: "sede-cernusco-en", keys: ["addr-2"] },
];

async function main() {
  for (const { id, keys } of TARGETS) {
    const before = await client.fetch(`*[_id == $id][0]`, { id });
    console.log(`BEFORE ${id}:`, JSON.stringify(before));

    const paths = keys.map((key) => `addresses[_key=="${key}"].centerName`);
    await client.patch(id).unset(paths).commit();

    const after = await client.fetch(`*[_id == $id][0]`, { id });
    console.log(`AFTER  ${id}:`, JSON.stringify(after));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
