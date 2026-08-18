import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  const docs = await client.fetch(
    `*[_type == "sede"] | order(order asc) { _id, city, isOnline, language, addresses[]{_key, centerName, address, district, photo} }`
  );
  console.log(JSON.stringify(docs, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
