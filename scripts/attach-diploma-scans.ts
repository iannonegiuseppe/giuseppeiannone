import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

// Stage B phase 2 — attach redacted scans to homePage.diplomi.items[] on
// both homePage-it/-en. Uploads ONLY from contents/redacted/ (5 webp files
// already redacted per Stage A's own OCR-verified pass) — never the
// originals in contents/, which still carry a codice fiscale + home
// address. Each file is uploaded exactly once; the resulting asset _id is
// reused as the `scan` reference on both locale documents, never
// re-uploaded per locale. Attaches to `scan` (the field the lightbox
// actually reads, per resolveDiplomiLabItems — see this pass's own
// report), sets scanRedacted: true (these files are genuinely redacted,
// confirmed in Stage A), and never touches `document` (dead field).
// patch.set on leaf paths addressed by each item's own _key only — never
// createOrReplace, never .set() on the whole diplomi object or the whole
// items array (except the explicit, separate reorder step in
// reorder-diplomi-items.ts).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const REDACTED_DIR = path.resolve(__dirname, "../contents/redacted");
const FILES = [
  "diploma-siena-2004.webp",
  "diploma-bicocca-2011.webp",
  "diploma-maastricht-2013.webp",
  "diploma-slop-2020.webp",
  "opl-iscrizione.webp",
] as const;

async function main() {
  const assetIds: Record<string, string> = {};

  for (const filename of FILES) {
    const filePath = path.join(REDACTED_DIR, filename);
    const buffer = fs.readFileSync(filePath);
    const asset = await client.assets.upload("image", buffer, { filename });
    assetIds[filename] = asset._id;
    console.log(`Uploaded ${filename} -> ${asset._id} (originalFilename: ${asset.originalFilename})`);
  }

  console.log("\n=== asset id map ===");
  console.log(JSON.stringify(assetIds, null, 2));

  const scanFor = (filename: string) => ({
    _type: "image",
    asset: { _type: "reference", _ref: assetIds[filename] },
  });

  async function patchItem(docId: string, key: string, fields: Record<string, unknown>) {
    await client
      .patch(docId)
      .set(
        Object.fromEntries(
          Object.entries(fields).map(([field, value]) => [`diplomi.items[_key=="${key}"].${field}`, value]),
        ),
      )
      .commit();
    console.log(`${docId}: patched items[_key=="${key}"] -> ${Object.keys(fields).join(", ")}`);
  }

  // --- Item 1: repurpose "qualification-fourth" placeholder -> Siena ---
  await patchItem("homePage-it", "qualification-fourth", {
    year: "2004",
    title: "Laurea in Lingua e Cultura Italiana",
    institution: "Università per Stranieri di Siena",
    tier: "titolo",
    scan: scanFor("diploma-siena-2004.webp"),
    scanRedacted: true,
  });
  await patchItem("homePage-en", "qualification-fourth", {
    year: "2004",
    title: "Degree in Italian Language and Culture",
    institution: "University for Foreigners of Siena",
    tier: "titolo",
    scan: scanFor("diploma-siena-2004.webp"),
    scanRedacted: true,
  });

  // --- Item 2: bicocca — text unchanged, attach scan only ---
  await patchItem("homePage-it", "qualification-bicocca", {
    scan: scanFor("diploma-bicocca-2011.webp"),
    scanRedacted: true,
  });
  await patchItem("homePage-en", "qualification-bicocca", {
    scan: scanFor("diploma-bicocca-2011.webp"),
    scanRedacted: true,
  });

  // --- Item 3: maastricht — text unchanged, attach scan only ---
  await patchItem("homePage-it", "qualification-maastricht", {
    scan: scanFor("diploma-maastricht-2013.webp"),
    scanRedacted: true,
  });
  await patchItem("homePage-en", "qualification-maastricht", {
    scan: scanFor("diploma-maastricht-2013.webp"),
    scanRedacted: true,
  });

  // --- Item 4: slop — text unchanged, attach scan only ---
  await patchItem("homePage-it", "qualification-slop", {
    scan: scanFor("diploma-slop-2020.webp"),
    scanRedacted: true,
  });
  await patchItem("homePage-en", "qualification-slop", {
    scan: scanFor("diploma-slop-2020.webp"),
    scanRedacted: true,
  });

  // --- Item 5: NEW item "qualification-opl", appended at the end ---
  const newItemIt = {
    _key: "qualification-opl",
    _type: "qualificationItem",
    year: "2016",
    title: "Iscrizione all'Albo, sezione A — n. 18949",
    institution: "Ordine degli Psicologi della Lombardia",
    tier: "titolo",
    scan: scanFor("opl-iscrizione.webp"),
    scanRedacted: true,
  };
  const newItemEn = {
    _key: "qualification-opl",
    _type: "qualificationItem",
    year: "2016",
    title: "Board registration, section A — no. 18949",
    institution: "Order of Psychologists of Lombardy",
    tier: "titolo",
    scan: scanFor("opl-iscrizione.webp"),
    scanRedacted: true,
  };
  await client.patch("homePage-it").insert("after", "diplomi.items[-1]", [newItemIt]).commit();
  console.log(`homePage-it: inserted new item qualification-opl (appended)`);
  await client.patch("homePage-en").insert("after", "diplomi.items[-1]", [newItemEn]).commit();
  console.log(`homePage-en: inserted new item qualification-opl (appended)`);

  console.log("\n=== all field writes committed ===");
}

main();
