import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

// First of the four consulting-room photographs — attaches contents/
// monza-office.jpg to sede-monza's single address (addr-1, Via Tolomeo 10),
// both locales, one shared asset (same "upload once, reference twice"
// pattern as every other it/en pair in this codebase). Idempotent lookup
// uses a distinctive filename, NOT "monza-office.jpg" — that generic name
// is exactly the shape that caused a real, silent collision in
// patch-chisono-portrait-09.ts (matched an unrelated pre-existing "09.jpg"
// asset by filename string alone). Checked live first: no existing asset
// named "monza-office.jpg" in this dataset today, but the distinctive name
// is used anyway, on the same reasoning — a filename this generic isn't
// guaranteed to stay unique as more content gets uploaded over time.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function uploadImageIfNeeded(absolutePath: string, filename: string): Promise<string> {
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
    { filename },
  );
  if (existing?._id) return existing._id;

  const buffer = fs.readFileSync(absolutePath);
  const asset = await client.assets.upload("image", buffer, { filename, contentType: "image/jpeg" });
  return asset._id;
}

const ALT = {
  it: "Studio di consulenza a Monza: scrivania in vetro con due sedute per i pazienti, poltroncina con cuscino verde acqua, parete turchese con quadro astratto e finestra affacciata sul verde.",
  en: "Consulting room in Monza: glass desk with two chairs for clients, an armchair with a teal cushion, a turquoise accent wall with an abstract painting, and a window overlooking greenery.",
};

const DOC_IDS = { it: "sede-monza", en: "sede-monza-en" } as const;
const ADDRESS_KEY = "addr-1";

async function main() {
  const filePath = path.join(process.cwd(), "contents/monza-office.jpg");
  const assetId = await uploadImageIfNeeded(filePath, "sede-monza-via-tolomeo-consulting-room.jpg");
  console.log("photo asset id:", assetId);

  for (const locale of ["it", "en"] as const) {
    const id = DOC_IDS[locale];

    const before = await client.fetch<{ addresses?: { _key: string; photo?: unknown }[] }>(
      `*[_id == $id][0]{addresses}`,
      { id },
    );
    console.log(`BEFORE ${id}:`, JSON.stringify(before));

    await client
      .patch(id)
      .set({
        [`addresses[_key=="${ADDRESS_KEY}"].photo`]: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
          alt: ALT[locale],
        },
      })
      .commit();

    const after = await client.fetch<{ addresses?: { _key: string; photo?: unknown }[] }>(
      `*[_id == $id][0]{addresses}`,
      { id },
    );
    console.log(`AFTER  ${id}:`, JSON.stringify(after));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
