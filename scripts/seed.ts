import fs from "node:fs";
import path from "node:path";
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

function ctaBlock(
  fields: { heading: string; body?: string; buttonLabel: string; buttonHref: string },
  key: string,
) {
  return { _type: "ctaBlock", _key: key, ...fields };
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

// CMS-wiring pass: uploads a real file from public/ as a Sanity image
// asset (idempotent by originalFilename, same lookup-before-upload pattern
// as getOrUploadPlaceholderImage above) — used for the homepage section
// photos and diploma placeholders, as opposed to that function's one
// shared inline-SVG stand-in.
async function uploadPublicImage(relativePath: string): Promise<string> {
  const filename = path.basename(relativePath);

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
    { filename },
  );
  if (existing?._id) return existing._id;

  const filePath = path.join(process.cwd(), "public", relativePath);
  const buffer = fs.readFileSync(filePath);
  const contentType = filename.endsWith(".svg") ? "image/svg+xml" : "image/webp";

  const asset = await client.assets.upload("image", buffer, {
    filename,
    contentType,
  });

  return asset._id;
}

async function seed() {
  console.log(`Seeding dataset "${dataset}" (project ${projectId})…`);

  const placeholderImageId = await getOrUploadPlaceholderImage();
  console.log(`Placeholder image asset: ${placeholderImageId}`);

  // CMS-wiring pass: section photos + diploma placeholders, uploaded once
  // (idempotent) and referenced by homePage/diploma documents below —
  // the exact files the hardcoded components used to import directly.
  const heroPhotoId = await uploadPublicImage("design-lab/01.webp");
  const chiSonoPhotoId = await uploadPublicImage("design-lab/04.webp");
  const comeFunzionaMediaId = await uploadPublicImage("design-lab/12.webp");
  const diCosaPhotoId = await uploadPublicImage("design-lab/03.webp");
  const finalCtaPhotoId = await uploadPublicImage("design-lab/11.webp");
  const diplomaImageIds = await Promise.all(
    [1, 2, 3, 4, 5].map((n) =>
      uploadPublicImage(`design-lab/diploma-0${n}.svg`),
    ),
  );
  console.log("Section + diploma image assets uploaded.");

  // --- siteSettings ------------------------------------------------------
  // CMS-wiring pass: contactChannels replaces the flat contactEmail/
  // contactPhone/whatsappNumber scalars (createOrReplace below drops them
  // outright, since they're simply not in this payload — see this pass's
  // report for why that's the intended behavior, not an oversight).
  // crisisSupportText corrected to match the text actually live on the
  // site today (a Studio edit had drifted from what this script produced
  // on a fresh run — the "known seed drift" this pass was asked to fix).
  await client.createOrReplace({
    _id: "siteSettings-it",
    _type: "siteSettings",
    language: "it",
    title: "Giuseppe Iannone – Psicologo Psicoterapeuta",
    description: "Sito in costruzione.",
    contactChannels: [
      { _key: "channel-whatsapp", type: "whatsapp", label: "Scrivimi su WhatsApp", value: "+390000000000", order: 1 },
      { _key: "channel-phone", type: "phone", label: "[segnaposto — telefono]", value: "+390000000000", order: 2 },
      { _key: "channel-email", type: "email", label: "[segnaposto — email]", value: "info@example.com", order: 3 },
    ],
    piva: "[segnaposto]",
    crisisSupportText:
      "In caso di emergenza o pericolo immediato, non utilizzare questo sito: chiama il 112 (numero unico di emergenza) o recati al pronto soccorso più vicino. Per un sostegno emotivo immediato puoi contattare Telefono Amico Italia al 02 2327 2327. Questo sito non fornisce assistenza in situazioni di emergenza.",
    carePathway: [
      {
        _key: "pathway-it-1",
        title: "Primo colloquio",
        description:
          "[Segnaposto IT — descrizione primo colloquio. Non definitivo, non clinico.]",
      },
      {
        _key: "pathway-it-2",
        title: "Valutazione",
        description:
          "[Segnaposto IT — descrizione valutazione. Non definitivo, non clinico.]",
      },
      {
        _key: "pathway-it-3",
        title: "Percorso",
        description:
          "[Segnaposto IT — descrizione percorso. Non definitivo, non clinico.]",
      },
      {
        _key: "pathway-it-4",
        title: "Verifica",
        description:
          "[Segnaposto IT — descrizione verifica. Non definitivo, non clinico.]",
      },
    ],
    author: {
      name: "Giuseppe Iannone",
      // Real, already-decided copy (not a placeholder) — matches exactly
      // what HeroOverlap.tsx/StatementBand.tsx hardcoded before this pass;
      // registrationNumber stays the bare "[segnaposto]" tag the hardcoded
      // components appended after "n. ", not a descriptive placeholder
      // sentence, so the rendered line matches the pre-CMS baseline.
      credentials: "Psicologo Psicoterapeuta",
      registrationNumber: "[segnaposto]",
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
    contactChannels: [
      { _key: "channel-whatsapp", type: "whatsapp", label: "Message me on WhatsApp", value: "+390000000000", order: 1 },
      { _key: "channel-phone", type: "phone", label: "[placeholder — phone]", value: "+390000000000", order: 2 },
      { _key: "channel-email", type: "email", label: "[placeholder — email]", value: "info@example.com", order: 3 },
    ],
    piva: "[placeholder]",
    crisisSupportText:
      "If this is an emergency or you are in immediate danger, do not use this website: call 112 (the single European emergency number) or go to your nearest emergency room. For immediate emotional support you can contact Telefono Amico Italia at 02 2327 2327. This website does not provide emergency assistance.",
    carePathway: [
      {
        _key: "pathway-en-1",
        title: "First consultation",
        description:
          "[EN placeholder — first consultation description. Non-final, non-clinical.]",
      },
      {
        _key: "pathway-en-2",
        title: "Assessment",
        description:
          "[EN placeholder — assessment description. Non-final, non-clinical.]",
      },
      {
        _key: "pathway-en-3",
        title: "Treatment",
        description:
          "[EN placeholder — treatment description. Non-final, non-clinical.]",
      },
      {
        _key: "pathway-en-4",
        title: "Review",
        description:
          "[EN placeholder — review description. Non-final, non-clinical.]",
      },
    ],
    author: {
      name: "Giuseppe Iannone",
      credentials: "Psychologist Psychotherapist",
      registrationNumber: "[placeholder]",
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

  // --- faqItem x4 for the homepage's own FAQ section --------------------
  // Distinct from the faqItem-N pairs below (which pillarPage-anxiety's
  // own faqBlock references, out of scope for this pass) — homePage.faq
  // needs exactly 4 items (schema: Rule.length(4)), matching the FAQ
  // pairs the hardcoded FaqSection.tsx used to carry. IT only, no EN
  // counterpart (no EN homepage to reference one). Seeded BEFORE homePage
  // itself — homePage.faq.items references these by _id, and Sanity
  // rejects a mutation that references a not-yet-existing document.
  const homeFaqData = [
    { key: "faqItem-home-1", question: "Come funziona il primo colloquio?", answer: "È un incontro per conoscersi e capire la richiesta, senza impegno di proseguire. [segnaposto]" },
    { key: "faqItem-home-2", question: "Quanto dura una seduta?", answer: "Una seduta dura in genere 50 minuti. [segnaposto]" },
    { key: "faqItem-home-3", question: "Ricevi anche online?", answer: "Sì: le sedute possono svolgersi in studio, a Milano o Monza, oppure online. [segnaposto]" },
    { key: "faqItem-home-4", question: "Quanto può durare un percorso?", answer: "Dipende dalla persona e dalla richiesta: se ne parla apertamente, e la direzione si verifica insieme lungo il percorso. [segnaposto]" },
  ];

  for (const item of homeFaqData) {
    await client.createOrReplace({
      _id: item.key,
      _type: "faqItem",
      language: "it",
      question: item.question,
      answer: [paragraph(item.answer, `${item.key}-answer`)],
    });
  }
  console.log("Homepage FAQ items seeded.");

  // --- homePage --------------------------------------------------------
  // CMS-wiring pass: full rewrite to the new per-section schema shape (see
  // schemaTypes/documents/homePage.ts) — every string below is the exact
  // copy the hardcoded components used to carry, preserved as-is
  // including every [segnaposto] marker, per this pass's own instruction
  // not to invent new placeholder wording. createOrReplace here means the
  // OLD shape's fields (credentialsStrip/methods/body/old pricingSummary/
  // old finalContact) are dropped outright, not merged — there is
  // deliberately no homePage-en this run (EN gate stays; see
  // src/app/[locale]/page.tsx), and the pre-existing homePage-en document
  // (still on the old schema) is left untouched rather than deleted —
  // flagged as a known, disclosed leftover in this pass's report.
  await client.createOrReplace({
    _id: "homePage-it",
    _type: "homePage",
    language: "it",
    title: "Giuseppe Iannone",
    hero: {
      positioningStatement:
        "Uno spazio calmo per affrontare ciò che pesa, con metodo e senza fretta.",
      ctaLabel: "Prenota un primo colloquio",
      photo: { _type: "image", alt: "", asset: { _type: "reference", _ref: heroPhotoId } },
    },
    chiSono: {
      introHeading: "Uno spazio per capire cosa succede, e come stare meglio.",
      introLinkLabel: "Scrivimi",
      kicker: "Il percorso",
      heading: "Chi sono",
      bio: "Da anni accompagno persone che attraversano ansia, cambiamenti di vita e momenti di difficoltà, con un approccio integrato e concreto.",
      storyLinkLabel: "La mia storia",
      watermarkText: "Benvenuto",
      photo: { _type: "image", alt: "", asset: { _type: "reference", _ref: chiSonoPhotoId } },
    },
    comeFunziona: {
      kicker: "Il metodo",
      heading: "Come funziona",
      body: "Ogni percorso nasce da un ascolto attento: strumenti cognitivo-comportamentali, adattati alla persona che ho davanti, non a uno schema fisso.",
      media: { _type: "image", alt: "", asset: { _type: "reference", _ref: comeFunzionaMediaId } },
    },
    formazione: {
      kicker: "Formazione e iscrizioni",
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
        { _key: "counter-1", value: 10, label: "ANNI DI ESPERIENZA CLINICA" },
        { _key: "counter-2", value: 2500, label: "ORE DI FORMAZIONE" },
        { _key: "counter-3", value: 400, label: "ORE DI SUPERVISIONE CLINICA" },
      ],
    },
    diCosa: {
      kicker: "Aree di lavoro",
      heading: "Di cosa mi occupo",
      linkLabel: "Tutte le aree",
      areas: [
        { _key: "area-1", title: "Ansia", subItems: ["Attacchi di panico", "Preoccupazione costante", "Ansia sociale"] },
        { _key: "area-2", title: "Depressione", subItems: ["Stanchezza e demotivazione", "Calo dell'umore", "Isolamento"] },
        { _key: "area-3", title: "Stress", subItems: ["Carico lavorativo", "Tensione fisica", "Difficoltà a staccare"] },
        { _key: "area-4", title: "Cambiamenti di vita", subItems: ["Separazioni", "Transizioni lavorative", "Nuove fasi di vita"] },
      ],
      photo: { _type: "image", alt: "", asset: { _type: "reference", _ref: diCosaPhotoId } },
    },
    statement: {
      statement:
        "Il mio lavoro non è dare risposte pronte, ma costruire insieme un modo di stare nelle cose — più chiaro, più sostenibile.",
    },
    diplomi: {
      kicker: "Percorso formativo",
      heading: "Diplomi e formazione",
    },
    percorso: {
      kicker: "Come si svolge",
      heading: "Come si svolge un percorso",
      paragraph: "Ogni percorso è diverso, ma la struttura è chiara fin dall'inizio: ecco cosa aspettarsi.",
      steps: [
        { _key: "step-1", title: "Primo colloquio", text: "Un incontro per conoscersi e capire la richiesta. 50 minuti, senza impegno di proseguire." },
        { _key: "step-2", title: "Capire insieme", text: "Qualche incontro per mettere a fuoco cosa succede e definire una direzione condivisa." },
        { _key: "step-3", title: "Il percorso", text: "Incontri regolari, con strumenti cognitivo-comportamentali adattati alla persona." },
        { _key: "step-4", title: "Verifiche lungo la strada", text: "Momenti per fare il punto: cosa sta funzionando, cosa adattare." },
      ],
    },
    recognition: {
      kicker: "Situazioni comuni",
      heading: "Ti riconosci?",
      bridgeLine: "Non serve conoscere il nome di quello che senti. A volte si parte da qui. [segnaposto]",
      // visualImage deliberately omitted — the built-in line-art SVG
      // placeholders stay authoritative in code until real photos are
      // supplied, per homePage.recognition's own schema note.
      vignettes: [
        { _key: "vignette-stress", id: "stress", vignette: "Mi sveglio già stanco, e la giornata non è ancora iniziata. Il caffè non aiuta; la lista delle cose da fare, invece, cresce da sola.", area: "Stress", slug: "stress" },
        { _key: "vignette-ansia-1", id: "ansia-1", vignette: "Il cuore accelera senza un motivo apparente. Controllo che sia tutto a posto — ed è tutto a posto. Ma il corpo non ci crede.", area: "Ansia", slug: "ansia" },
        { _key: "vignette-ansia-2", id: "ansia-2", vignette: "La testa non si ferma mai, nemmeno la notte. Ripasso conversazioni, anticipo problemi che forse non arriveranno.", area: "Ansia", slug: "ansia" },
        { _key: "vignette-depressione", id: "depressione", vignette: "Rimando tutto, e poi mi sento in colpa. Le cose che prima mi davano piacere adesso chiedono solo energia.", area: "Depressione", slug: "depressione" },
        { _key: "vignette-cambiamenti", id: "cambiamenti-di-vita", vignette: "Evito situazioni che prima non mi pesavano. Qualcosa è cambiato, ma non saprei dire esattamente quando.", area: "Cambiamenti di vita", slug: "cambiamenti-di-vita" },
      ],
    },
    miniContact: {
      kicker: "Primo contatto",
      heading: "Non serve arrivare con una richiesta chiara.",
      body: "Se vuoi, scrivimi due righe così come viene: ti rispondo personalmente e capiamo insieme se posso esserti utile. [segnaposto]",
    },
    sedi: {
      kicker: "Dove ricevo",
      heading: "Sedi",
      paragraph: "Ricevo in studio a Milano, Monza e Cernusco sul Naviglio, oppure online. [segnaposto]",
    },
    prezzi: {
      kicker: "Trasparenza",
      heading: "Quanto costa un percorso",
      body: "Un percorso ha un costo chiaro, comunicato prima di iniziare. Nessuna sorpresa, nessuna promozione.",
      buttonLabel: "Vedi i prezzi",
      showPrices: true,
      priceLines: [
        { _key: "price-1", label: "Colloquio individuale", price: "€ [segnaposto]", unit: "/ 50 min" },
        { _key: "price-2", label: "Seduta online", price: "€ [segnaposto]", unit: "/ 50 min" },
      ],
      footnote: "Ricevuta sanitaria per ogni seduta. [segnaposto — dettagli sulla pagina prezzi]",
      noPricesSentence: "Il costo viene comunicato con chiarezza al primo contatto, prima di qualsiasi impegno.",
    },
    risorse: {
      kicker: "Per iniziare",
      heading: "Risorse",
      allArticlesLabel: "Tutte le risorse",
    },
    finalCta: {
      kicker: "Primo passo",
      heading: "Non sai da dove iniziare?",
      body: "Se ti riconosci in questi temi, scrivimi: possiamo capire insieme da dove partire.",
      ctaLabel: "Prenota un primo colloquio",
      privacyNote: "I tuoi dati saranno trattati con la massima riservatezza.",
      responseNote: "Rispondo di persona, in genere entro [segnaposto] giorni.",
      googleProfileLabel: "Trovami su Google",
      photo: { _type: "image", alt: "", asset: { _type: "reference", _ref: finalCtaPhotoId } },
    },
    faq: {
      kicker: "Domande frequenti",
      heading: "Domande frequenti",
      linkLabel: "Tutte le domande",
      items: [
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-home-1" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-home-2" },
        { _key: "faq-ref-3", _type: "reference", _ref: "faqItem-home-3" },
        { _key: "faq-ref-4", _type: "reference", _ref: "faqItem-home-4" },
      ],
    },
    seo: {
      _type: "seo",
      metaTitle: "Giuseppe Iannone – Psicologo Psicoterapeuta",
      metaDescription:
        "Psicologo psicoterapeuta a Milano, Monza e online. Il nuovo sito è quasi pronto.",
      noIndex: true,
    },
  });

  // --- sede x4 -----------------------------------------------------------
  // Replaces sediData.ts's hardcoded sedeScenes array — same 4 scenes.
  // "[da confermare con il cliente]"/"[coordinate da verificare]" were
  // CODE COMMENTS next to those fields in the original file, not part of
  // the rendered centerName string itself — a first pass at this seed
  // mistakenly concatenated the annotation into the value (caught via
  // this stage's own pixel-diff against the pre-wiring baseline, fixed
  // here). Coordinates are a best-effort approximation for these
  // addresses, not copied from the original file's exact numbers (already
  // deleted by the time this was written) — the original comment itself
  // flagged them as unverified/provisional, so this is a like-for-like
  // approximation, not a claim of precision the source data didn't have
  // either.
  const sedeData = [
    {
      key: "sede-milano",
      city: "Milano",
      order: 1,
      addresses: [
        { _key: "addr-1", centerName: "Bilingual Therapy", address: "Via Buonarroti 41", lat: 45.4732, lng: 9.1657 },
        { _key: "addr-2", centerName: "Dinamica Bicocca", address: "Piazza della Trivulziana 4/A", lat: 45.5145, lng: 9.2103 },
      ],
    },
    {
      key: "sede-monza",
      city: "Monza",
      order: 2,
      addresses: [{ _key: "addr-1", address: "Via Tolomeo 10", lat: 45.5845, lng: 9.2744 }],
    },
    {
      key: "sede-cernusco",
      city: "Cernusco sul Naviglio",
      order: 3,
      addresses: [
        { _key: "addr-1", centerName: "Centro Andrologico Italiano", address: "Via Brescia 23", lat: 45.5307, lng: 9.3378 },
        { _key: "addr-2", centerName: "Centro di Psicologia", address: "Via Torino 24/11", lat: 45.5312, lng: 9.3350 },
      ],
    },
    {
      key: "sede-online",
      city: "Online",
      order: 4,
      isOnline: true,
      onlineLine: "Sedute su piattaforma sicura, da qualsiasi luogo.",
    },
  ];

  for (const sede of sedeData) {
    await client.createOrReplace({
      _id: sede.key,
      _type: "sede",
      language: "it",
      city: sede.city,
      order: sede.order,
      isOnline: sede.isOnline ?? false,
      onlineLine: sede.onlineLine,
      addresses: sede.addresses ?? [],
    });
  }
  console.log("Sede documents seeded.");

  // --- diploma x5 ----------------------------------------------------------
  // Replaces diplomiData.ts — same illustrative years, same bracketed
  // title/institution placeholders (real scans arrive only after the
  // client reviews them for personal data, per that file's own comment).
  const diplomaData = [
    { key: "diploma-1", title: "[segnaposto — laurea in Psicologia]", institution: "[segnaposto — università]", year: 2012 },
    { key: "diploma-2", title: "[segnaposto — specializzazione in Psicoterapia]", institution: "[segnaposto — scuola di specializzazione]", year: 2016 },
    { key: "diploma-3", title: "[segnaposto — corso di formazione 1]", institution: "[segnaposto — ente formativo 1]", year: 2019 },
    { key: "diploma-4", title: "[segnaposto — corso di formazione 2]", institution: "[segnaposto — ente formativo 2]", year: 2021 },
    { key: "diploma-5", title: "[segnaposto — corso di formazione 3]", institution: "[segnaposto — ente formativo 3]", year: 2023 },
  ];

  for (const [i, diploma] of diplomaData.entries()) {
    await client.createOrReplace({
      _id: diploma.key,
      _type: "diploma",
      language: "it",
      title: diploma.title,
      institution: diploma.institution,
      year: diploma.year,
      order: i + 1,
      image: { _type: "image", asset: { _type: "reference", _ref: diplomaImageIds[i] } },
    });
  }
  console.log("Diploma documents seeded.");

  // --- faqItem x3 (pillarPage-anxiety's own FAQ block — unrelated to the
  // homepage, left exactly as this script already seeded it) -----------
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

  // HARDENING (CMS-wiring pass, post-facto): every block from here down —
  // these 3 faqItems, pillarPage-anxiety, subtopicPage-panic — predates
  // this pass and belongs to a different content world (the knowledge-
  // base), not the homepage. createOrReplace on documents this script
  // doesn't actually own content-wise turned out to silently stomp live
  // Studio edits on every re-run: re-running this script mid-pass reset
  // pillarPage-anxiety's seo.noIndex back to this script's own stale
  // `true`, overwriting what had been flipped to `false` directly in
  // Studio at some point (caught via sitemap.xml losing its pillar
  // entries — see this pass's own report). createIfNotExists below means
  // a fresh/empty dataset still seeds correctly end to end, but an
  // existing document — with whatever live edits it's since received —
  // is never touched again after its first creation.
  for (const item of faqData) {
    const itId = `${item.key}-it`;
    const enId = `${item.key}-en`;

    await client.createIfNotExists({
      _id: itId,
      _type: "faqItem",
      language: "it",
      question: item.it.question,
      answer: [paragraph(item.it.answer, `${item.key}-it-answer`)],
    });

    await client.createIfNotExists({
      _id: enId,
      _type: "faqItem",
      language: "en",
      question: item.en.question,
      answer: [paragraph(item.en.answer, `${item.key}-en-answer`)],
    });

    await client.createIfNotExists(
      translationMetadata(`translation.metadata.${item.key}`, "faqItem", [
        { language: "it", documentId: itId },
        { language: "en", documentId: enId },
      ]),
    );

    faqIds.it.push(itId);
    faqIds.en.push(enId);
  }

  // --- pillarPage: Disturbi d'ansia / Anxiety disorders -------------------
  await client.createIfNotExists({
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
      ctaBlock(
        {
          heading: "[IT segnaposto — non sai da dove iniziare?]",
          body: "[IT segnaposto — se ti riconosci in questi sintomi, parliamone. Non definitivo, non clinico.]",
          buttonLabel: "Scrivimi",
          buttonHref: "/contatti",
        },
        "pillar-it-cta",
      ),
    ],
    seo: {
      _type: "seo",
      metaTitle: "[IT meta title segnaposto — Disturbi d'ansia]",
      metaDescription: "[IT meta description segnaposto — non definitivo.]",
      noIndex: true,
    },
  });

  await client.createIfNotExists({
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
      ctaBlock(
        {
          heading: "[EN placeholder — not sure where you fit?]",
          body: "[EN placeholder — if you recognize these symptoms, let's talk. Non-final, non-clinical.]",
          buttonLabel: "Get in touch",
          buttonHref: "/en/contact",
        },
        "pillar-en-cta",
      ),
    ],
    seo: {
      _type: "seo",
      metaTitle: "[EN meta title placeholder — Anxiety disorders]",
      metaDescription: "[EN meta description placeholder — non-final.]",
      noIndex: true,
    },
  });

  await client.createIfNotExists(
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
  await client.createIfNotExists({
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

  await client.createIfNotExists({
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

  await client.createIfNotExists(
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
