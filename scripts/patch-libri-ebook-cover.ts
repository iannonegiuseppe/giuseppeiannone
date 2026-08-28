import { createClient } from "@sanity/client";
import fs from "fs";

// Libri ebook cover swap — replaces the free guide's cover image
// (guideCoverImage) on both the IT and EN libriPage documents (separate
// document-internationalization documents, each with its own field
// value — not a shared reference, so both need patching even though
// they happened to point at the same old asset). Only the asset
// reference is touched via patch().set() on the specific sub-path —
// never createOrReplace, and never the whole guideCoverImage object —
// so the existing, per-locale alt text is left untouched.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  const buffer = fs.readFileSync("contents/ebook-official.jpg");
  const asset = await client.assets.upload("image", buffer, { filename: "ebook-official.jpg" });
  console.log(`uploaded -> ${asset._id} (${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height})`);

  for (const docId of ["libriPage-it", "libriPage-en"]) {
    await client
      .patch(docId)
      .set({ "guideCoverImage.asset": { _type: "reference", _ref: asset._id } })
      .commit();
    console.log(`patched ${docId} -> guideCoverImage.asset = ${asset._id}`);
  }
}
main();
