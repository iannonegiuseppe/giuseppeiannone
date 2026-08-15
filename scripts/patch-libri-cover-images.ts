import { createClient } from "@sanity/client";
import { createReadStream } from "fs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN.");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

// Alt text, written per locale (see this pass's own report) — describes
// what's actually visible, not just the filename. The guide cover's
// alt intentionally doesn't retype its own baked-in Italian title
// verbatim in the English version; it describes the object honestly
// instead (a screen reader announcing an all-caps Italian sentence
// character-by-character to an English speaker isn't more informative
// than describing what it is).
const altGuideIt =
  "Copertina 3D del manuale gratuito, con il titolo «Affronta ansia e panico con la psicoterapia online» sullo schermo di un laptop durante una videochiamata";
const altGuideEn =
  "3D mockup of the free guide's cover, showing its Italian title on a laptop screen during a video call";

const altBookIt = "Copertina del libro «E quindi uscimmo a riveder le stelle» di Giuseppe Iannone, con il suo ritratto";
const altBookEn = 'Cover of the book "E quindi uscimmo a riveder le stelle" by Giuseppe Iannone, featuring his portrait';

async function main() {
  console.log("Uploading assets...");
  const [guideAsset, bookAsset] = await Promise.all([
    client.assets.upload("image", createReadStream("contents/ebook.png"), { filename: "ebook-cover.png" }),
    client.assets.upload("image", createReadStream("contents/real-book.jpg"), { filename: "real-book-cover.jpg" }),
  ]);
  console.log("Uploaded:", guideAsset._id, bookAsset._id);

  const guideImageRef = { _type: "image", asset: { _type: "reference", _ref: guideAsset._id } };
  const bookImageRef = { _type: "image", asset: { _type: "reference", _ref: bookAsset._id } };

  const tx = client.transaction();
  tx.patch("libriPage-it", (p) =>
    p.set({
      guideCoverImage: { ...guideImageRef, alt: altGuideIt },
      "book.coverImage": { ...bookImageRef, alt: altBookIt },
    }),
  );
  tx.patch("libriPage-en", (p) =>
    p.set({
      guideCoverImage: { ...guideImageRef, alt: altGuideEn },
      "book.coverImage": { ...bookImageRef, alt: altBookEn },
    }),
  );

  const result = await tx.commit();
  console.log("Patched:", result.results.map((r) => r.id));
}
main().catch(console.error);
