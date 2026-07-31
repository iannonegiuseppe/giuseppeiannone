import { createClient } from "@sanity/client";

// Design-lab-to-production migration, Stage 2a: writes the design-lab
// Diplomi heading-zone copy into the REAL, shared homePage.diplomi.kicker/
// .heading/.headingEmphasisWord/.intro/.alboLine fields (per explicit
// instruction — no separate diplomiLab field group, unlike sediLab/
// tariffe/profilo/metodo/contactLab). headingEmphasisWord follows the
// exact same shape those other field groups already use — the italic
// accent word is a page-wide device, not decoration. EN values are NEW
// translations authored for this migration (the design-lab source had no
// English branch at all) — not previously reviewed, same disclosed-gap
// pattern as every other bilingual patch script in this project (IT run
// through deontologyCheck via the schema validator on save, EN checked by
// hand only).
//
// createIfNotExists + patch.set only, per project convention — never
// createOrReplace.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const PATCH_IT = {
  kicker: "Percorso formativo",
  heading: "Quattordici anni di formazione.",
  headingEmphasisWord: "formazione",
  intro:
    "I titoli che seguono sono quelli su cui si basa il mio lavoro: la laurea, il master di ricerca, " +
    "la specializzazione in psicoterapia. Sono documenti pubblici e consultabili.",
  alboLine:
    "Iscritto all'Albo degli Psicologi della Lombardia, sezione A, n. 18949 — dal 15 settembre 2016.",
};

const PATCH_EN = {
  kicker: "Training path",
  heading: "Fourteen years of training.",
  headingEmphasisWord: "training",
  intro:
    "The qualifications below are what my work is built on: my degree, my research master's, and " +
    "my specialization in psychotherapy. These are public documents, open to consultation.",
  alboLine:
    "Registered with the Order of Psychologists of Lombardy, section A, no. 18949 — since 15 September 2016.",
};

// Emphasis-word match check, run before any write — must be a real,
// case-sensitive substring of its own locale's heading (Sanity schema
// validation doesn't enforce this cross-field relationship itself, so
// this script does).
for (const [locale, patch] of [["it", PATCH_IT], ["en", PATCH_EN]] as const) {
  if (!patch.heading.includes(patch.headingEmphasisWord)) {
    throw new Error(
      `headingEmphasisWord "${patch.headingEmphasisWord}" is not a substring of the ${locale} heading "${patch.heading}"`,
    );
  }
}

async function patchDoc(id: string, patch: typeof PATCH_IT) {
  await client.createIfNotExists({ _id: id, _type: "homePage" });

  const FIELDS = `{ _id, "diplomi_kicker": diplomi.kicker, "diplomi_heading": diplomi.heading, "diplomi_headingEmphasisWord": diplomi.headingEmphasisWord, "diplomi_intro": diplomi.intro, "diplomi_alboLine": diplomi.alboLine }`;

  const before = await client.fetch(`*[_id == $id][0]${FIELDS}`, { id });
  console.log(`BEFORE ${id}:`, JSON.stringify(before));

  await client
    .patch(id)
    .set({
      "diplomi.kicker": patch.kicker,
      "diplomi.heading": patch.heading,
      "diplomi.headingEmphasisWord": patch.headingEmphasisWord,
      "diplomi.intro": patch.intro,
      "diplomi.alboLine": patch.alboLine,
    })
    .commit();

  const after = await client.fetch(`*[_id == $id][0]${FIELDS}`, { id });
  console.log(`AFTER  ${id}:`, JSON.stringify(after));
}

async function main() {
  await patchDoc("homePage-it", PATCH_IT);
  await patchDoc("homePage-en", PATCH_EN);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
