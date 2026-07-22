import { createClient } from "@sanity/client";

// Journey (formerly PercorsoSection) interactive rebuild — targeted
// patch, NOT a reseed. Same discipline as every other patch-*.ts
// script: dot-path .set() scoped to exactly percorso.steps on BOTH
// locales — kicker/heading/headingEmphasisWord/paragraph (set by the
// previous staircase-pass patch) are untouched here, only the step
// shape changes (title/description -> title/shortLine/expandedText).
//
// ALL copy below is placeholder — written by Aliaksandr's assistant, not
// Giuseppe, marked [segnaposto]/[placeholder] on both the short line and
// the expanded text for every step. Step 4's expanded line is flagged
// in this pass's own report as needing Giuseppe's real words — it's a
// values/goal statement ("the goal is..."), not an outcome guarantee,
// but still not his own wording. Step 1 preserves "Rispondo entro 24
// ore" verbatim (matches FinalContactSection.tsx's own hardcoded
// reassurance line), in both the short line and the expanded text.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary write-scoped " +
      "token in the Sanity dashboard (API → Tokens → Add API token, " +
      '"Editor" permission), set it in .env.local, run this script, ' +
      "then delete the token again.",
  );
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-07-05",
  useCdn: false,
});

const STEPS_IT = [
  {
    _key: "step-1",
    title: "Primo contatto",
    shortLine: "Mi scrivi come ti è più comodo. Rispondo entro 24 ore. [segnaposto]",
    expandedText:
      "Non serve preparare niente. Un messaggio, una mail, una chiamata — come preferisci. Mi racconti quello che ti va, e ti rispondo entro 24 ore. [segnaposto]",
  },
  {
    _key: "step-2",
    title: "Primo colloquio",
    shortLine: "Ci conosciamo. Capiamo insieme cosa sta succedendo. [segnaposto]",
    expandedText:
      "Il primo incontro serve a conoscerci. Non devi spiegare tutto subito: capiamo insieme cosa sta succedendo e se posso esserti utile. [segnaposto]",
  },
  {
    _key: "step-3",
    title: "Il lavoro insieme",
    shortLine: "Un metodo chiaro, adattato a te. [segnaposto]",
    expandedText:
      "Lavoriamo con un metodo chiaro, adattato alla tua situazione — non risposte pronte, ma strumenti che restano tuoi. [segnaposto]",
  },
  {
    _key: "step-4",
    title: "Verso l'autonomia",
    shortLine: "L'obiettivo è non averne più bisogno. [segnaposto]",
    expandedText:
      "Il percorso ha una direzione: arrivare al punto in cui non ti servo più. L'obiettivo non è restare in terapia, ma stare bene senza. [segnaposto]",
  },
];

const STEPS_EN = [
  {
    _key: "step-1",
    title: "First contact",
    shortLine: "You write to me however's easiest for you. I reply within 24 hours. [placeholder]",
    expandedText:
      "You don't need to prepare anything. A message, an email, a call — whatever you prefer. Tell me what's on your mind, and I'll reply within 24 hours. [placeholder]",
  },
  {
    _key: "step-2",
    title: "First consultation",
    shortLine: "We get to know each other. Together we understand what's going on. [placeholder]",
    expandedText:
      "The first meeting is about getting to know each other. You don't need to explain everything right away: together we understand what's going on and whether I can help. [placeholder]",
  },
  {
    _key: "step-3",
    title: "Working together",
    shortLine: "A clear method, adapted to you. [placeholder]",
    expandedText:
      "We work with a clear method, adapted to your situation — not ready-made answers, but tools that stay yours. [placeholder]",
  },
  {
    _key: "step-4",
    title: "Toward independence",
    shortLine: "The goal is to no longer need it. [placeholder]",
    expandedText:
      "The journey has a direction: reaching the point where you no longer need me. The goal isn't to stay in therapy, but to be well without it. [placeholder]",
  },
];

const PATCHES: Record<string, Record<string, unknown>> = {
  "homePage-it": { "percorso.steps": STEPS_IT },
  "homePage-en": { "percorso.steps": STEPS_EN },
};

async function getSteps(id: string) {
  return client.fetch(`*[_id == $id][0]{ "steps": percorso.steps }`, { id });
}

async function main() {
  for (const [id, patch] of Object.entries(PATCHES)) {
    const before = await getSteps(id);
    console.log(`BEFORE ${id}:`, JSON.stringify(before, null, 2));

    await client.patch(id).set(patch).commit();

    const after = await getSteps(id);
    console.log(`AFTER  ${id}:`, JSON.stringify(after, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
