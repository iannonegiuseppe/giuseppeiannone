import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

// Stage 2c — uploads the client's re-encoded hero background video assets
// (hero-1920.mp4 desktop/1080p, hero-1280.mp4 mobile/720p, poster.jpg) to
// Sanity once each, then references the SAME three assets from both
// homePage-it and homePage-en — never a second upload of the same bytes.
// patch.set only, on hero.backgroundVideoDesktop/-Mobile/-Poster; nothing
// else on either document is touched. Never createOrReplace.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const ROOT = path.resolve(__dirname, "..");

async function main() {
  console.log("Uploading hero-1920.mp4 (desktop, 1080p)...");
  const desktopAsset = await client.assets.upload(
    "file",
    fs.createReadStream(path.join(ROOT, "hero-1920.mp4")),
    { filename: "hero-1920.mp4" },
  );
  console.log("  desktop asset _id:", desktopAsset._id);

  console.log("Uploading hero-1280.mp4 (mobile, 720p)...");
  const mobileAsset = await client.assets.upload(
    "file",
    fs.createReadStream(path.join(ROOT, "hero-1280.mp4")),
    { filename: "hero-1280.mp4" },
  );
  console.log("  mobile asset _id:", mobileAsset._id);

  console.log("Uploading poster.jpg...");
  const posterAsset = await client.assets.upload(
    "image",
    fs.createReadStream(path.join(ROOT, "poster.jpg")),
    { filename: "poster.jpg" },
  );
  console.log("  poster asset _id:", posterAsset._id);

  console.log("\nAll uploads complete:");
  console.log("  desktop:", desktopAsset._id);
  console.log("  mobile: ", mobileAsset._id);
  console.log("  poster: ", posterAsset._id);

  const docs: { id: string; alt: string }[] = [
    { id: "homePage-it", alt: "Dr. Giuseppe Iannone nel suo studio" },
    { id: "homePage-en", alt: "Dr. Giuseppe Iannone in his practice" },
  ];

  for (const { id, alt } of docs) {
    console.log(`\nPatching ${id}...`);
    await client.createIfNotExists({ _id: id, _type: "homePage" });
    await client
      .patch(id)
      .set({
        "hero.backgroundVideoDesktop": {
          _type: "file",
          asset: { _type: "reference", _ref: desktopAsset._id },
        },
        "hero.backgroundVideoMobile": {
          _type: "file",
          asset: { _type: "reference", _ref: mobileAsset._id },
        },
        "hero.backgroundVideoPoster": {
          _type: "image",
          asset: { _type: "reference", _ref: posterAsset._id },
          alt,
        },
      })
      .commit();
    console.log(`  ${id} patched.`);
  }

  console.log("\nVerifying...");
  for (const { id } of docs) {
    const result = await client.fetch(
      `*[_id == $id][0]{
        "desktopRef": hero.backgroundVideoDesktop.asset._ref,
        "mobileRef": hero.backgroundVideoMobile.asset._ref,
        "posterRef": hero.backgroundVideoPoster.asset._ref,
        "posterAlt": hero.backgroundVideoPoster.alt
      }`,
      { id },
    );
    console.log(id, JSON.stringify(result));
  }
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
