import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  await client
    .patch("chiSonoSection-it")
    .set({ tagline: "Quattordici anni fra formazione clinica, ricerca e reparti." })
    .commit();
  console.log("chiSonoSection-it: tagline updated");

  await client
    .patch("chiSonoSection-en")
    .set({ tagline: "Fourteen years across clinical training, research and hospital wards." })
    .commit();
  console.log("chiSonoSection-en: tagline updated");

  const it = await client.fetch(`*[_id=="chiSonoSection-it"][0]{tagline}`);
  const en = await client.fetch(`*[_id=="chiSonoSection-en"][0]{tagline}`);
  console.log("\nre-fetched IT:", JSON.stringify(it));
  console.log("re-fetched EN:", JSON.stringify(en));
}

main();
