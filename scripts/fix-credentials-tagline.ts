import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  // 1) Patch the real, rendered field: credentials.tagline (leaf path).
  await client
    .patch("chiSonoSection-it")
    .set({ "credentials.tagline": "Quattordici anni fra formazione clinica, ricerca e reparti." })
    .commit();
  console.log("chiSonoSection-it: credentials.tagline patched");

  await client
    .patch("chiSonoSection-en")
    .set({ "credentials.tagline": "Fourteen years across clinical training, research and hospital wards." })
    .commit();
  console.log("chiSonoSection-en: credentials.tagline patched");

  // 2) Unset the orphaned root-level `tagline` field — only that key.
  await client.patch("chiSonoSection-it").unset(["tagline"]).commit();
  console.log("chiSonoSection-it: root tagline unset");

  await client.patch("chiSonoSection-en").unset(["tagline"]).commit();
  console.log("chiSonoSection-en: root tagline unset");

  // Re-fetch and confirm.
  const it = await client.fetch(`*[_id=="chiSonoSection-it"][0]{tagline, "credentialsTagline": credentials.tagline}`);
  const en = await client.fetch(`*[_id=="chiSonoSection-en"][0]{tagline, "credentialsTagline": credentials.tagline}`);
  console.log("\n=== re-fetched IT ===");
  console.log(JSON.stringify(it, null, 2));
  console.log("root tagline present:", "tagline" in it);
  console.log("\n=== re-fetched EN ===");
  console.log(JSON.stringify(en, null, 2));
  console.log("root tagline present:", "tagline" in en);
}

main();
