// Centralized copy for the density preview, both locales. Page-header
// chrome (addressed to the client) stays English regardless of which
// content locale is being viewed — it's a note about the page, not part
// of the demonstrated content. Section content below it is real,
// per-locale copy from the live Sanity data (scripts/patch-chi-sono-
// section.ts) wherever real copy exists.
export type DensityLocale = "it" | "en";

// Rework pass: the earlier English "proposed direction" framing was still
// readable as a candidate finished page. Rewritten in Italian, addressed
// directly to the client, explicit that these are individual reworked
// blocks — not the assembled page — since that was the actual
// misreading risk this header exists to prevent.
export const PAGE_HEADER = {
  title: "Blocchi rilavorati — anteprima",
  lines: [
    "Questi sono i singoli blocchi ridisegnati, non la pagina completa: la home definitiva unirà questi blocchi a quelli già esistenti.",
    "Le cornici grigie indicano dove andranno le fotografie.",
  ],
};

// Real copy — kicker/heading/paragraph from scripts/seed.ts:468-471 (it)
// / scripts/patch-homepage-en.ts:218-221 (en), still live: only
// `percorso.steps` was ever patched afterward (scripts/patch-journey-
// copy.ts, dot-path scoped). Steps themselves are that LATER, current
// set (patch-journey-copy.ts's STEPS_IT/STEPS_EN), not the older
// seed.ts step titles it superseded.
//
// atAGlance: new 3-5 word summaries for the new row (Section 01's own
// addition) — shorter than each step's existing shortLine, not a
// duplicate of it. Everything else (title, shortLine, expandedText) is
// the real, unedited live copy.
export const METODO = {
  it: {
    label: "01 — Metodo, enhanced",
    kicker: "Come si svolge",
    heading: "Come si svolge un percorso",
    paragraph:
      "Ogni percorso è diverso, ma la struttura è chiara fin dall'inizio: ecco cosa aspettarsi.",
    steps: [
      {
        title: "Primo contatto",
        atAGlance: "Scrivimi, rispondo in 24 ore",
        shortLine: "Mi scrivi come ti è più comodo. Rispondo entro 24 ore. [segnaposto]",
        expandedText:
          "Non serve preparare niente. Un messaggio, una mail, una chiamata — come preferisci. Mi racconti quello che ti va, e ti rispondo entro 24 ore. [segnaposto]",
      },
      {
        title: "Primo colloquio",
        atAGlance: "Ci conosciamo, senza fretta",
        shortLine: "Ci conosciamo. Capiamo insieme cosa sta succedendo. [segnaposto]",
        expandedText:
          "Il primo incontro serve a conoscerci. Non devi spiegare tutto subito: capiamo insieme cosa sta succedendo e se posso esserti utile. [segnaposto]",
      },
      {
        title: "Il lavoro insieme",
        atAGlance: "Un metodo su misura",
        shortLine: "Un metodo chiaro, adattato a te. [segnaposto]",
        expandedText:
          "Lavoriamo con un metodo chiaro, adattato alla tua situazione — non risposte pronte, ma strumenti che restano tuoi. [segnaposto]",
      },
      {
        title: "Verso l'autonomia",
        atAGlance: "Finché non servo più",
        shortLine: "L'obiettivo è non averne più bisogno. [segnaposto]",
        expandedText:
          "Il percorso ha una direzione: arrivare al punto in cui non ti servo più. L'obiettivo non è restare in terapia, ma stare bene senza. [segnaposto]",
      },
    ],
  },
  en: {
    label: "01 — Metodo, enhanced",
    kicker: "How it works",
    heading: "How a course of therapy works",
    paragraph:
      "Every course of therapy is different, but the structure is clear from the start: here's what to expect.",
    steps: [
      {
        title: "First contact",
        atAGlance: "Write to me anytime",
        shortLine: "You write to me however's easiest for you. I reply within 24 hours. [placeholder]",
        expandedText:
          "You don't need to prepare anything. A message, an email, a call — whatever you prefer. Tell me what's on your mind, and I'll reply within 24 hours. [placeholder]",
      },
      {
        title: "First consultation",
        atAGlance: "Getting to know each other",
        shortLine: "We get to know each other. Together we understand what's going on. [placeholder]",
        expandedText:
          "The first meeting is about getting to know each other. You don't need to explain everything right away: together we understand what's going on and whether I can help. [placeholder]",
      },
      {
        title: "Working together",
        atAGlance: "A method made for you",
        shortLine: "A clear method, adapted to you. [placeholder]",
        expandedText:
          "We work with a clear method, adapted to your situation — not ready-made answers, but tools that stay yours. [placeholder]",
      },
      {
        title: "Toward independence",
        atAGlance: "Until you don't need me",
        shortLine: "The goal is to no longer need it. [placeholder]",
        expandedText:
          "The journey has a direction: reaching the point where you no longer need me. The goal isn't to stay in therapy, but to be well without it. [placeholder]",
      },
    ],
  },
};

// Real copy, verbatim from scripts/patch-chi-sono-section.ts — all 5
// paragraphs, none cut. Split 2 / 3 around the photo break per the
// approved plan.
export const CHI_SONO = {
  it: {
    label: "02 — Chi sono, broken up",
    title: "Conosco l'ansia",
    emphasis: "da vicino",
    titleEnd: ".",
    paragraphsBeforePhoto: [
      "Siena, 2001. Studiavo Filologia e della psicologia non sapevo nulla. Un giorno, durante una lezione, il cuore ha iniziato a correre all'improvviso, senza motivo. Era un attacco di panico — ma allora non sapevo dargli un nome.",
      "Anni dopo, ad Amsterdam, dove insegnavo italiano, ho chiesto aiuto a uno psicoterapeuta. Dare un nome e un senso a quello che mi succedeva ha cambiato la direzione della mia vita: ho deciso di ricominciare dagli studi e di dedicarmi alla psicologia.",
    ],
    paragraphsAfterPhoto: [
      "Ho studiato Neuroscienze Cognitive e Cliniche all'Università di Maastricht e ho lavorato come ricercatore sui meccanismi dell'ansia e del panico. Poi la specializzazione in Psicoterapia Cognitivo-Neuropsicologica e le esperienze cliniche nei reparti di psichiatria, tra Milano e Brescia.",
      "Lavoro in italiano e in inglese. Negli anni ho accompagnato persone arrivate a Milano da ogni parte del mondo: studiare e vivere all'estero mi ha insegnato quanto conti potersi raccontare nella lingua in cui ci si sente a casa.",
      "Oggi mi occupo esclusivamente di ansia e panico, e delle difficoltà che li accompagnano. Ricevo a Milano, Monza, Cernusco sul Naviglio e online. Non sono un tuttologo — e lo considero un punto di forza.",
    ],
    photoLabel: "Foto da scattare — orizzontale 16:9",
    photoCaption: "Giuseppe nello studio, orizzontale 16:9, nessun cliente presente.",
  },
  en: {
    label: "02 — Chi sono, broken up",
    title: "I know anxiety",
    emphasis: "first-hand",
    titleEnd: ".",
    paragraphsBeforePhoto: [
      "Siena, 2001. I was studying Philology and knew nothing about psychology. One day, during a lecture, my heart suddenly started racing for no reason. It was a panic attack — though I didn't have a name for it back then.",
      "Years later, in Amsterdam, where I was teaching Italian, I sought help from a psychotherapist. Putting a name and a meaning to what was happening to me changed the direction of my life: I decided to go back to studying and dedicate myself to psychology.",
    ],
    paragraphsAfterPhoto: [
      "I studied Cognitive and Clinical Neuroscience at Maastricht University and worked as a researcher on the mechanisms of anxiety and panic. Then came the specialization in Cognitive-Neuropsychological Psychotherapy and clinical experience in psychiatric wards, between Milan and Brescia.",
      "I work in both Italian and English. Over the years I've worked with people who came to Milan from all over the world: studying and living abroad taught me how much it matters to be able to talk about yourself in the language you feel most at home in.",
      "Today I work exclusively with anxiety and panic, and the difficulties that come with them. I see clients in Milan, Monza, Cernusco sul Naviglio and online. I'm not a jack-of-all-trades — and I consider that a strength.",
    ],
    photoLabel: "Photo to shoot — horizontal 16:9",
    photoCaption: "Giuseppe in the consulting room, horizontal 16:9, no client present.",
  },
};

// Section 03 — Credentials band. Plain facts only (§9): a count of years
// or qualifications, never a claim about outcomes. No icons.
export const CREDENTIALS = {
  it: {
    label: "03 — Credenziali",
    items: [
      { value: "13", unit: "anni", detail: "di pratica clinica" },
      { value: "14", unit: "anni", detail: "di formazione" },
      { value: "5", unit: "titoli", detail: "e specializzazioni" },
      { value: "IT / EN", unit: "", detail: "italiano e inglese" },
    ],
  },
  en: {
    label: "03 — Credentials",
    items: [
      { value: "13", unit: "years", detail: "of clinical practice" },
      { value: "14", unit: "years", detail: "of training" },
      { value: "5", unit: "qualifications", detail: "and specializations" },
      { value: "IT / EN", unit: "", detail: "Italian and English" },
    ],
  },
};

// Section 04 — Aree with weight. Real copy verbatim from
// scripts/patch-aree-section.ts (live seeded content, [segnaposto]/
// [placeholder] tags included as-is, same convention as METODO/CHI_SONO
// above) — all 6 areas, order unchanged. No topic icons: a large quiet
// numeral per row is the only added device, reusing the same numeral
// language as Metodo/Diplomi rather than inventing a new one.
export const AREE = {
  it: {
    label: "04 — Aree, con peso",
    kicker: "Aree di intervento",
    heading: "Di cosa mi occupo",
    intro: "Lavoro su un'area precisa: l'ansia e ciò che spesso la accompagna. [segnaposto]",
    rows: [
      {
        title: "Ansia e disturbi d'ansia",
        detail: "Quando la preoccupazione diventa costante e occupa le giornate. [segnaposto]",
      },
      {
        title: "Attacchi di panico e agorafobia",
        detail:
          "Il corpo che si allarma all'improvviso, e i luoghi che si iniziano a evitare. [segnaposto]",
      },
      {
        title: "Depressione",
        detail: "Quando l'energia e l'interesse si spengono, e tutto pesa. [segnaposto]",
      },
      {
        title: "Disfunzioni sessuali",
        detail: "Le difficoltà nell'intimità, spesso legate ad ansia e stress. [segnaposto]",
      },
      {
        title: "Stress e burnout",
        detail: "Quando il carico supera le risorse, sul lavoro e fuori. [segnaposto]",
      },
      {
        title: "Difficoltà relazionali",
        detail: "I rapporti che logorano: in coppia, in famiglia, sul lavoro. [segnaposto]",
      },
    ],
  },
  en: {
    label: "04 — Aree, con peso",
    kicker: "Areas of focus",
    heading: "What I help with",
    intro: "I work on one precise area: anxiety and what often comes with it. [placeholder]",
    rows: [
      {
        title: "Anxiety and anxiety disorders",
        detail: "When worry becomes constant and takes over your days. [placeholder]",
      },
      {
        title: "Panic attacks and agoraphobia",
        detail:
          "The body that suddenly sounds the alarm, and the places you start avoiding. [placeholder]",
      },
      {
        title: "Depression",
        detail: "When energy and interest fade, and everything feels heavy. [placeholder]",
      },
      {
        title: "Sexual dysfunction",
        detail: "Difficulties with intimacy, often tied to anxiety and stress. [placeholder]",
      },
      {
        title: "Stress and burnout",
        detail: "When the load outweighs your resources, at work and beyond. [placeholder]",
      },
      {
        title: "Relationship difficulties",
        detail: "The relationships that wear you down: as a couple, in the family, at work. [placeholder]",
      },
    ],
  },
};

// Section 05 — The space, photo-led. No real photos exist yet (see the
// content inventory constraint), so both frames are placeholders with a
// photo brief in the caption. Copy is new (there's no existing "the
// space" section on the real site to source from) — kept short, factual,
// §9-clean, and marked [segnaposto]/[placeholder] like every other
// not-yet-final line in this preview.
export const THE_SPACE = {
  it: {
    label: "05 — Lo spazio",
    kicker: "Lo studio",
    blocks: [
      {
        heading: "Uno spazio pensato per essere neutro",
        paragraph: "Luce naturale, pochi oggetti, nessuna fretta. [segnaposto]",
        frame: "A",
        aspect: "16 / 9",
        caption: "Sala d'attesa o corridoio — luce naturale, senza persone, orizzontale 16:9",
      },
      {
        heading: "I dettagli restano semplici",
        paragraph: "Una poltrona, una finestra, il tempo di sedersi. [segnaposto]",
        frame: "B",
        aspect: "4 / 3",
        caption: "Un dettaglio — una poltrona, una finestra, una pianta. Luce naturale",
      },
    ],
  },
  en: {
    label: "05 — Lo spazio",
    kicker: "The studio",
    blocks: [
      {
        heading: "A space meant to feel neutral",
        paragraph: "Natural light, few objects, no rush. [placeholder]",
        frame: "A",
        aspect: "16 / 9",
        caption: "Waiting area or hallway — natural light, no people, horizontal 16:9",
      },
      {
        heading: "The details stay simple",
        paragraph: "A chair, a window, the time to sit down. [placeholder]",
        frame: "B",
        aspect: "4 / 3",
        caption: "A detail — a chair, a window, a plant. Natural light",
      },
    ],
  },
};

// "Static map frame" — the user's own abbreviated term for a simplified
// version of the originally-planned Section 07 (Locations bled, which
// specified reusing the real interactive Leaflet component). Under the
// hard-clock process for this pass, this is a static placeholder frame
// (same visual convention as every other not-ready-yet image in this
// preview) plus the real address text, not a re-import of
// LocationsInteractive/LocationsMap — flagged as a simplification in the
// final report. Addresses verbatim from scripts/patch-locations-sede.ts.
export const LOCATIONS_STATIC = {
  it: {
    label: "Mappa statica",
    heading: "Dove ricevo",
    caption: "Mappa delle sedi — segnaposto statico, non la mappa interattiva reale",
    entries: [
      { name: "Milano", lines: ["Via Michelangelo Buonarroti 41", "Piazza della Trivulziana 4/A"] },
      { name: "Monza", lines: ["Via Tolomeo 10"] },
      { name: "Cernusco sul Naviglio", lines: ["Via Torino 24/11"] },
      { name: "Online", lines: ["Sedute su piattaforma sicura, da qualsiasi luogo."] },
    ],
  },
  en: {
    label: "Static map",
    heading: "Where I see clients",
    caption: "Locations map — static placeholder, not the real interactive map",
    entries: [
      { name: "Milan", lines: ["Via Michelangelo Buonarroti 41", "Piazza della Trivulziana 4/A"] },
      { name: "Monza", lines: ["Via Tolomeo 10"] },
      { name: "Cernusco sul Naviglio", lines: ["Via Torino 24/11"] },
      { name: "Online", lines: ["Secure online sessions, from anywhere."] },
    ],
  },
};

// Section 06 — Diplomi, added this pass (skipped last time). Italian
// only, no locale split — this rework's own constraint, not an oversight
// (renders identically regardless of the `locale` prop). Real 3 items,
// verbatim from scripts/patch-diplomi-items.ts — no 4th "pending"
// placeholder here, since the brief for this pass asked for "the three
// real scans" specifically. None of the 3 have an actual scanned image
// in the dataset yet (document field unset on every one, same as the
// live homepage right now) — cards render the same typographic-
// placeholder treatment DiplomiCardRow already uses for that case, not a
// lightbox (there is nothing yet for a lightbox to show).
export const DIPLOMI = {
  label: "06 — Diplomi",
  kicker: "Formazione",
  heading: "Diplomi e qualifiche",
  items: [
    {
      year: "2011",
      title: "Laurea in Scienze e Tecniche Psicologiche (L-24)",
      institution: "Università degli Studi di Milano-Bicocca",
    },
    {
      year: "2013",
      title: "Master of Science in Cognitive and Clinical Neuroscience",
      institution: "Maastricht University",
    },
    {
      year: "2020",
      title: "Specializzazione in Psicoterapia Cognitivo-Neuropsicologica",
      institution: "SLOP — Scuola Lombarda di Psicoterapia, Pavia",
    },
  ],
};

// Section 07 — Certificates marquee, beneath Diplomi. Content verbatim
// from this pass's own brief. Italian only, same reasoning as DIPLOMI
// above.
export const MARQUEE_ITEMS = [
  "Laurea in Scienze e Tecniche Psicologiche — Università di Milano-Bicocca",
  "M.A. in Filologia — Università per Stranieri di Siena",
  "M.Sc. in Cognitive and Clinical Neuroscience — Maastricht University",
  "Specializzazione in Psicopatologia — Maastricht University",
  "PsyD in Psicoterapia Cognitivo-Neuropsicologica — SLOP, Pavia/Padova",
  "PsyD in Psicoterapia Cognitiva Post-Razionalista — Milano",
];
