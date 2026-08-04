import { createClient } from "@sanity/client";

// Four-item pass (round 3), heading replacement — swaps only the FOUR h2
// blocks' text in blogIndexSection-it/-en's `editorial` array, in place.
// Fetches the live array, finds each block by style:"h2" + its position
// (1st/2nd/3rd/4th heading in document order), rewrites only that block's
// first span's `text`, leaves _key/markDefs/every paragraph block
// completely untouched, then patch.set()s the whole array back — additive
// or same-shape, never a re-seed.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const NEW_HEADINGS: Record<string, string[]> = {
  it: [
    "Ansia, attacchi di panico e relazioni: perché scrivo questi articoli",
    "Di cosa parlo: ansia, panico, stress, relazioni e trauma",
    "Come leggere questi articoli sulla psicoterapia",
    "Psicologo psicoterapeuta a Milano, Monza e Cernusco sul Naviglio",
  ],
  en: [
    "Anxiety, panic attacks and relationships: why I write these articles",
    "What I write about: anxiety, panic, stress, relationships and trauma",
    "How to read these articles on psychotherapy",
    "Italian psychotherapist in Milan, working in English and online",
  ],
};

interface Span {
  _type: string;
  _key: string;
  text: string;
  marks?: string[];
}

interface Block {
  _type: string;
  _key: string;
  style?: string;
  children: Span[];
  [key: string]: unknown;
}

async function patchLocale(language: string) {
  const id = `blogIndexSection-${language}`;
  const doc = await client.fetch<{ editorial: Block[] } | null>(`*[_id == $id][0]{editorial}`, { id });
  if (!doc?.editorial) {
    throw new Error(`${id}: no editorial array found`);
  }

  const headings = NEW_HEADINGS[language];
  if (!headings) {
    throw new Error(`No new headings defined for locale "${language}"`);
  }

  let h2Index = 0;
  const updated = doc.editorial.map((block) => {
    if (block._type === "block" && block.style === "h2") {
      const newText = headings[h2Index];
      h2Index += 1;
      if (newText === undefined) {
        throw new Error(`${id}: found more h2 blocks than replacement headings`);
      }
      return {
        ...block,
        children: block.children.map((span, i) => (i === 0 ? { ...span, text: newText } : span)),
      };
    }
    return block;
  });

  if (h2Index !== headings.length) {
    throw new Error(`${id}: expected ${headings.length} h2 blocks, found ${h2Index}`);
  }

  console.log(`\n=== ${id} BEFORE h2 texts ===`);
  doc.editorial.filter((b) => b.style === "h2").forEach((b) => console.log("-", b.children[0]?.text));

  await client.patch(id).set({ editorial: updated }).commit();

  const after = await client.fetch<{ editorial: Block[] }>(`*[_id == $id][0]{editorial}`, { id });
  console.log(`=== ${id} AFTER h2 texts ===`);
  after.editorial.filter((b) => b.style === "h2").forEach((b) => console.log("-", b.children[0]?.text));
  console.log(`=== ${id} total block count: ${after.editorial.length} ===`);
}

async function main() {
  await patchLocale("it");
  await patchLocale("en");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
