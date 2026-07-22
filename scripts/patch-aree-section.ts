import { createClient } from "@sanity/client";

// Aree section pass — targeted seed/patch for the areeSection singleton
// (header copy) and the 6 area list documents (rows). Same discipline as
// every other patch-*.ts script: upsertManagedSingleton (createIfNotExists
// + patch.set) throughout, plus a translation.metadata pairing doc per
// area — never a reseed/createOrReplace on any of these documents.
//
// No slugs seeded here — per this pass's own instruction, individual area
// pages don't exist yet. Every row renders as a plain (non-interactive)
// row until a slug is added by hand in Studio later.
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
    kicker: "Aree di intervento",
    title: "Di cosa mi occupo",
    intro: "Lavoro su un'area precisa: l'ansia e ciò che spesso la accompagna. [segnaposto]",
  },
  en: {
    // "What I help with" reuses the exact existing EN phrasing already
    // established for this same concept (messages/en.json's
    // Home.concernsGridHeading) — this section supersedes that grid, so
    // keeping the phrase is deliberate continuity, not a coincidence.
    kicker: "Areas of focus",
    title: "What I help with",
    intro: "I work on one precise area: anxiety and what often comes with it. [placeholder]",
  },
};

const AREAS = [
  {
    key: "ansia",
    order: 1,
    it: { title: "Ansia e disturbi d'ansia", descriptor: "Quando la preoccupazione diventa costante e occupa le giornate. [segnaposto]" },
    en: { title: "Anxiety and anxiety disorders", descriptor: "When worry becomes constant and takes over your days. [placeholder]" },
  },
  {
    key: "panico",
    order: 2,
    it: { title: "Attacchi di panico e agorafobia", descriptor: "Il corpo che si allarma all'improvviso, e i luoghi che si iniziano a evitare. [segnaposto]" },
    en: { title: "Panic attacks and agoraphobia", descriptor: "The body that suddenly sounds the alarm, and the places you start avoiding. [placeholder]" },
  },
  {
    key: "depressione",
    order: 3,
    it: { title: "Depressione", descriptor: "Quando l'energia e l'interesse si spengono, e tutto pesa. [segnaposto]" },
    en: { title: "Depression", descriptor: "When energy and interest fade, and everything feels heavy. [placeholder]" },
  },
  {
    key: "sessuali",
    order: 4,
    it: { title: "Disfunzioni sessuali", descriptor: "Le difficoltà nell'intimità, spesso legate ad ansia e stress. [segnaposto]" },
    en: { title: "Sexual dysfunction", descriptor: "Difficulties with intimacy, often tied to anxiety and stress. [placeholder]" },
  },
  {
    key: "stress",
    order: 5,
    it: { title: "Stress e burnout", descriptor: "Quando il carico supera le risorse, sul lavoro e fuori. [segnaposto]" },
    en: { title: "Stress and burnout", descriptor: "When the load outweighs your resources, at work and beyond. [placeholder]" },
  },
  {
    key: "relazionali",
    order: 6,
    it: { title: "Difficoltà relazionali", descriptor: "I rapporti che logorano: in coppia, in famiglia, sul lavoro. [segnaposto]" },
    en: { title: "Relationship difficulties", descriptor: "The relationships that wear you down: as a couple, in the family, at work. [placeholder]" },
  },
];

async function main() {
  for (const locale of ["it", "en"] as const) {
    const id = `areeSection-${locale}`;
    const before = await client.fetch(`*[_id == $id][0]`, { id });
    console.log(`BEFORE ${id}:`, JSON.stringify(before));

    await upsertManagedSingleton(id, "areeSection", {
      language: locale,
      ...SECTION_COPY[locale],
      // Preview-hover pass (temporary/demo, see areeSection.ts's own
      // field comment) — on for now since no area pages exist yet.
      previewHover: true,
    });

    const after = await client.fetch(`*[_id == $id][0]`, { id });
    console.log(`AFTER  ${id}:`, JSON.stringify(after));
  }

  for (const area of AREAS) {
    for (const locale of ["it", "en"] as const) {
      const id = `area-${area.key}-${locale}`;
      const before = await client.fetch(`*[_id == $id][0]`, { id });
      console.log(`BEFORE ${id}:`, JSON.stringify(before));

      await upsertManagedSingleton(id, "area", {
        language: locale,
        title: area[locale].title,
        descriptor: area[locale].descriptor,
        order: area.order,
        // slug deliberately omitted — no area pages exist yet.
      });

      const after = await client.fetch(`*[_id == $id][0]`, { id });
      console.log(`AFTER  ${id}:`, JSON.stringify(after));
    }

    await client.createOrReplace(
      translationMetadata(`translation.metadata.area-${area.key}`, "area", [
        { language: "it", documentId: `area-${area.key}-it` },
        { language: "en", documentId: `area-${area.key}-en` },
      ]),
    );
  }

  await client.createOrReplace(
    translationMetadata("translation.metadata.areeSection", "areeSection", [
      { language: "it", documentId: "areeSection-it" },
      { language: "en", documentId: "areeSection-en" },
    ]),
  );
  console.log("translation.metadata written for areeSection + all 6 areas.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
