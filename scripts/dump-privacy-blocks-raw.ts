import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  for (const id of ["privacyPage-it", "privacyPage-en"]) {
    const doc = await client.getDocument(id);
    if (!doc) continue;
    const body = (doc as { body?: unknown[] }).body ?? [];
    console.log(`\n=== ${id} block[3] ===`);
    console.log(JSON.stringify(body[3], null, 2));
    console.log(`\n=== ${id} block[59] ===`);
    console.log(JSON.stringify(body[59], null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
