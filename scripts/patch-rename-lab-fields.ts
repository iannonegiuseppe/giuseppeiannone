import { createClient } from "@sanity/client";

// Design-lab-to-production migration, Stage 2b-2: copies the design-lab
// -Lab field groups' live data into their renamed, now-shared
// replacements — sediLab -> locations, spaziLab -> spaces, contactLab ->
// contactSection. The old keys are NOT unset/deleted here (schema-level
// deprecation notes already added in homePage.ts) — this script only
// copies data forward via patch.set, createIfNotExists first, never
// createOrReplace, per project convention.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const RENAMES = [
  { from: "sediLab", to: "locations" },
  { from: "spaziLab", to: "spaces" },
  { from: "contactLab", to: "contactSection" },
];

async function migrateDoc(id: string) {
  await client.createIfNotExists({ _id: id, _type: "homePage" });

  const before = await client.fetch(
    `*[_id == $id][0]{ _id, sediLab, spaziLab, contactLab, locations, spaces, contactSection }`,
    { id },
  );
  console.log(`BEFORE ${id}:`, JSON.stringify(before, null, 2));

  const patch: Record<string, unknown> = {};
  for (const { from, to } of RENAMES) {
    const value = before?.[from];
    if (value === undefined || value === null) {
      console.log(`  SKIP ${id}.${from} -> ${to}: source field empty`);
      continue;
    }
    patch[to] = value;
  }

  if (Object.keys(patch).length > 0) {
    await client.patch(id).set(patch).commit();
  }

  const after = await client.fetch(
    `*[_id == $id][0]{ _id, sediLab, spaziLab, contactLab, locations, spaces, contactSection }`,
    { id },
  );
  console.log(`AFTER  ${id}:`, JSON.stringify(after, null, 2));

  // Verify: new value deep-equals old value, and old value is untouched.
  for (const { from, to } of RENAMES) {
    const oldStillThere = JSON.stringify(before?.[from]) === JSON.stringify(after?.[from]);
    const copiedCorrectly = JSON.stringify(before?.[from]) === JSON.stringify(after?.[to]);
    console.log(`  VERIFY ${id}: ${from} unchanged=${oldStillThere}, ${to} matches ${from}=${copiedCorrectly}`);
  }
}

async function main() {
  await migrateDoc("homePage-it");
  await migrateDoc("homePage-en");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
