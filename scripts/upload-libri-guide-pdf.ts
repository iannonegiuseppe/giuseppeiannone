import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

// Libri download pass — the free guide's real PDF, replacing the empty
// guidePdf field LibriForm.tsx has been waiting on (see libriPage.ts's own
// comment on that field). One asset, two references — same "one asset,
// two locale documents" pattern upload-anxiety-subtopic-heroes.ts already
// uses for hero images. Checks for an existing asset by originalFilename
// first: idempotent-by-filename dedup is only safe here because this
// filename is specific to this one document, not a generic name that could
// collide with an unrelated asset already in the dataset.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const FILENAME = "E-book-guarire-dagli-attacchi-di-panico.pdf";
const PAGE_COUNT = 10;

async function main() {
  const existing = await client.fetch<{ _id: string }[]>(
    `*[_type == "sanity.fileAsset" && originalFilename == $name]{_id}`,
    { name: FILENAME },
  );

  let assetId: string;
  if (existing.length > 0) {
    assetId = existing[0]!._id;
    console.log(`Reusing existing asset ${assetId} for ${FILENAME}`);
  } else {
    const filePath = path.join("contents", FILENAME);
    const buffer = fs.readFileSync(filePath);
    const asset = await client.assets.upload("file", buffer, {
      filename: FILENAME,
      contentType: "application/pdf",
    });
    assetId = asset._id;
    console.log(`Uploaded ${FILENAME} -> ${assetId} (${asset.size} bytes)`);
  }

  await client
    .patch("libriPage-it")
    .set({
      guidePdf: { _type: "file", asset: { _type: "reference", _ref: assetId } },
      metaLine: `${PAGE_COUNT} pagine · PDF · italiano`,
      indexLead: `Il manuale è breve di proposito: ${PAGE_COUNT} pagine, sei capitoli, nessun esercizio da compilare.`,
    })
    .commit();
  console.log("libriPage-it patched");

  await client
    .patch("libriPage-en")
    .set({
      guidePdf: { _type: "file", asset: { _type: "reference", _ref: assetId } },
      metaLine: `${PAGE_COUNT} pages · PDF · Italian`,
      indexLead: `The guide is deliberately short: ${PAGE_COUNT} pages, six chapters, nothing to fill in.`,
    })
    .commit();
  console.log("libriPage-en patched");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
