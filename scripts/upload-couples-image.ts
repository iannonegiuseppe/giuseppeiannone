import { createClient } from "@sanity/client";
import fs from "fs";

// Couples pillar — uploads the single hero image now that couples
// therapy is unblocked.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  const buffer = fs.readFileSync("contents/Couples-therapy.jpg");
  const asset = await client.assets.upload("image", buffer, { filename: "Couples-therapy.jpg" });
  console.log(`uploaded -> ${asset._id} (${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height})`);
}

main();
