import { createClient } from "@sanity/client";

// Blog index redesign pass — additive only: creates the new
// blogIndexSection-it/-en singleton pair (+ their translation.metadata
// link) if they don't already exist, then patches only the fields this
// script owns. Never createOrReplace (would silently wipe any field a
// later schema pass adds and an editor fills in by hand — same lesson
// scripts/seed.ts's own upsertManagedSingleton comment already
// documents). Does not touch any article document.
//
// Copy below is placeholder text, clearly marked as such — kicker/heading
// are simple functional labels (not claims), but intro/editorial are
// explicitly bracketed placeholders, same convention as
// siteSettings.author.bio's own "[Segnaposto...]" placeholder. Replace via
// Studio before this ships as real copy.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

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

const FIELDS_IT = {
  language: "it",
  kicker: "Blog",
  heading: "Articoli e risorse",
  headingEmphasisWord: "risorse",
  intro: "[Testo segnaposto — da sostituire con l'introduzione reale del blog.]",
  editorial: [
    {
      _key: "editorial-placeholder-1",
      _type: "block",
      style: "normal",
      children: [
        {
          _key: "editorial-placeholder-1-span",
          _type: "span",
          text: "[Testo segnaposto — da sostituire con il blocco editoriale reale.]",
        },
      ],
    },
  ],
};

const FIELDS_EN = {
  language: "en",
  kicker: "Blog",
  heading: "Articles and resources",
  headingEmphasisWord: "resources",
  intro: "[Placeholder text — replace with the blog's real introduction.]",
  editorial: [
    {
      _key: "editorial-placeholder-1",
      _type: "block",
      style: "normal",
      children: [
        {
          _key: "editorial-placeholder-1-span",
          _type: "span",
          text: "[Placeholder text — replace with the real editorial block.]",
        },
      ],
    },
  ],
};

async function main() {
  const itId = "blogIndexSection-it";
  const enId = "blogIndexSection-en";

  await upsertManagedSingleton(itId, "blogIndexSection", FIELDS_IT);
  await upsertManagedSingleton(enId, "blogIndexSection", FIELDS_EN);

  await client.createIfNotExists(
    translationMetadata("blogIndexSection-translations", "blogIndexSection", [
      { language: "it", documentId: itId },
      { language: "en", documentId: enId },
    ]),
  );

  console.log("Seeded blogIndexSection-it, blogIndexSection-en, and their translation.metadata link.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
