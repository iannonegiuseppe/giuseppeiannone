import { createClient } from "@sanity/client";

// Build the English homepage locale — targeted upsert, NOT a reseed. Same
// discipline as every other patch-*.ts script in this directory:
// upsertManagedSingleton (createIfNotExists + patch.set on named top-level
// fields only) — never createOrReplace, so nothing already in the dataset
// (e.g. the video section, entered by hand in Studio and never seeded)
// gets wiped.
//
// Context: homePage-en existed but was stale — still on the pre-migration
// schema (a single `body` Portable Text block + basic seo, per this
// script's own pre-run inspection), while homePage-it has been on the
// current 15-section schema since the CMS-wiring pass. seed.ts's own
// comment already discloses this ("there is deliberately no homePage-en
// this run... a known, disclosed leftover"). This script is that migration:
// every field homePage-it's schema defines, set on homePage-en too, with
// the current IT copy translated to English.
//
// TRANSLATION STATUS — provisional, not final:
// The Italian source copy is itself placeholder ([segnaposto] throughout —
// Giuseppe's real lines are still owed for hero/recognition/hope/etc., per
// every patch-*.ts script's own comments). This English copy is therefore
// a translation OF placeholders, not a finished translation — it exists so
// /en renders in parallel with /it, not as approved final copy. Every
// [segnaposto] marker is preserved as [placeholder] (matching the EXISTING
// convention already used for siteSettings-en in scripts/seed.ts, not a
// new one invented here). When Giuseppe's real Italian copy lands, this
// English needs a real re-translation pass, not just an unmarking.
//
// DEONTOLOGY: every string below was checked by hand against docs/
// design-direction.md §9 — no stronger claim in English than the Italian
// makes (no "cure"/"solve"/"guaranteed"/"free"/"reviews"/discount/urgency
// language anywhere). Sanity's own deontologyCheck validator only matches
// an ITALIAN word list (see src/sanity/schemaTypes/lib/deontologyValidator.ts
// — "guarito", "gratuito", etc.), so it will NOT catch an English §9
// violation — this pass's manual check is the only guard for this
// document. Flagged separately as a real validator gap, not fixed here
// (out of scope for this task; the validator itself wasn't asked for).
//
// NOT in scope (flagged, not silently expanded into): `sede`, `diploma`
// are separate document types with their own per-locale queries
// (sedesQuery/diplomasQuery), not fields of homePage itself — no `sede`/
// `diploma` documents exist with language:"en" yet, so the Sedi and
// Diplomi sections will render with correct EN section copy (kicker/
// heading/paragraph, set below) but an EMPTY list on /en until those
// separate document types get their own EN pass. `faqItem-home-{1..4}`
// ARE created here (see FAQ_ITEMS_EN below) since they're directly
// referenced BY homePage.faq.items — leaving them referencing the IT
// faqItem docs would show Italian FAQ text on the English page, worse
// than the alternative of translating four short Q&As.
//
// CTA COORDINATION: hero.ctaLabel here is "Begin the journey" — real
// English, not a copy of the Italian. That means headerSettings-en's own
// ctaButtonText (patched to literal "Inizia il percorso" in the prior
// header-CTA task, deliberately mirroring what the hero ACTUALLY rendered
// at the time) must be updated in lockstep here too, or the two would go
// back to disagreeing — see the headerSettings-en patch at the bottom of
// main().
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

async function upsertManagedSingleton(
  id: string,
  type: string,
  fields: Record<string, unknown>,
) {
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

// Real photo/video assets — reused verbatim from homePage-it. Photos and
// the video file are the same person/practice, not locale-specific
// content; only the alt text (accessibility copy, genuinely locale-
// specific) is translated where the IT source had a real (non-empty)
// alt string.
const ASSETS = {
  heroPhoto: "image-30c4d8e9b941fe10eb34120d119c6405b6b42cd6-1880x1990-png",
  chiSonoPhoto: "image-81a7c2c5199f0ec1f4188c1e3e1f0dc006fc9136-1800x1201-webp",
  diCosaPhoto: "image-a3899c6acbbbbc4d9c3317c48275ec94536d52e6-1713x2500-png",
  finalCtaPhoto: "image-282d1ab8f152337a3a861a84ad188d25a2e90b14-1920x1281-webp",
  videoFile: "file-4fdd19a35d3af251d775d583da3b8024081b1609-mp4",
  videoPoster: "image-ef1f3387d4fedd3dd2b330e1401748e76a11cbbb-1000x667-jpg",
};

const FAQ_ITEMS_EN: { id: string, itId: string, question: string; answer: string }[] = [
  {
    id: "faqItem-home-1-en",
    itId: "faqItem-home-1",
    question: "How does the first consultation work?",
    answer:
      "It's a meeting to get to know each other and understand what you need, with no obligation to continue. [placeholder]",
  },
  {
    id: "faqItem-home-2-en",
    itId: "faqItem-home-2",
    question: "How long does a session last?",
    answer: "A session usually lasts 50 minutes. [placeholder]",
  },
  {
    id: "faqItem-home-3-en",
    itId: "faqItem-home-3",
    question: "Do you also see clients online?",
    answer:
      "Yes: sessions can take place in person, in Milan or Monza, or online. [placeholder]",
  },
  {
    id: "faqItem-home-4-en",
    itId: "faqItem-home-4",
    question: "How long can a course of therapy last?",
    answer:
      "It depends on the person and what they need: this is discussed openly, and the direction is reviewed together along the way. [placeholder]",
  },
];

const HOMEPAGE_EN = {
  language: "en",
  title: "Giuseppe Iannone",
  hero: {
    headline: "A safe space to find clarity and wellbeing.",
    headlineEmphasisWord: "clarity",
    positioningStatement:
      "A course of psychotherapy built on listening, respect, and professionalism, to help you feel better with yourself and with others.",
    ctaLabel: "Begin the journey",
    photo: { _type: "image", alt: "Giuseppe Iannone", asset: { _type: "reference", _ref: ASSETS.heroPhoto } },
  },
  chiSono: {
    introHeading: "A space to understand what's going on, and how to feel better.",
    introLinkLabel: "Write to me",
    kicker: "The journey",
    heading: "About me",
    bio: "For years I've supported people through anxiety, life changes, and difficult moments, with an integrated, practical approach.",
    methodsBody:
      "Every course of therapy starts with attentive listening: cognitive-behavioural tools, adapted to the person in front of me, not to a fixed formula.",
    storyLinkLabel: "My story",
    watermarkText: "Welcome",
    photo: { _type: "image", alt: "", asset: { _type: "reference", _ref: ASSETS.chiSonoPhoto } },
  },
  formazione: {
    kicker: "Training and registrations",
    // Real regulatory/credential data — left in Italian deliberately (the
    // actual verifiable register entries are Italian; inventing English
    // names for a specific Italian professional body would misrepresent
    // them, not translate them). Matches this task's own instruction to
    // leave proper nouns/registration numbers untranslated.
    credentials: [
      "Iscrizione all'Albo degli Psicologi della Lombardia — n. [segnaposto]",
      "Psicologo Psicoterapeuta — indirizzo cognitivo-comportamentale",
      "[segnaposto — società/associazione professionale 1]",
      "[segnaposto — società/associazione professionale 2]",
      "[segnaposto — corso/specializzazione 1]",
      "[segnaposto — corso/specializzazione 2]",
      "[segnaposto — corso/specializzazione 3]",
      "Laurea in Psicologia — [università, segnaposto]",
    ],
    counters: [
      { _key: "counter-1", value: 10, label: "YEARS OF CLINICAL EXPERIENCE" },
      { _key: "counter-2", value: 2500, label: "HOURS OF TRAINING" },
      { _key: "counter-3", value: 400, label: "HOURS OF CLINICAL SUPERVISION" },
    ],
  },
  diCosa: {
    kicker: "Areas of focus",
    heading: "What I work with",
    linkLabel: "All areas",
    areas: [
      { _key: "area-1", title: "Anxiety", subItems: ["Panic attacks", "Constant worry", "Social anxiety"] },
      { _key: "area-2", title: "Depression", subItems: ["Fatigue and low motivation", "Low mood", "Isolation"] },
      { _key: "area-3", title: "Stress", subItems: ["Work overload", "Physical tension", "Difficulty switching off"] },
      { _key: "area-4", title: "Life changes", subItems: ["Separations", "Career transitions", "New life stages"] },
    ],
    photo: { _type: "image", alt: "", asset: { _type: "reference", _ref: ASSETS.diCosaPhoto } },
  },
  diplomi: {
    kicker: "Training path",
    heading: "Diplomas and training",
  },
  percorso: {
    kicker: "How it works",
    heading: "How a course of therapy works",
    paragraph: "Every course of therapy is different, but the structure is clear from the start: here's what to expect.",
    steps: [
      { _key: "step-1", title: "First consultation", text: "A meeting to get to know each other and understand what you need. 50 minutes, no obligation to continue." },
      { _key: "step-2", title: "Understanding together", text: "A few sessions to focus on what's happening and define a shared direction." },
      { _key: "step-3", title: "The course of therapy", text: "Regular sessions, with cognitive-behavioural tools adapted to the person." },
      { _key: "step-4", title: "Check-ins along the way", text: "Moments to take stock: what's working, what to adjust." },
    ],
  },
  recognition: {
    kicker: "Common situations",
    heading: "Does this sound familiar?",
    bridgeLine: "You don't need a name for what you're feeling. Sometimes this is where it starts. [placeholder]",
    fragments: [
      { _key: "fragment-anchor", label: "", text: "From the outside, everything looks fine. Inside, it isn't. [placeholder]", emphasisWord: "Inside", tier: "anchor" },
      { _key: "fragment-stress", label: "Stress", text: "I wake up already tired, and the day hasn't even started. [placeholder]", emphasisWord: "already tired", tier: "dominant" },
      { _key: "fragment-rimuginio", label: "Overthinking", text: "I put off decisions until they're not decisions anymore, just emergencies. [placeholder]", emphasisWord: "emergencies", tier: "dominant" },
      { _key: "fragment-ansia", label: "Anxiety", text: "My heart races for no clear reason. But my body doesn't believe that. [placeholder]", tier: "peripheral" },
      { _key: "fragment-relazioni", label: "Relationships", text: "I always say yes. Then there's nothing left for me. [placeholder]", tier: "peripheral" },
    ],
  },
  hope: {
    eyebrow: "A possible path [placeholder]",
    heading: "It hasn't always been this way. And it doesn't have to stay this way. [placeholder]",
    headingEmphasisWord: "doesn't have to stay",
  },
  sedi: {
    kicker: "Where I see clients",
    heading: "Locations",
    paragraph: "I see clients in person in Milan, Monza, and Cernusco sul Naviglio, or online. [placeholder]",
  },
  prezzi: {
    kicker: "Transparency",
    heading: "How much a course of therapy costs",
    body: "A course of therapy has a clear cost, shared before you begin. No surprises, no promotions.",
    buttonLabel: "See prices",
    showPrices: true,
    priceLines: [
      { _key: "price-1", label: "Individual session", price: "€ [placeholder]", unit: "/ 50 min" },
      { _key: "price-2", label: "Online session", price: "€ [placeholder]", unit: "/ 50 min" },
    ],
    footnote: "Health receipt for every session. [placeholder — details on the pricing page]",
    noPricesSentence: "The cost is shared clearly at first contact, before any commitment.",
  },
  risorse: {
    kicker: "To get started",
    heading: "Resources",
    allArticlesLabel: "All resources",
  },
  video: {
    kicker: "THE FIRST SESSION",
    heading: "See how I work, before you write to me",
    lead: "A short video to get to know me. Watch how a first meeting unfolds and see whether you'd feel comfortable: choosing the right person matters more than anything else.",
    file: { _type: "file", asset: { _type: "reference", _ref: ASSETS.videoFile } },
    poster: { _type: "image", alt: "See how I work, before you write to me", asset: { _type: "reference", _ref: ASSETS.videoPoster } },
  },
  finalCta: {
    kicker: "First step",
    heading: "Not sure where to start?",
    body: "If any of this sounds familiar, write to me: we can work out together where to start.",
    // Unused in rendering (see FinalContactSection.tsx's own HONESTY-RULE
    // flag on homePage.finalCta.ctaLabel) — translated anyway so the
    // schema-required field holds valid, non-Italian, non-final content
    // rather than a stale value, matching this document's own posture.
    ctaLabel: "Book a first consultation",
    privacyNote: "Your data will be treated with the utmost confidentiality.",
    responseNote: "I respond personally, usually within [placeholder] days.",
    googleProfileLabel: "Find me on Google",
    photo: { _type: "image", alt: "", asset: { _type: "reference", _ref: ASSETS.finalCtaPhoto } },
  },
  faq: {
    kicker: "Frequently asked questions",
    heading: "Frequently asked questions",
    linkLabel: "All questions",
    items: FAQ_ITEMS_EN.map((item, i) => ({
      _key: `faq-ref-${i + 1}`,
      _type: "reference",
      _ref: item.id,
    })),
  },
  seo: {
    _type: "seo",
    metaTitle: "Giuseppe Iannone – Psychologist Psychotherapist",
    metaDescription: "Psychologist psychotherapist in Milan, Monza, and online. The new site is almost ready.",
    noIndex: true,
  },
};

function paragraph(text: string, key: string) {
  return {
    _key: key,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `${key}-span`, _type: "span", marks: [], text }],
  };
}

async function getHomePageSummary(id: string) {
  return client.fetch(
    `*[_id == $id][0]{
      _type,
      "hasOldBody": defined(body),
      "hasHero": defined(hero),
      "heroHeadline": hero.headline,
      "heroCta": hero.ctaLabel,
      "recognitionFragmentCount": count(recognition.fragments),
      "hopeHeading": hope.heading,
      "faqItemIds": faq.items[]._ref
    }`,
    { id },
  );
}

async function main() {
  // faqItem-home-{n}-en must exist BEFORE homePage-en's faq.items
  // references are set — Sanity rejects a mutation referencing a
  // not-yet-existing document (same ordering constraint scripts/seed.ts's
  // own header/footer block documents, reference targets first).
  console.log("=== faqItem-home-{1..4}-en ===");
  for (const item of FAQ_ITEMS_EN) {
    const beforeItem = await client.fetch(`*[_id == $id][0]{question}`, { id: item.id });
    console.log(`BEFORE ${item.id}:`, JSON.stringify(beforeItem));

    await upsertManagedSingleton(item.id, "faqItem", {
      language: "en",
      question: item.question,
      answer: [paragraph(item.answer, `${item.id}-answer`)],
    });

    await client.createOrReplace(
      translationMetadata(`translation.metadata.${item.itId}`, "faqItem", [
        { language: "it", documentId: item.itId },
        { language: "en", documentId: item.id },
      ]),
    );

    const afterItem = await client.fetch(`*[_id == $id][0]{question}`, { id: item.id });
    console.log(`AFTER  ${item.id}:`, JSON.stringify(afterItem));
  }

  console.log("\n=== homePage-en ===");
  const before = await getHomePageSummary("homePage-en");
  console.log("BEFORE:", JSON.stringify(before, null, 2));

  await upsertManagedSingleton("homePage-en", "homePage", HOMEPAGE_EN);

  const after = await getHomePageSummary("homePage-en");
  console.log("AFTER:", JSON.stringify(after, null, 2));

  // CTA coordination — see this file's own top comment. hero.ctaLabel is
  // now real English ("Begin the journey"), so the header CTA (patched to
  // the literal Italian "Inizia il percorso" in the prior header-CTA task,
  // deliberately mirroring what the hero rendered AT THAT TIME) must move
  // in lockstep or the two go back to disagreeing.
  console.log("\n=== headerSettings-en.ctaButtonText (coordination) ===");
  const beforeHeader = await client.fetch(`*[_id == "headerSettings-en"][0]{ctaButtonText}`);
  console.log("BEFORE:", JSON.stringify(beforeHeader));
  await client.patch("headerSettings-en").set({ ctaButtonText: "Begin the journey" }).commit();
  const afterHeader = await client.fetch(`*[_id == "headerSettings-en"][0]{ctaButtonText}`);
  console.log("AFTER: ", JSON.stringify(afterHeader));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
