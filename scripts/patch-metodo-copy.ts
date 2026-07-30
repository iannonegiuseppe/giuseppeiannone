import { createClient } from "@sanity/client";

// Metodo copy pass — seeds homePage.metodo (a NEW field group, separate
// from homePage.percorso, see that field group's own schema comment for
// why) for the first time: eyebrow/heading/headingEmphasisWord/paragraph
// carry forward /design-lab's own CURRENT rendered wording (previously
// hardcoded in density/content.ts's METODO constant, now retired from
// that call site — see this pass's own report), unchanged. Only the four
// step shortLine descriptions are NEW copy, replacing the old
// [segnaposto]/[placeholder] markers per this pass's own brief. Step
// titles are unchanged, verbatim from content.ts.
//
// DRAFT — NOT APPROVED. §9 checked via the actual deontologyCheck
// validator for IT (all strings pass, see this pass's own report). EN
// checked by hand (no automated EN check exists — pre-existing, disclosed
// gap, same as every other bilingual patch script in this repo).
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

const IT_METODO = {
  kicker: "Il percorso",
  heading: "Come si svolge un percorso",
  headingEmphasisWord: "un percorso",
  paragraph: "Ogni percorso è diverso, ma la struttura è chiara fin dall'inizio: ecco cosa aspettarsi.",
  steps: [
    {
      _key: "step-1",
      title: "Primo contatto",
      shortLine: "Mi scrivi su WhatsApp o via email, come preferisci. Rispondo entro 24 ore.",
    },
    {
      _key: "step-2",
      title: "Primo colloquio",
      shortLine:
        "Un incontro di 45 minuti per capire cosa sta succedendo. È già lavoro clinico, non una presentazione.",
    },
    {
      _key: "step-3",
      title: "Il lavoro insieme",
      shortLine: "Definiamo obiettivi e ritmo degli incontri. In studio, online, o alternando le due modalità.",
    },
    {
      _key: "step-4",
      title: "Verso l'autonomia",
      shortLine: "Rivediamo insieme il percorso nel tempo, per capire quando non serve più.",
    },
  ],
};

const EN_METODO = {
  kicker: "The path",
  heading: "How a course of therapy works",
  headingEmphasisWord: "a course of therapy",
  paragraph: "Every course of therapy is different, but the structure is clear from the start: here's what to expect.",
  steps: [
    {
      _key: "step-1",
      title: "First contact",
      shortLine: "You write to me on WhatsApp or by email, whichever you prefer. I reply within 24 hours.",
    },
    {
      _key: "step-2",
      title: "First consultation",
      shortLine: "A 45-minute meeting to understand what's going on. It's already clinical work, not an introduction.",
    },
    {
      _key: "step-3",
      title: "Working together",
      shortLine: "We define goals and the pace of sessions together. In person, online, or alternating between the two.",
    },
    {
      _key: "step-4",
      title: "Toward independence",
      shortLine: "We review the course of therapy together over time, to understand when it's no longer needed.",
    },
  ],
};

async function getMetodo(id: string) {
  return client.fetch(`*[_id == $id][0]{ metodo }`, { id });
}

async function patchDoc(id: string, metodo: Record<string, unknown>) {
  const before = await getMetodo(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));

  await client.patch(id).set({ metodo }).commit();

  const after = await getMetodo(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("homePage-it", IT_METODO);
  await patchDoc("homePage-en", EN_METODO);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
