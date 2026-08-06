import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

// Subtopic rollout — uploads the 4 hero images for agoraphobia, social
// anxiety, health anxiety and insomnia. Prints each resulting asset _id
// so the subtopic-page write scripts can reference them directly.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const files: { area: string; file: string }[] = [
  { area: "agorafobia", file: "Agoraphobia.jpg" },
  { area: "ansia-sociale", file: "Social-anxiety.jpg" },
  { area: "ansia-da-malattia", file: "Health-anxiety.jpg" },
  { area: "insonnia-da-ansia", file: "Anxiety-and-insomnia.jpg" },
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
  fs.writeFileSync("scripts/.subtopic-image-assets.json", JSON.stringify(results, null, 2));
  console.log("\nWritten to scripts/.subtopic-image-assets.json");
}

main();
