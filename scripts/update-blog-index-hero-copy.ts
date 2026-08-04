import { createClient } from "@sanity/client";

// Blog index redesign pass, item 2 — final hero copy, both locales.
// patch.set on exactly kicker/heading/headingEmphasisWord/intro — never
// touches `editorial` (still a deliberate placeholder, per explicit
// instruction: "leave the editorial block at the bottom as a placeholder
// — that copy is separate and I'll write it later") or any other field.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_COPY: Record<string, { kicker: string; heading: string; headingEmphasisWord: string; intro: string }> = {
  it: {
    kicker: "BLOG",
    heading: "Articoli su ansia, panico e relazioni.",
    headingEmphasisWord: "relazioni",
    intro:
      "Scrivo di quello che incontro più spesso in studio: l'ansia, gli attacchi di panico, le difficoltà nelle relazioni. Sono testi brevi, pensati per chi cerca di capire cosa sta succedendo. Non sostituiscono un percorso, ma possono essere un punto di partenza.",
  },
  en: {
    kicker: "BLOG",
    heading: "Articles on anxiety, panic and relationships.",
    headingEmphasisWord: "relationships",
    intro:
      "I write about what I meet most often in practice: anxiety, panic attacks, and difficulties in relationships. These are short pieces for anyone trying to understand what is happening. They don't replace a course of therapy, but they can be a place to start.",
  },
};

async function main() {
  for (const [language, fields] of Object.entries(HERO_COPY)) {
    const id = `blogIndexSection-${language}`;
    const before = await client.fetch(`*[_id == $id][0]{kicker, heading, headingEmphasisWord, intro}`, { id });
    console.log(`BEFORE ${id}:`, JSON.stringify(before));

    await client.patch(id).set(fields).commit();

    const after = await client.fetch(`*[_id == $id][0]{kicker, heading, headingEmphasisWord, intro}`, { id });
    console.log(`AFTER  ${id}:`, JSON.stringify(after));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
