import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  for (const id of ["privacyPage-it", "privacyPage-en"]) {
    const doc = await client.getDocument(id);
    if (!doc) {
      console.log(`${id}: NOT FOUND`);
      continue;
    }
    console.log(`\n=== ${id} ===`);
    const body = (doc as { body?: unknown[] }).body ?? [];
    body.forEach((block, i) => {
      const b = block as { _type: string; style?: string; children?: { text: string }[] };
      if (b._type === "block") {
        const text = (b.children ?? []).map((c) => c.text).join("");
        console.log(`[${i}] (${b.style ?? "normal"}) ${text}`);
      } else {
        console.log(`[${i}] (${b._type})`, JSON.stringify(block).slice(0, 200));
      }
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
