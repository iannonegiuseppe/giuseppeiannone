import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

// /faq hero illustration pass — uploads contents/faq-placeholder.png as a
// PNG asset (real, verified alpha channel — 73 distinct alpha values, 0 at
// all four corners — see this pass's own report; not re-encoded here, the
// raw file buffer goes straight to Sanity's asset endpoint so no
// compositing/flattening can happen on the way in). Uploaded once, the
// resulting asset _id is reused as the `photo` reference on BOTH
// faqPage-it and faqPage-en — same single-upload/shared-ref precedent as
// attach-diploma-scans.ts. Also sets titleEmphasisWord on both, the exact
// phrases specified for the animated-shimmer heading pass ("più spesso" /
// "come up most" — both literal substrings of each locale's own title, set
// earlier by set-faqpage-title-intro.ts).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  const filePath = path.resolve(__dirname, "../contents/faq-placeholder.png");
  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, { filename: "faq-hero-illustration.png" });
  console.log(`Uploaded faq-placeholder.png -> ${asset._id}`);

  const photo = {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "",
  };

  await client
    .patch("faqPage-it")
    .set({ photo: { ...photo, alt: "Illustrazione decorativa" }, titleEmphasisWord: "più spesso" })
    .commit();
  console.log("faqPage-it: photo + titleEmphasisWord set");

  await client
    .patch("faqPage-en")
    .set({ photo: { ...photo, alt: "Decorative illustration" }, titleEmphasisWord: "come up most" })
    .commit();
  console.log("faqPage-en: photo + titleEmphasisWord set");
}

main();
