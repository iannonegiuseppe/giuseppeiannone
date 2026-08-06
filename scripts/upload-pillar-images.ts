import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

// Pillar rollout — uploads the 5 hero images for the non-blocked areas
// (couples-therapy.jpg is not uploaded: that page stays unbuilt). Prints
// each resulting asset _id so the pillar-page write script can reference
// them directly rather than re-uploading or guessing IDs.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const files: { area: string; file: string }[] = [
  { area: "panic", file: "Panic-attacks-and-agoraphobia.jpg" },
  { area: "relazioni", file: "Relationship-difficulties.jpg" },
  { area: "sessuali", file: "Sexual-difficulties.jpg" },
  { area: "stress", file: "Stress-and-burnout.jpg" },
  { area: "trauma", file: "Trauma.jpg" },
];

async function main() {
  const results: Record<string, string> = {};
  for (const { area, file } of files) {
    const filePath = path.join("contents", file);
    const buffer = fs.readFileSync(filePath);
    const asset = await client.assets.upload("image", buffer, { filename: file });
    results[area] = asset._id;
    console.log(`${area}: uploaded ${file} -> ${asset._id} (${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height})`);
  }
  fs.writeFileSync("scripts/.pillar-image-assets.json", JSON.stringify(results, null, 2));
  console.log("\nWritten to scripts/.pillar-image-assets.json");
}

main();
