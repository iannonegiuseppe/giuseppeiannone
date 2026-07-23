import { createClient } from "@sanity/client";

// CTA bridge pass — one-time seed for the ctaBridgeSection singleton.
// Same discipline as every other patch-*.ts script: upsertManagedSingleton
// (createIfNotExists + patch.set), never createOrReplace on the content
// documents themselves — only the translation.metadata pairing doc uses
// createOrReplace, since that's a pure linking record, not content.
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

const SECTION_COPY = {
  it: {
    title: "Non è necessario sapere da dove cominciare.",
    titleEmphasis: "da dove cominciare",
    body: "Il primo passo è solo un messaggio. Da lì capiamo insieme. [segnaposto]",
    linkLabel: "Scrivimi",
  },
  en: {
    title: "You don't need to know where to start.",
    titleEmphasis: "where to start",
    body: "The first step is just a message. From there, we figure it out together. [placeholder]",
    // "Message me" — reuses the exact EN phrasing already established for
    // this same verb elsewhere on the site (siteSettings.contactChannels'
    // WhatsApp channel: "Scrivimi su WhatsApp" -> "Message me on
    // WhatsApp", confirmed live in the dataset), not a new third variant.
    linkLabel: "Message me",
  },
};

async function main() {
  for (const locale of ["it", "en"] as const) {
    const id = `ctaBridgeSection-${locale}`;
    const before = await client.fetch(`*[_id == $id][0]`, { id });
    console.log(`BEFORE ${id}:`, JSON.stringify(before));

    await upsertManagedSingleton(id, "ctaBridgeSection", {
      language: locale,
      ...SECTION_COPY[locale],
    });

    const after = await client.fetch(`*[_id == $id][0]`, { id });
    console.log(`AFTER  ${id}:`, JSON.stringify(after));
  }

  await client.createOrReplace(
    translationMetadata("translation.metadata.ctaBridgeSection", "ctaBridgeSection", [
      { language: "it", documentId: "ctaBridgeSection-it" },
      { language: "en", documentId: "ctaBridgeSection-en" },
    ]),
  );
  console.log("translation.metadata written for ctaBridgeSection.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
