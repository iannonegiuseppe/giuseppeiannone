import { createClient } from "@sanity/client";

// Contact light-surface pass — seeds homePage.contactLab (a NEW field
// group, independent from finalCta, see that field group's own schema
// comment for why) for the first time. Kicker/heading/emphasis word/photo
// caption only — field labels, radio labels, consent text, button label
// and the reply line are hardcoded bilingual strings in ContactFormLab.tsx/
// ContactBlock.tsx instead (not CMS content, same as the existing shared
// form's channel labels), listed in this pass's own report.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary write-scoped token in the Sanity " +
      'dashboard (API -> Tokens -> Add API token, "Editor" permission), set it in ' +
      ".env.local, run this script, then delete the token again.",
  );
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const IT_CONTACT_LAB = {
  kicker: "PRIMO PASSO",
  heading: "Scrivimi due righe, e vediamo da dove partire.",
  headingEmphasisWord: "due righe",
  photoCaption: "Dr. Giuseppe Iannone — Psicoterapeuta",
};

const EN_CONTACT_LAB = {
  kicker: "FIRST STEP",
  heading: "Write me a few lines, and we'll find where to start.",
  headingEmphasisWord: "a few lines",
  photoCaption: "Dr. Giuseppe Iannone — Psychotherapist",
};

async function getContactLab(id: string) {
  return client.fetch(`*[_id == $id][0]{ contactLab }`, { id });
}

async function patchDoc(id: string, contactLab: Record<string, unknown>) {
  const before = await getContactLab(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));

  await client.patch(id).set({ contactLab }).commit();

  const after = await getContactLab(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("homePage-it", IT_CONTACT_LAB);
  await patchDoc("homePage-en", EN_CONTACT_LAB);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
