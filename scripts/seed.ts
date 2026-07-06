import { createClient } from "@sanity/client";

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

// --- Portable Text block builders --------------------------------------
// Every seeded body uses obviously-fake placeholder copy, never
// plausible clinical/medical prose — this is a YMYL health site and real
// copy goes through the doctor's review workflow, not the seed script.

function heading(style: "h2" | "h3", text: string, key: string) {
  return {
    _type: "block",
    _key: key,
    style,
    markDefs: [],
    children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
  };
}

function paragraph(text: string, key: string) {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
  };
}

function keyTakeaways(items: string[], key: string) {
  return { _type: "keyTakeaways", _key: key, items };
}

function faqBlockRef(faqItemIds: string[], key: string) {
  return {
    _type: "faqBlock",
    _key: key,
    items: faqItemIds.map((id, i) => ({
      _type: "reference",
      _ref: id,
      _key: `${key}-ref-${i}`,
    })),
  };
}

function relatedTopics(refIds: string[], key: string) {
  return {
    _type: "relatedTopics",
    _key: key,
    items: refIds.map((id, i) => ({
      _type: "reference",
      _ref: id,
      _key: `${key}-ref-${i}`,
    })),
  };
}

function imageBlock(assetId: string, alt: string, key: string) {
  return {
    _type: "image",
    _key: key,
    alt,
    asset: { _type: "reference", _ref: assetId },
  };
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

// --- Placeholder image (idempotent: reused across re-runs) -------------

const PLACEHOLDER_FILENAME = "placeholder.svg";

async function getOrUploadPlaceholderImage(): Promise<string> {
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
    { filename: PLACEHOLDER_FILENAME },
  );
  if (existing?._id) return existing._id;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <rect width="800" height="450" fill="#e4dcce"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="32" fill="#6b6255">PLACEHOLDER IMAGE</text>
</svg>`;

  const asset = await client.assets.upload("image", Buffer.from(svg), {
    filename: PLACEHOLDER_FILENAME,
    contentType: "image/svg+xml",
  });

  return asset._id;
}

async function seed() {
  console.log(`Seeding dataset "${dataset}" (project ${projectId})…`);

  const placeholderImageId = await getOrUploadPlaceholderImage();
  console.log(`Placeholder image asset: ${placeholderImageId}`);

  // --- siteSettings ------------------------------------------------------
  await client.createOrReplace({
    _id: "siteSettings-it",
    _type: "siteSettings",
    language: "it",
    title: "Giuseppe Iannone – Psicologo Psicoterapeuta",
    description: "Sito in costruzione.",
    contactEmail: "info@example.com",
    contactPhone: "+39 000 0000000",
    crisisSupportText:
      "In caso di emergenza, contattare il 112 o recarsi al pronto soccorso più vicino. Questo sito non sostituisce un intervento di emergenza.",
    author: {
      name: "Giuseppe Iannone",
      credentials: "[credenziali segnaposto]",
      registrationNumber: "[numero di iscrizione all'albo — segnaposto]",
      bio: "[Segnaposto IT — biografia. Testo non definitivo, non clinico.]",
    },
    seo: {
      _type: "seo",
      metaTitle: "Giuseppe Iannone – Psicologo Psicoterapeuta",
      metaDescription: "Sito in costruzione. Segnaposto per SEO.",
      noIndex: true,
    },
  });

  await client.createOrReplace({
    _id: "siteSettings-en",
    _type: "siteSettings",
    language: "en",
    title: "Giuseppe Iannone – Psychologist Psychotherapist",
    description: "Site under construction.",
    contactEmail: "info@example.com",
    contactPhone: "+39 000 0000000",
    crisisSupportText:
      "In an emergency, call 112 or go to your nearest emergency room. This website is not a substitute for emergency support.",
    author: {
      name: "Giuseppe Iannone",
      credentials: "[credentials placeholder]",
      registrationNumber: "[professional register number — placeholder]",
      bio: "[EN placeholder — bio. Non-final, non-clinical text.]",
    },
    seo: {
      _type: "seo",
      metaTitle: "Giuseppe Iannone – Psychologist Psychotherapist",
      metaDescription: "Site under construction. SEO placeholder.",
      noIndex: true,
    },
  });

  await client.createOrReplace(
    translationMetadata("translation.metadata.siteSettings", "siteSettings", [
      { language: "it", documentId: "siteSettings-it" },
      { language: "en", documentId: "siteSettings-en" },
    ]),
  );

  // --- homePage ------------------------------------------------------------
  // Real (already-approved) hero copy — not clinical, so no placeholder
  // markers needed here, unlike the pillar/subtopic content below.
  await client.createOrReplace({
    _id: "homePage-it",
    _type: "homePage",
    language: "it",
    title: "Dott. Giuseppe Iannone",
    hero: {
      positioningStatement:
        "[Segnaposto IT — testo di posizionamento. Non definitivo, non clinico.]",
    },
    credentialsStrip: [
      "[Segnaposto IT — anni di esperienza. Non definitivo.]",
      "[Segnaposto IT — formazione. Non definitivo.]",
      "[Segnaposto IT — supervisione clinica. Non definitivo.]",
    ],
    body: [
      paragraph(
        "Psicologo psicoterapeuta a Milano, Monza e online. Il nuovo sito è quasi pronto: torna presto per scoprirlo.",
        "hero-body",
      ),
    ],
    seo: {
      _type: "seo",
      metaTitle: "Dott. Giuseppe Iannone | Psicologo Psicoterapeuta",
      metaDescription:
        "Psicologo psicoterapeuta a Milano, Monza e online. Il nuovo sito è quasi pronto.",
      noIndex: true,
    },
  });

  await client.createOrReplace({
    _id: "homePage-en",
    _type: "homePage",
    language: "en",
    title: "Dr. Giuseppe Iannone",
    hero: {
      positioningStatement:
        "[EN placeholder — positioning statement. Non-final, non-clinical text.]",
    },
    credentialsStrip: [
      "[EN placeholder — years in practice. Non-final.]",
      "[EN placeholder — training. Non-final.]",
      "[EN placeholder — clinical supervision. Non-final.]",
    ],
    body: [
      paragraph(
        "Psychologist and psychotherapist in Milan, Monza, and online. The new website is coming soon — check back shortly.",
        "hero-body",
      ),
    ],
    seo: {
      _type: "seo",
      metaTitle: "Dr. Giuseppe Iannone | Psychologist Psychotherapist",
      metaDescription:
        "Psychologist and psychotherapist in Milan, Monza, and online. New website coming soon.",
      noIndex: true,
    },
  });

  await client.createOrReplace(
    translationMetadata("translation.metadata.homePage", "homePage", [
      { language: "it", documentId: "homePage-it" },
      { language: "en", documentId: "homePage-en" },
    ]),
  );

  // --- faqItem x3 ------------------------------------------------------
  const faqData = [
    {
      key: "faqItem-1",
      it: {
        question: "[IT domanda segnaposto 1]",
        answer: "[IT risposta segnaposto 1 — testo non definitivo, non clinico.]",
      },
      en: {
        question: "[EN placeholder question 1]",
        answer: "[EN placeholder answer 1 — non-final, non-clinical text.]",
      },
    },
    {
      key: "faqItem-2",
      it: {
        question: "[IT domanda segnaposto 2]",
        answer: "[IT risposta segnaposto 2 — testo non definitivo, non clinico.]",
      },
      en: {
        question: "[EN placeholder question 2]",
        answer: "[EN placeholder answer 2 — non-final, non-clinical text.]",
      },
    },
    {
      key: "faqItem-3",
      it: {
        question: "[IT domanda segnaposto 3]",
        answer: "[IT risposta segnaposto 3 — testo non definitivo, non clinico.]",
      },
      en: {
        question: "[EN placeholder question 3]",
        answer: "[EN placeholder answer 3 — non-final, non-clinical text.]",
      },
    },
  ];

  const faqIds: { it: string[]; en: string[] } = { it: [], en: [] };

  for (const item of faqData) {
    const itId = `${item.key}-it`;
    const enId = `${item.key}-en`;

    await client.createOrReplace({
      _id: itId,
      _type: "faqItem",
      language: "it",
      question: item.it.question,
      answer: [paragraph(item.it.answer, `${item.key}-it-answer`)],
    });

    await client.createOrReplace({
      _id: enId,
      _type: "faqItem",
      language: "en",
      question: item.en.question,
      answer: [paragraph(item.en.answer, `${item.key}-en-answer`)],
    });

    await client.createOrReplace(
      translationMetadata(`translation.metadata.${item.key}`, "faqItem", [
        { language: "it", documentId: itId },
        { language: "en", documentId: enId },
      ]),
    );

    faqIds.it.push(itId);
    faqIds.en.push(enId);
  }

  // --- pillarPage: Disturbi d'ansia / Anxiety disorders -------------------
  await client.createOrReplace({
    _id: "pillarPage-anxiety-it",
    _type: "pillarPage",
    language: "it",
    title: "Disturbi d'ansia",
    slug: { _type: "slug", current: "disturbi-d-ansia" },
    body: [
      heading("h2", "[IT segnaposto — H2]", "pillar-it-h2"),
      paragraph(
        "[IT segnaposto — corpo testo lorem ipsum dolor sit amet, consectetur adipiscing elit. Testo non definitivo, non clinico.]",
        "pillar-it-p1",
      ),
      keyTakeaways(
        [
          "[IT punto chiave segnaposto 1]",
          "[IT punto chiave segnaposto 2]",
          "[IT punto chiave segnaposto 3]",
        ],
        "pillar-it-takeaways",
      ),
      heading("h3", "[IT segnaposto — H3]", "pillar-it-h3"),
      imageBlock(
        placeholderImageId,
        "[IT testo alternativo segnaposto]",
        "pillar-it-image",
      ),
      faqBlockRef(faqIds.it, "pillar-it-faq"),
    ],
    seo: {
      _type: "seo",
      metaTitle: "[IT meta title segnaposto — Disturbi d'ansia]",
      metaDescription: "[IT meta description segnaposto — non definitivo.]",
      noIndex: true,
    },
  });

  await client.createOrReplace({
    _id: "pillarPage-anxiety-en",
    _type: "pillarPage",
    language: "en",
    title: "Anxiety disorders",
    slug: { _type: "slug", current: "anxiety-disorders" },
    body: [
      heading("h2", "[EN placeholder — H2]", "pillar-en-h2"),
      paragraph(
        "[EN placeholder body copy — lorem ipsum dolor sit amet, consectetur adipiscing elit. Non-final, non-clinical text.]",
        "pillar-en-p1",
      ),
      keyTakeaways(
        [
          "[EN key takeaway placeholder 1]",
          "[EN key takeaway placeholder 2]",
          "[EN key takeaway placeholder 3]",
        ],
        "pillar-en-takeaways",
      ),
      heading("h3", "[EN placeholder — H3]", "pillar-en-h3"),
      imageBlock(
        placeholderImageId,
        "[EN placeholder alt text]",
        "pillar-en-image",
      ),
      faqBlockRef(faqIds.en, "pillar-en-faq"),
    ],
    seo: {
      _type: "seo",
      metaTitle: "[EN meta title placeholder — Anxiety disorders]",
      metaDescription: "[EN meta description placeholder — non-final.]",
      noIndex: true,
    },
  });

  await client.createOrReplace(
    translationMetadata(
      "translation.metadata.pillarPage-anxiety",
      "pillarPage",
      [
        { language: "it", documentId: "pillarPage-anxiety-it" },
        { language: "en", documentId: "pillarPage-anxiety-en" },
      ],
    ),
  );

  // --- subtopicPage: Attacchi di panico / Panic attacks -------------------
  await client.createOrReplace({
    _id: "subtopicPage-panic-it",
    _type: "subtopicPage",
    language: "it",
    title: "Attacchi di panico",
    parentPillar: { _type: "reference", _ref: "pillarPage-anxiety-it" },
    slug: { _type: "slug", current: "attacchi-di-panico" },
    body: [
      heading("h2", "[IT segnaposto — H2]", "subtopic-it-h2"),
      paragraph(
        "[IT segnaposto — corpo testo lorem ipsum dolor sit amet. Testo non definitivo, non clinico.]",
        "subtopic-it-p1",
      ),
      relatedTopics(["pillarPage-anxiety-it"], "subtopic-it-related"),
      heading("h3", "[IT segnaposto — H3]", "subtopic-it-h3"),
    ],
    seo: {
      _type: "seo",
      metaTitle: "[IT meta title segnaposto — Attacchi di panico]",
      metaDescription: "[IT meta description segnaposto — non definitivo.]",
      noIndex: true,
    },
  });

  await client.createOrReplace({
    _id: "subtopicPage-panic-en",
    _type: "subtopicPage",
    language: "en",
    title: "Panic attacks",
    parentPillar: { _type: "reference", _ref: "pillarPage-anxiety-en" },
    slug: { _type: "slug", current: "panic-attacks" },
    body: [
      heading("h2", "[EN placeholder — H2]", "subtopic-en-h2"),
      paragraph(
        "[EN placeholder body copy — lorem ipsum dolor sit amet. Non-final, non-clinical text.]",
        "subtopic-en-p1",
      ),
      relatedTopics(["pillarPage-anxiety-en"], "subtopic-en-related"),
      heading("h3", "[EN placeholder — H3]", "subtopic-en-h3"),
    ],
    seo: {
      _type: "seo",
      metaTitle: "[EN meta title placeholder — Panic attacks]",
      metaDescription: "[EN meta description placeholder — non-final.]",
      noIndex: true,
    },
  });

  await client.createOrReplace(
    translationMetadata(
      "translation.metadata.subtopicPage-panic",
      "subtopicPage",
      [
        { language: "it", documentId: "subtopicPage-panic-it" },
        { language: "en", documentId: "subtopicPage-panic-en" },
      ],
    ),
  );

  console.log("Seed complete.");
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
