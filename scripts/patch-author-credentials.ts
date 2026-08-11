import { createClient } from "@sanity/client";

// Chi sono pass 3 — adds "Sessuologo"/"Sexologist" to the shared
// siteSettings.author.credentials field, confirmed by Giuseppe (see
// contents/chi-sono-testo-completo.md's own "NOTE PER LA REVISIONE" item
// 5). This field is NOT chi-sono-specific — it also feeds the sitewide
// Person JSON-LD jobTitle, the homepage WelcomeBlock signature, the blog
// article's top byline AND its own embedded BlogPosting JSON-LD, and the
// production footer (FooterLab.tsx's alboLine) — six render sites total,
// confirmed by grepping every author?.credentials/authorCredentials call
// site, not assumed. That's correct here: it's his real professional
// title everywhere it appears, not a fact scoped to this one page.
//
// EN wording: the source draft's own PROFESSIONAL DETAILS block gives
// "Psychologist, Psychotherapist and Sexologist" verbatim (with the
// list comma) — used as-is rather than re-authored, even though the
// field's CURRENT EN value ("Psychologist Psychotherapist") has no comma
// between the first two titles. Flagged, not silently changed twice.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const CREDENTIALS = {
  it: "Psicologo Psicoterapeuta e Sessuologo",
  en: "Psychologist, Psychotherapist and Sexologist",
};

async function patch(locale: "it" | "en") {
  const id = `siteSettings-${locale}`;
  const before = await client.fetch(`*[_id == $id][0]{"credentials": author.credentials}`, { id });
  console.log(`BEFORE ${id}:`, JSON.stringify(before));
  await client.patch(id).set({ "author.credentials": CREDENTIALS[locale] }).commit();
  const after = await client.fetch(`*[_id == $id][0]{"credentials": author.credentials}`, { id });
  console.log(`AFTER  ${id}:`, JSON.stringify(after));
}

async function main() {
  await patch("it");
  await patch("en");
}

main();
