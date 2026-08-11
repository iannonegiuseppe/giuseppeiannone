import { createClient } from "@sanity/client";
import fs from "fs";

// Timeline proportions pass — no real photos exist yet for any of these
// eight biographical entries. Rather than judge the entries' spacing/
// image-vs-text layout against an empty field on every one, this
// attaches PLACEHOLDER images from public/interiors/ (neutral, peopleless
// stock room renders already sitting unused in the repo) to five of the
// eight entries — enough to see the "image left, text right" layout and
// the "no image, same left edge" layout side by side, without touching
// the seven pillarPage hero images the mosaic above already uses.
//
// Alt text is deliberately empty: these are decorative mood images next
// to real chapter text, not carriers of unique information, so the
// correct accessible pattern is alt="" (skipped by screen readers)
// rather than inventing a description for a stock photo that isn't
// really "of" anything the entry describes. The PLACEHOLDER flag lives
// in the asset filename/title (visible in Studio's media browser) and in
// chiSonoSection.ts's own field description instead — never in public-
// facing alt text.
//
// Entries left WITHOUT an image, deliberately: #1 Siena (the panic
// attack itself — the most personal beat, doesn't need generic stock
// diluting it), #5 "due borse di ricerca" (no distinct visual beat from
// #3/#4, already both imaged), #8 "Oggi" (the page's own contact section
// immediately below already carries a real photo of Giuseppe).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

// index -> local file. Indices match populate-chisono-timeline.ts's own
// 0-based array order (0 Siena, 1 Amsterdam, 2 Maastricht/training, 3
// Maastricht/mice, 4 Italia/grants, 5 Milano/specialisation, 6 Brescia, 7
// Oggi/Today) — identical order in both locale documents.
const ASSIGNMENTS: { index: number; file: string; label: string }[] = [
  { index: 1, file: "public/interiors/interior-4.jpg", label: "PLACEHOLDER — Amsterdam (stock interior, armchair)" },
  { index: 2, file: "public/interiors/interior-1.jpg", label: "PLACEHOLDER — Maastricht training (stock interior, study desk)" },
  { index: 3, file: "public/interiors/interior-2.jpg", label: "PLACEHOLDER — Maastricht research (stock interior, office)" },
  { index: 5, file: "public/interiors/interior-5.jpg", label: "PLACEHOLDER — Milano specialisation (stock interior, study)" },
  { index: 6, file: "public/interiors/interior-3.jpg", label: "PLACEHOLDER — Brescia (stock interior, lobby)" },
];

async function uploadAll() {
  const uploaded: { index: number; assetId: string }[] = [];
  for (const { index, file, label } of ASSIGNMENTS) {
    const buffer = fs.readFileSync(file);
    const asset = await client.assets.upload("image", buffer, { filename: label });
    console.log(`uploaded [${index}] ${label} -> ${asset._id}`);
    uploaded.push({ index, assetId: asset._id });
  }
  return uploaded;
}

async function patchLocale(locale: "it" | "en", uploaded: { index: number; assetId: string }[]) {
  const id = `chiSonoSection-${locale}`;
  const patch: Record<string, unknown> = {};
  for (const { index, assetId } of uploaded) {
    patch[`timeline[${index}].image`] = {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      alt: "",
    };
  }
  await client.patch(id).set(patch).commit();
  console.log(`patched ${id}: indices ${uploaded.map((u) => u.index).join(", ")}`);
}

async function main() {
  const uploaded = await uploadAll();
  await patchLocale("it", uploaded);
  await patchLocale("en", uploaded);
  console.log("\n=== chi sono timeline images: done ===");
}

main();
