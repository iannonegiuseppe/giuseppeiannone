import { createClient } from "@sanity/client";

// Recognition rebuild pass — reshapes pillarPage.recognition.items from a
// plain string array into an array of {quote, subtopic?} objects (the
// schema change this pass also makes). Every existing string becomes
// {quote: <same string>, subtopic: undefined} — no data loss, subtopic
// left empty on all 26 (13 IT + 13 EN) since no subtopic pages exist yet
// for the anxiety area. Idempotent: skips a document whose items are
// already objects (re-running after a partial failure is safe).
//
// Run: npx tsx -r dotenv/config scripts/migrate-recognition-items-to-objects.ts dotenv_config_path=.env.local
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function migrateLocale(language: "it" | "en") {
  const docId = `pillarPage-anxiety-${language}`;
  const doc = await client.fetch<{ recognition?: { items?: unknown[] } } | null>(
    `*[_id == $docId][0]{recognition}`,
    { docId },
  );

  if (!doc?.recognition?.items) {
    console.log(`${docId}: no recognition.items, skipping`);
    return;
  }

  const items = doc.recognition.items;
  if (typeof items[0] !== "string") {
    console.log(`${docId}: items already objects, skipping (idempotent)`);
    return;
  }

  const migrated = (items as string[]).map((quote, i) => ({
    _key: `recognition-${language}-${i}`,
    _type: "recognitionItem",
    quote,
  }));

  console.log(`${docId}: migrating ${migrated.length} string items to objects`);
  console.log("  before[0]:", JSON.stringify(items[0]));
  console.log("  after[0]: ", JSON.stringify(migrated[0]));

  await client.patch(docId).set({ "recognition.items": migrated }).commit();
  console.log(`${docId}: done`);
}

async function main() {
  await migrateLocale("it");
  await migrateLocale("en");
}

main();
