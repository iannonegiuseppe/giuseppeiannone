import { createClient } from "@sanity/client";

// Copy pass — Recognition / Hope / Welcome. Same discipline as
// patch-hero-copy.ts / patch-hero-copy-2.ts: dot-path keys only (never
// whole-object .set() on "recognition"/"hope"/"welcome"), so this never
// touches recognition.vignettes (unrelated data still on the document) or
// any other sibling field. recognition.fragments IS replaced as one whole
// array value — the entire array's content is being deliberately
// rewritten by this pass (every fragment plus one new one), not a partial
// edit, so there's no sibling-clobbering risk the leaf-key discipline
// exists to prevent.
//
// DRAFT — NOT APPROVED. Real, finished-reading prose in Giuseppe's voice
// (not [segnaposto]-style placeholders), but not reviewed or signed off by
// him. Logged in docs/pre-launch.md as well.
//
// §9 check: verified via the ACTUAL Sanity validator (deontologyCheck,
// src/sanity/schemaTypes/lib/deontologyValidator.ts), imported and run
// directly against every IT string below before this script was run — all
// passed, including Hope's own phrase ("non deve restare così"), checked
// with particular attention per this pass's own brief. The validator is
// Italian-only (pre-existing, disclosed gap — see patch-homepage-en.ts's
// own comment); EN strings were checked by hand against the same §9
// categories (no outcome/cure claims, no free-session framing, no
// urgency/scarcity, no testimonials) — states facts/processes only in
// both languages.
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

// Tier assignment for the new fifth labeled fragment (sixth overall,
// counting the anchor) — not specified in this pass's own brief, a
// judgment call made here: PERIPHERAL, not dominant. Dominant is already
// at 2 (its own schema ceiling range is 2-3); adding a 3rd dominant would
// mean three large, full-ink fragments instead of two, a bigger jump in
// visual weight than adding a third (quiet, muted) peripheral. Reported,
// not silently decided — see this pass's own report.
const IT_FRAGMENTS = [
  {
    _key: "fragment-anchor",
    label: "",
    text: "Da fuori sembra tutto a posto: il lavoro, le persone, i programmi. Dentro, no. E spiegarlo a parole è la cosa più difficile.",
    emphasisWord: "Dentro",
    tier: "anchor",
  },
  {
    _key: "fragment-stress",
    label: "Stress e burnout",
    text: "Mi sveglio già stanco, e la giornata non è ancora iniziata. Ogni mattina uguale, come se la notte non rimettesse niente a posto.",
    emphasisWord: "già stanco",
    tier: "dominant",
  },
  {
    _key: "fragment-rimuginio",
    label: "Rimuginio",
    text: "Rigiro in testa sempre le stesse cose e rimando le decisioni finché non sono più decisioni, ma urgenze.",
    emphasisWord: "urgenze",
    tier: "dominant",
  },
  {
    _key: "fragment-ansia",
    label: "Ansia e disturbi d'ansia",
    text: "Il cuore accelera senza un motivo apparente. Con la testa so che va tutto bene, ma il corpo non ci crede e continua a prepararsi a qualcosa.",
    emphasisWord: "il corpo non ci crede",
    tier: "peripheral",
  },
  {
    _key: "fragment-relazioni",
    label: "Difficoltà relazionali",
    text: "Dico sempre di sì, per non deludere nessuno. Poi non resta niente per me — né tempo, né energie.",
    emphasisWord: "non resta niente per me",
    tier: "peripheral",
  },
  {
    _key: "fragment-panico",
    label: "Attacchi di panico",
    text: "Esco di casa e calcolo già dov'è l'uscita più vicina. Per ogni evenienza. Anche quando non succede niente.",
    emphasisWord: "dov'è l'uscita più vicina",
    tier: "peripheral",
  },
];

const EN_FRAGMENTS = [
  {
    _key: "fragment-anchor",
    label: "",
    text: "From the outside, everything looks fine: work, people, plans. Inside, it isn't. And putting it into words is the hardest part.",
    emphasisWord: "Inside",
    tier: "anchor",
  },
  {
    _key: "fragment-stress",
    label: "Stress and burnout",
    text: "I wake up already tired, and the day hasn't even started. Every morning the same, as if the night never set anything right.",
    emphasisWord: "already tired",
    tier: "dominant",
  },
  {
    _key: "fragment-rimuginio",
    label: "Rumination",
    text: "I turn the same things over in my head and put off decisions until they're not decisions anymore — just emergencies.",
    emphasisWord: "emergencies",
    tier: "dominant",
  },
  {
    _key: "fragment-ansia",
    label: "Anxiety and anxiety disorders",
    text: "My heart races for no apparent reason. In my head I know everything's fine, but my body doesn't believe it and keeps bracing for something.",
    emphasisWord: "my body doesn't believe it",
    tier: "peripheral",
  },
  {
    _key: "fragment-relazioni",
    label: "Relationship difficulties",
    text: "I always say yes, so I don't disappoint anyone. Then there's nothing left for me — no time, no energy.",
    emphasisWord: "there's nothing left for me",
    tier: "peripheral",
  },
  {
    _key: "fragment-panico",
    label: "Panic attacks",
    text: "I leave the house and I've already worked out where the nearest exit is. Just in case. Even when nothing happens.",
    emphasisWord: "where the nearest exit is",
    tier: "peripheral",
  },
];

const IT_PATCH = {
  "recognition.kicker": "Situazioni comuni",
  "recognition.heading": "Ti riconosci?",
  "recognition.bridgeLine":
    "Ansia, panico, stress: non serve conoscere il nome di quello che senti. A volte basta riconoscersi nelle parole di qualcun altro — e partire da lì.",
  "recognition.fragments": IT_FRAGMENTS,
  "hope.eyebrow": "Un percorso possibile",
  "hope.heading": "Non è sempre stato così. E non deve restare così.",
  "hope.headingEmphasisWord": "non deve restare",
  "welcome.kicker": "Benvenuto",
  "welcome.title": "Un percorso pensato su misura",
  "welcome.titleEmphasis": "su misura",
  "welcome.paragraph":
    "Sono Giuseppe Iannone, psicologo psicoterapeuta. Mi occupo di ansia, attacchi di panico e agorafobia con un approccio cognitivo-neuropsicologico. Ricevo a Milano — Citylife e Bicocca — a Monza, a Cernusco sul Naviglio e online, in italiano e in inglese. Il primo colloquio serve a capire insieme cosa sta succedendo, senza impegno a proseguire.",
};

const EN_PATCH = {
  "recognition.kicker": "Common situations",
  "recognition.heading": "Does this sound familiar?",
  "recognition.bridgeLine":
    "Anxiety, panic, stress: you don't need to know the name for what you're feeling. Sometimes it's enough to recognize yourself in someone else's words — and start from there.",
  "recognition.fragments": EN_FRAGMENTS,
  "hope.eyebrow": "A possible path",
  "hope.heading": "It hasn't always been this way. And it doesn't have to stay this way.",
  "hope.headingEmphasisWord": "doesn't have to stay",
  "welcome.kicker": "Welcome",
  "welcome.title": "A path built around you",
  "welcome.titleEmphasis": "around you",
  "welcome.paragraph":
    "I'm Giuseppe Iannone, a psychologist and psychotherapist. I work with anxiety, panic attacks, and agoraphobia using a cognitive-neuropsychological approach. I see clients in Milan — Citylife and Bicocca — in Monza, in Cernusco sul Naviglio, and online, in Italian and in English. The first consultation is a chance to understand together what's going on, with no obligation to continue.",
};

async function getFields(id: string) {
  return client.fetch(
    `*[_id == $id][0]{
      "recognitionKicker": recognition.kicker,
      "recognitionHeading": recognition.heading,
      "recognitionBridgeLine": recognition.bridgeLine,
      "recognitionFragmentCount": count(recognition.fragments),
      "hopeEyebrow": hope.eyebrow,
      "hopeHeading": hope.heading,
      "welcomeKicker": welcome.kicker,
      "welcomeTitle": welcome.title,
      "welcomeParagraph": welcome.paragraph
    }`,
    { id },
  );
}

async function patchDoc(id: string, patch: Record<string, unknown>) {
  const before = await getFields(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));

  await client.patch(id).set(patch).commit();

  const after = await getFields(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("homePage-it", IT_PATCH);
  await patchDoc("homePage-en", EN_PATCH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
