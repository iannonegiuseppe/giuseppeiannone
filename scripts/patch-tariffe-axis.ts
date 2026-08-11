import { createClient } from "@sanity/client";

// homePage.tariffe axis change — rows go from delivery-mode (In studio /
// Online, both 100€) to therapy-type (Individuale / Coppia, 100€/130€),
// since both now apply identically online and in studio. patch.set on
// individual leaf paths only, addressed by each row's own _key (fetched
// fresh immediately before this script was written — row-studio /
// row-online), never a whole-object or whole-array .set(). eyebrow/
// heading/headingEmphasisWord/detrazioneFootnote/detailsItems[1..3] are
// not touched by this script at all.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function patchLeaf(id: string, fields: Record<string, unknown>) {
  await client.createIfNotExists({ _id: id, _type: "homePage" });
  await client.patch(id).set(fields).commit();
  console.log(`${id}: patched ${Object.keys(fields).join(", ")}`);
}

async function main() {
  await patchLeaf("homePage-it", {
    'tariffe.rows[_key=="row-studio"].mode': "Individuale",
    'tariffe.rows[_key=="row-studio"].price': "100 €",
    'tariffe.rows[_key=="row-studio"].subline': "45 minuti, in studio e online",
    'tariffe.rows[_key=="row-online"].mode': "Coppia",
    'tariffe.rows[_key=="row-online"].price': "130 €",
    'tariffe.rows[_key=="row-online"].subline': "60 minuti, in studio e online",
    "tariffe.detailsItems[0]": "Milano Citylife e Bicocca, Monza, Cernusco sul Naviglio",
  });

  await patchLeaf("homePage-en", {
    'tariffe.rows[_key=="row-studio"].mode': "Individual",
    'tariffe.rows[_key=="row-studio"].price': "€100",
    'tariffe.rows[_key=="row-studio"].subline': "45 minutes, in person and online",
    'tariffe.rows[_key=="row-online"].mode': "Couple",
    'tariffe.rows[_key=="row-online"].price': "€130",
    'tariffe.rows[_key=="row-online"].subline': "60 minutes, in person and online",
    "tariffe.detailsItems[0]": "Milan Citylife and Bicocca, Monza, Cernusco sul Naviglio",
  });

  console.log("\n=== tariffe axis change: all patches committed ===");
}

main();
