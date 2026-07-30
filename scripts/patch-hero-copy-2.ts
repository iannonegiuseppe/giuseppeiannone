import { createClient } from "@sanity/client";

// Hero copy pass 2 — targeted patch, same discipline as patch-hero-copy.ts:
// dot-path keys only ("hero.headline", not "hero"), never createOrReplace,
// so hero.photo/hero.youtubeId (possibly hand-set in Studio) are untouched.
//
// DRAFT — NOT APPROVED. This is proposed copy for Giuseppe's professional
// self-description (name, credentials, disorders treated, method,
// locations, languages). It reads as finished, real sentences (not
// [segnaposto]-style placeholders) because the task asked for real draft
// copy to judge layout/line-count against — but it has NOT been reviewed
// or signed off by Giuseppe. Do not treat this as final. Logged in
// docs/pre-launch.md as well, so it isn't only discoverable by reading
// this script.
//
// §9 check (manual, both languages — the automated deontologyCheck
// validator, src/sanity/schemaTypes/lib/deontologyValidator.ts, only
// matches an ITALIAN word list, so it cannot check the English half; see
// patch-homepage-en.ts's own comment on this same, pre-existing gap):
// states facts only (name, title, disorders, method, three locations +
// online, two languages) and describes the FIRST-CONTACT PROCESS neutrally
// ("il primo colloquio serve a capire insieme cosa sta succedendo, senza
// impegno a proseguire" / English mirrors this exactly) — no outcome
// promise, no "free session" framing, no urgency, no stats/testimonials.
// Checked against every word in FORBIDDEN_WORDS by hand for both
// languages: gratuito/free, superare/overcome, guarire/cure, risolvere/
// solve, garantito/guaranteed, recensioni/reviews, testimonianze/
// testimonials, sconto/discount, "solo oggi"/"today only", "offerta
// limitata"/"limited offer" — none present either language.
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

// Note on headlineEmphasisWord: the Studio field label says "must match
// one word" (an editorial guideline for the common case), but the actual
// render logic (HeroOverlap.tsx's renderHeadline) does a plain
// `headline.indexOf(emphasisWord)` substring match — no single-token
// restriction in code. This pass's brief explicitly asked for a multi-word
// phrase emphasized ("ansia e attacchi di panico" / "anxiety and panic
// attacks"), which the substring match handles correctly. Flagging the
// mismatch with the field's own guidance text rather than silently
// treating "one word" as a hard rule the code doesn't actually enforce.
const IT_PATCH = {
  "hero.headline": "Psicoterapia per ansia e attacchi di panico — Milano, Monza, online",
  "hero.headlineEmphasisWord": "ansia e attacchi di panico",
  "hero.positioningStatement":
    "Sono Giuseppe Iannone, psicologo psicoterapeuta. Mi occupo di ansia, attacchi di panico e agorafobia con un approccio cognitivo-neuropsicologico. Ricevo a Milano — Citylife e Bicocca — a Monza, a Cernusco sul Naviglio e online, in italiano e in inglese. Il primo colloquio serve a capire insieme cosa sta succedendo, senza impegno a proseguire.",
};

const EN_PATCH = {
  "hero.headline": "Psychotherapy for anxiety and panic attacks — Milan, Monza, online",
  "hero.headlineEmphasisWord": "anxiety and panic attacks",
  "hero.positioningStatement":
    "I'm Giuseppe Iannone, a psychologist and psychotherapist. I work with anxiety, panic attacks, and agoraphobia using a cognitive-neuropsychological approach. I see clients in Milan — Citylife and Bicocca — in Monza, in Cernusco sul Naviglio, and online, in Italian and in English. The first consultation is a chance to understand together what's going on, with no obligation to continue.",
};

async function getHeroFields(id: string) {
  return client.fetch(
    `*[_id == $id][0]{
      "headline": hero.headline,
      "headlineEmphasisWord": hero.headlineEmphasisWord,
      "positioningStatement": hero.positioningStatement
    }`,
    { id },
  );
}

async function patchDoc(id: string, language: "it" | "en", patch: Record<string, string>) {
  const before = await getHeroFields(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));

  // Safety net only — both docs already exist and are published; expected
  // to be a no-op every time this actually runs.
  await client.createIfNotExists({ _id: id, _type: "homePage", language });

  await client.patch(id).set(patch).commit();

  const after = await getHeroFields(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("homePage-it", "it", IT_PATCH);
  await patchDoc("homePage-en", "en", EN_PATCH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
