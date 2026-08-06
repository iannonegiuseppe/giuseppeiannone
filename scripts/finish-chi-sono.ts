import { createClient } from "@sanity/client";

// Chi sono finishing pass — writes the two fields left open when the page
// was built: chiSonoSection.seo (both locales, noIndex stays true — not
// touched, already true) and siteSettings.author.bio (both locales,
// verbatim from Giuseppe's own chiSonoSection text, replacing the
// placeholder). createIfNotExists + patch.set, never createOrReplace —
// both documents already exist, this is a safe no-op create followed by
// a merge-patch.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function patchField(id: string, type: string, fields: Record<string, unknown>) {
  await client.createIfNotExists({ _id: id, _type: type });
  await client.patch(id).set(fields).commit();
  console.log(`\n--- ${id} ---`);
  console.log(JSON.stringify(fields, null, 2));
}

async function main() {
  await patchField("chiSonoSection-it", "chiSonoSection", {
    "seo.metaTitle": "Chi sono — Giuseppe Iannone, Psicoterapeuta ansia e panico",
    "seo.metaDescription":
      "Psicoterapeuta specializzato in ansia e attacchi di panico a Milano, Monza, Cernusco sul Naviglio e online. Conosco l'ansia da vicino: la mia storia.",
  });

  await patchField("chiSonoSection-en", "chiSonoSection", {
    "seo.metaTitle": "Giuseppe Iannone — English-Speaking Psychotherapist, Milan",
    "seo.metaDescription":
      "Italian psychotherapist working in English in Milan, Monza, Cernusco sul Naviglio and online. I know anxiety first-hand — how I came to this work.",
  });

  await patchField("siteSettings-it", "siteSettings", {
    "author.bio":
      "Ho studiato Neuroscienze Cognitive e Cliniche all'Università di Maastricht e ho lavorato come ricercatore sui meccanismi dell'ansia e del panico. Oggi mi occupo esclusivamente di ansia e panico, e delle difficoltà che li accompagnano. Ricevo a Milano, Monza, Cernusco sul Naviglio e online.",
  });

  await patchField("siteSettings-en", "siteSettings", {
    "author.bio":
      "I studied Cognitive and Clinical Neuroscience at Maastricht University and worked as a researcher on the mechanisms of anxiety and panic. Today I work exclusively with anxiety and panic, and the difficulties that come with them. I see people in Milan, Monza, Cernusco sul Naviglio and online.",
  });

  console.log("\n=== chi-sono finishing pass: done ===");
}

main();
