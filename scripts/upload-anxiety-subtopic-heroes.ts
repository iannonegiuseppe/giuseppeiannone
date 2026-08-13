import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

// Anxiety subtopics hero images pass — uploads one asset per topic (not
// per locale) and attaches it to both the it/en subtopicPage documents,
// same "one asset, two references" pattern the four existing subtopics
// already use (confirmed live before writing this script). Ansia-
// sessuale.jpg deliberately excluded here — its actual content (a woman
// waking up in bed, sleep mask, no partner/intimacy framing) doesn't
// match its filename's implied subject and needs a human decision before
// it goes anywhere near a page titled "sexual performance anxiety" — see
// this pass's own report.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const topics = [
  {
    file: "Ansia-da-prestazione.jpg",
    docIt: "subtopicPage-prestazione-it",
    docEn: "subtopicPage-prestazione-en",
    altIt:
      "Aula universitaria vuota con file di banchi e sedie nere, sotto un soffitto con luci a griglia.",
    altEn:
      "Empty university lecture hall with rows of desks and black chairs, under a grid-patterned ceiling of lights.",
  },
  {
    file: "Ansia-nelle-relazioni.jpg",
    docIt: "subtopicPage-relazioni-ansia-it",
    docEn: "subtopicPage-relazioni-ansia-en",
    altIt: "Due mani che si allungano verso altrettante tazze di vetro con caffè, su un fondo grigio chiaro.",
    altEn: "Two hands reaching toward two glass mugs of coffee, against a plain light grey background.",
  },
];

async function main() {
  for (const topic of topics) {
    const filePath = path.join("contents", topic.file);
    const buffer = fs.readFileSync(filePath);
    const asset = await client.assets.upload("image", buffer, { filename: topic.file });
    console.log(
      `${topic.file} -> ${asset._id} (${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height})`,
    );

    await client
      .patch(topic.docIt)
      .set({
        heroImage: { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: topic.altIt },
      })
      .commit();
    console.log(`  ${topic.docIt} patched`);

    await client
      .patch(topic.docEn)
      .set({
        heroImage: { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: topic.altEn },
      })
      .commit();
    console.log(`  ${topic.docEn} patched`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
