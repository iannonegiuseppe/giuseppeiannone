import { createClient } from "@sanity/client";

// "Come lavoro" card evening-out pass — card two ("Gli incontri
// successivi" / "The sessions after that") was much longer than its
// three (IT) / four (EN) siblings, per explicit instruction: replace
// its body with the shortened copy below, both locales, index-based
// (howIWork.parts[1].body — these array items carry no _key, same as
// every other item already in this field; index is the only addressing
// this data model supports today). Title and every other part/field
// are untouched.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const bodyIt = [
  "I primi due o tre incontri sono ravvicinati: settimanali, o a distanza di una decina di giorni. Poi il ritmo si allarga, di solito un incontro ogni due o tre settimane.",
  "Il lavoro procede su due binari: capire il meccanismo — non l'ansia in generale, ma la tua — e ricostruire margine dove il campo si era ristretto.",
];

const bodyEn = [
  "The first two or three sessions are close together: weekly, or about ten days apart. Then the rhythm opens out, usually one session every two or three weeks.",
  "The work runs on two tracks: understanding the mechanism — not anxiety in general, but yours — and rebuilding room where the field had narrowed.",
];

async function patchPart2Body(id: string, body: string[]) {
  const doc = await client.getDocument(id);
  const parts = (doc as { howIWork?: { parts?: { title?: string }[] } } | undefined)?.howIWork?.parts;
  if (!parts || !parts[1]) throw new Error(`${id}: howIWork.parts[1] not found`);
  console.log(`${id}: patching part[1] "${parts[1].title}"`);
  await client.patch(id).set({ "howIWork.parts[1].body": body }).commit();
}

async function main() {
  await patchPart2Body("chiSonoSection-it", bodyIt);
  await patchPart2Body("chiSonoSection-en", bodyEn);
  console.log("\n=== card two body shortened, both locales: done ===");
}

main();
