import { createClient } from "@sanity/client";

// Diplomi content, current shape (homePage-array migration pass — owner
// call, see homePage.ts's own comment on `diplomi.items`). Supersedes the
// now-deleted patch-qualifications.ts: this is what a FRESH environment
// (no `qualification` docs to migrate from — see
// migrate-qualifications-to-homepage.ts for that one-time move) should
// run to seed Diplomi content directly onto homePage.diplomi. Same
// discipline as every other patch-*.ts script here: dot-path
// patch.set(diplomi.*) only, never a whole-document createOrReplace.
//
// Document images are deliberately NOT seeded here — scans get uploaded
// manually in Studio after redaction. Every card renders the typographic
// placeholder (no `document` field set) until that happens.
//
// Content notes:
// - Entry 2 (Maastricht) is identical IT/EN — "Master of Science in
//   Cognitive and Clinical Neuroscience" is the actual program name (an
//   English-taught Dutch degree), not translated prose.
// - "Università degli Studi di" / "Scuola Lombarda di Psicoterapia" are
//   generic institutional descriptors, translated for EN; "Milano-
//   Bicocca", "SLOP", "Pavia", "Maastricht University" are the specific/
//   proper identifying names, left as-is.
// - Entry 4 and the Albo line are [segnaposto]/[placeholder] pending real
//   information (4th qualification, Ordine regionale + iscrizione number).
// - All copy checked against docs/design-direction.md §9 by hand — plain
//   factual credentials, no claims.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

type ItemSeed = {
  key: string;
  year: string;
  it: { title: string; institution: string; year?: string };
  en: { title: string; institution: string; year?: string };
};

const ITEMS: ItemSeed[] = [
  {
    key: "bicocca",
    year: "2011",
    it: { title: "Laurea in Scienze e Tecniche Psicologiche (L-24)", institution: "Università degli Studi di Milano-Bicocca" },
    en: { title: "Bachelor's Degree in Psychological Science and Techniques (L-24)", institution: "University of Milano-Bicocca" },
  },
  {
    key: "maastricht",
    year: "2013",
    it: { title: "Master of Science in Cognitive and Clinical Neuroscience", institution: "Maastricht University" },
    en: { title: "Master of Science in Cognitive and Clinical Neuroscience", institution: "Maastricht University" },
  },
  {
    key: "slop",
    year: "2020",
    it: { title: "Specializzazione in Psicoterapia Cognitivo-Neuropsicologica", institution: "SLOP — Scuola Lombarda di Psicoterapia, Pavia" },
    en: { title: "Specialization in Cognitive-Neuropsychological Psychotherapy", institution: "SLOP — Lombard School of Psychotherapy, Pavia" },
  },
  {
    key: "fourth",
    year: "[segnaposto]", // shared default — overridden per locale below
    it: { title: "[segnaposto — quarto documento in arrivo]", institution: "[segnaposto]" },
    en: { title: "[placeholder — fourth document pending]", institution: "[placeholder]", year: "[placeholder]" },
  },
];

const DIPLOMI_SECTION = {
  it: { kicker: "Formazione", heading: "Diplomi e qualifiche", alboLine: "Iscritto all'Albo degli Psicologi della [segnaposto], n. [segnaposto]" },
  en: { kicker: "Training", heading: "Diplomas and qualifications", alboLine: "Registered with the Order of Psychologists of [placeholder], no. [placeholder]" },
};

function itemsForLocale(locale: "it" | "en") {
  return ITEMS.map((item) => ({
    _key: `qualification-${item.key}`,
    _type: "qualificationItem",
    year: item[locale].year ?? item.year,
    title: item[locale].title,
    institution: item[locale].institution,
    tier: "titolo",
  }));
}

async function getDiplomi(id: string) {
  return client.fetch(`*[_id == $id][0]{ "diplomi": diplomi }`, { id });
}

async function main() {
  for (const locale of ["it", "en"] as const) {
    const id = `homePage-${locale}`;
    const before = await getDiplomi(id);
    console.log(`BEFORE ${id}:`, JSON.stringify(before));

    await client
      .patch(id)
      .set({
        "diplomi.kicker": DIPLOMI_SECTION[locale].kicker,
        "diplomi.heading": DIPLOMI_SECTION[locale].heading,
        "diplomi.alboLine": DIPLOMI_SECTION[locale].alboLine,
        "diplomi.items": itemsForLocale(locale),
      })
      .commit();

    const after = await getDiplomi(id);
    console.log(`AFTER  ${id}:`, JSON.stringify(after));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
