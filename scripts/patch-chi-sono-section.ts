import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

// Chi sono section pass — targeted seed/patch for the new chiSonoSection
// singleton (see src/sanity/schemaTypes/documents/chiSonoSection.ts's own
// comment for why this is a standalone type, not a homePage field group).
// Same discipline as every other patch-*.ts script: upsertManagedSingleton
// (createIfNotExists + patch.set) for chiSonoSection-{it,en}, plus its
// translation.metadata pairing doc — never a reseed/createOrReplace on
// the singleton itself.
//
// Portrait: uploads public/design-lab/03.webp via the SAME idempotent-
// by-originalFilename pattern as scripts/seed.ts's own uploadPublicImage
// (reproduced here rather than imported — seed.ts's version isn't
// exported, and this script is meant to run standalone/re-runnable on
// its own). If scripts/seed.ts already uploaded this exact file (it does,
// for ConcernsSection/diCosa's own photo), this finds and reuses that
// same asset instead of uploading a duplicate. The local file itself is
// NOT deleted after upload — it stays in public/ for any other fallback
// `<img>` src that already points at it (ConcernsSection.tsx, etc.).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function uploadPublicImage(relativePath: string): Promise<string> {
  const filename = path.basename(relativePath);

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
    { filename },
  );
  if (existing?._id) return existing._id;

  const filePath = path.join(process.cwd(), "public", relativePath);
  const buffer = fs.readFileSync(filePath);
  const contentType = filename.endsWith(".svg") ? "image/svg+xml" : "image/webp";

  const asset = await client.assets.upload("image", buffer, { filename, contentType });
  return asset._id;
}

async function upsertManagedSingleton(id: string, type: string, fields: Record<string, unknown>) {
  await client.createIfNotExists({ _id: id, _type: type, ...fields });
  await client.patch(id).set(fields).commit();
}

function translationMetadata(
  id: string,
  schemaType: string,
  translations: { language: string; documentId: string }[],
) {
  return {
    _id: id,
    _type: "translation.metadata",
    schemaTypes: [schemaType],
    translations: translations.map(({ language, documentId }) => ({
      _key: language,
      _type: "internationalizedArrayReferenceValue",
      language,
      value: { _type: "reference", _ref: documentId },
    })),
  };
}

const COPY = {
  it: {
    kicker: "Chi sono",
    title: "Conosco l'ansia da vicino.",
    titleEmphasisWord: "da vicino",
    paragraphs: [
      "Siena, 2001. Studiavo Filologia e della psicologia non sapevo nulla. Un giorno, durante una lezione, il cuore ha iniziato a correre all'improvviso, senza motivo. Era un attacco di panico — ma allora non sapevo dargli un nome.",
      "Anni dopo, ad Amsterdam, dove insegnavo italiano, ho chiesto aiuto a uno psicoterapeuta. Dare un nome e un senso a quello che mi succedeva ha cambiato la direzione della mia vita: ho deciso di ricominciare dagli studi e di dedicarmi alla psicologia.",
      "Ho studiato Neuroscienze Cognitive e Cliniche all'Università di Maastricht e ho lavorato come ricercatore sui meccanismi dell'ansia e del panico. Poi la specializzazione in Psicoterapia Cognitivo-Neuropsicologica e le esperienze cliniche nei reparti di psichiatria, tra Milano e Brescia.",
      // 5th-paragraph pass: inserted here (was directly followed by "Oggi
      // mi occupo..." before) — the other four paragraphs' own text is
      // untouched, verbatim.
      "Lavoro in italiano e in inglese. Negli anni ho accompagnato persone arrivate a Milano da ogni parte del mondo: studiare e vivere all'estero mi ha insegnato quanto conti potersi raccontare nella lingua in cui ci si sente a casa.",
      "Oggi mi occupo esclusivamente di ansia e panico, e delle difficoltà che li accompagnano. Ricevo a Milano, Monza, Cernusco sul Naviglio e online. Non sono un tuttologo — e lo considero un punto di forza.",
    ],
    pullQuote:
      "I sintomi sono spesso come una spia sul cruscotto: spegnerla non ripara il guasto. In terapia impariamo ad ascoltarla.",
    portraitAlt: "Giuseppe Iannone, psicoterapeuta",
  },
  en: {
    kicker: "About me",
    title: "I know anxiety first-hand.",
    titleEmphasisWord: "first-hand",
    paragraphs: [
      "Siena, 2001. I was studying Philology and knew nothing about psychology. One day, during a lecture, my heart suddenly started racing for no reason. It was a panic attack — though I didn't have a name for it back then.",
      "Years later, in Amsterdam, where I was teaching Italian, I sought help from a psychotherapist. Putting a name and a meaning to what was happening to me changed the direction of my life: I decided to go back to studying and dedicate myself to psychology.",
      "I studied Cognitive and Clinical Neuroscience at Maastricht University and worked as a researcher on the mechanisms of anxiety and panic. Then came the specialization in Cognitive-Neuropsychological Psychotherapy and clinical experience in psychiatric wards, between Milan and Brescia.",
      // Faithful, natural (not literal) translation of the new IT
      // paragraph above.
      "I work in both Italian and English. Over the years I've worked with people who came to Milan from all over the world: studying and living abroad taught me how much it matters to be able to talk about yourself in the language you feel most at home in.",
      "Today I work exclusively with anxiety and panic, and the difficulties that come with them. I see clients in Milan, Monza, Cernusco sul Naviglio and online. I'm not a jack-of-all-trades — and I consider that a strength.",
    ],
    pullQuote:
      "Symptoms are often like a warning light on a dashboard: switching it off doesn't fix the fault. In therapy, we learn to listen to it.",
    portraitAlt: "Giuseppe Iannone, psychotherapist",
  },
};

async function main() {
  const assetId = await uploadPublicImage("design-lab/03.webp");
  console.log("portrait asset id:", assetId);

  for (const locale of ["it", "en"] as const) {
    const id = `chiSonoSection-${locale}`;
    const copy = COPY[locale];

    const before = await client.fetch(`*[_id == $id][0]`, { id });
    console.log(`BEFORE ${id}:`, JSON.stringify(before));

    await upsertManagedSingleton(id, "chiSonoSection", {
      language: locale,
      kicker: copy.kicker,
      title: copy.title,
      titleEmphasisWord: copy.titleEmphasisWord,
      paragraphs: copy.paragraphs,
      pullQuote: copy.pullQuote,
      portrait: {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
        alt: copy.portraitAlt,
      },
      signatureEnabled: true,
      // storyLink deliberately omitted — stays unset until the future
      // full Chi sono page exists, per this pass's own instruction.
    });

    const after = await client.fetch(`*[_id == $id][0]`, { id });
    console.log(`AFTER  ${id}:`, JSON.stringify(after));
  }

  await client.createOrReplace(
    translationMetadata("translation.metadata.chiSonoSection", "chiSonoSection", [
      { language: "it", documentId: "chiSonoSection-it" },
      { language: "en", documentId: "chiSonoSection-en" },
    ]),
  );
  console.log("translation.metadata.chiSonoSection written.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
