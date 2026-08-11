import { createClient } from "@sanity/client";

// Stage B phase 2 — reorder step, deliberately its OWN pass, run only
// after every field write already committed (attach-diploma-scans.ts).
// Re-fetches the array fresh, reorders the exact same item objects
// in-memory (never reconstructs them field-by-field — that's how a byte
// would drift), writes back via .set('diplomi.items', reordered) only —
// never createOrReplace, never .set() on the whole diplomi object. Target
// order: siena (_key "qualification-fourth"), bicocca, maastricht, slop,
// opl — identical in both locales.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const TARGET_ORDER = [
  "qualification-fourth", // siena
  "qualification-bicocca",
  "qualification-maastricht",
  "qualification-slop",
  "qualification-opl",
];

async function fetchItems(docId: string) {
  return client.fetch(`*[_id == $id][0].diplomi.items`, { id: docId });
}

async function reorderDoc(docId: string) {
  const items = await fetchItems(docId);
  if (!Array.isArray(items)) throw new Error(`${docId}: diplomi.items is not an array`);

  const byKey = new Map(items.map((item: { _key: string }) => [item._key, item]));
  if (byKey.size !== TARGET_ORDER.length) {
    throw new Error(`${docId}: expected ${TARGET_ORDER.length} items, found ${byKey.size}`);
  }
  const reordered = TARGET_ORDER.map((key) => {
    const item = byKey.get(key);
    if (!item) throw new Error(`${docId}: missing item with _key "${key}"`);
    return item;
  });

  await client.patch(docId).set({ "diplomi.items": reordered }).commit();
}

async function main() {
  console.log("=== BEFORE ===");
  const beforeIt = await fetchItems("homePage-it");
  const beforeEn = await fetchItems("homePage-en");
  console.log("homePage-it order:", JSON.stringify(beforeIt.map((i: { _key: string }) => i._key)));
  console.log("homePage-en order:", JSON.stringify(beforeEn.map((i: { _key: string }) => i._key)));

  await reorderDoc("homePage-it");
  console.log("\nhomePage-it: reordered");
  await reorderDoc("homePage-en");
  console.log("homePage-en: reordered");

  console.log("\n=== AFTER (re-fetched) ===");
  const afterIt = await fetchItems("homePage-it");
  const afterEn = await fetchItems("homePage-en");
  console.log("homePage-it FULL DUMP:");
  console.log(JSON.stringify(afterIt, null, 2));
  console.log("\nhomePage-en FULL DUMP:");
  console.log(JSON.stringify(afterEn, null, 2));
}

main();
