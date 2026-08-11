import { createClient } from "@sanity/client";

// Chi sono timeline deck pass — writes chiSonoSection.journey (kicker/
// heading/description), both locales. The timeline section itself
// (TimelineSection.tsx) has always accepted kicker/heading props, but
// page.tsx never passed them in, so the section rendered with no header
// at all. journey is the new object field that feeds it (see
// chiSonoSection.ts's own schema comment) — createIfNotExists + patch.set,
// touches only this one field.
//
// EN copy is a plain translation of the approved IT copy, same precedent
// as publications' own EN kicker/title (populate-chisono-publications-quote.ts).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function patchDoc(id: string, fields: Record<string, unknown>) {
  await client.createIfNotExists({ _id: id, _type: "chiSonoSection" });
  await client.patch(id).set(fields).commit();
  console.log(`\n--- ${id} ---`);
  console.log(JSON.stringify(fields, null, 2));
}

const journeyIt = {
  kicker: "IL PERCORSO",
  heading: "Le tappe di un percorso",
  description:
    "Da Siena a Brescia, con qualche tappa lungo la strada: la formazione, i primi passi, gli incontri che mi hanno portato a fare questo lavoro.",
};

const journeyEn = {
  kicker: "THE JOURNEY",
  heading: "The stops along the way",
  description:
    "From Siena to Brescia, with a few stops along the way: the training, the first steps, the encounters that led me to this work.",
};

async function main() {
  await patchDoc("chiSonoSection-it", { journey: journeyIt });
  await patchDoc("chiSonoSection-en", { journey: journeyEn });
  console.log("\n=== chi sono journey header: done ===");
}

main();
