export type ProposalLocale = "it" | "en";

// Copy pass — final IT/EN prose, supplied verbatim by the owner. Fee/
// duration FIGURES are still never typed here — every one is threaded
// through from siteSettings.pricing by the caller (ProposalCContent.tsx).

export const HEADER = {
  it: { kicker: "Prezzi", title: "Le mie tariffe" },
  en: { kicker: "Fees", title: "My fees" },
};

// The existing spread's own two paragraphs — structure untouched ("stay as
// they are"), copy now final.
export const INTRO_PARAGRAPHS = {
  it: [
    "La tariffa dipende dal tipo di seduta, non dal luogo. Individuale o di coppia, a Milano, a Monza, a Cernusco o in videochiamata: il prezzo è lo stesso, ed è scritto qui sotto per intero prima ancora che lei mi scriva.",
    "Anche il primo incontro è una seduta a tutti gli effetti e si paga alla tariffa ordinaria: non è un colloquio conoscitivo gratuito, ma non è nemmeno un impegno a proseguire. Si salda alla fine di ogni seduta, in contanti, con bonifico o con carta. La ricevuta viene sempre rilasciata: se il pagamento è tracciabile, è detraibile al 19% come spesa sanitaria.",
  ],
  en: [
    "The fee depends on the type of session, not on where it takes place. Individual or couple, in Milan, Monza, Cernusco or by video call: the price is the same, and it's set out in full below before you ever write to me.",
    "The first meeting is a full session too, and it's charged at the ordinary rate: it isn't a free introductory chat, but it isn't a commitment to continue either. Payment is settled at the end of each session, in cash, by transfer or by card. A receipt is always issued: where the payment is traceable, it qualifies for the 19% Italian healthcare-expense deduction.",
  ],
};

export const FACTS = {
  it: [
    { label: "Dove", value: "Milano, Monza, Cernusco sul Naviglio, online — stessa tariffa ovunque." },
    { label: "Prima seduta", value: "Completa, alla tariffa ordinaria." },
    { label: "Pagamento", value: "Contanti, bonifico o carta, a fine seduta. Ricevuta sempre rilasciata." },
    { label: "Detrazione", value: "19% come spesa sanitaria, pagamenti tracciabili." },
  ],
  en: [
    { label: "Where", value: "Milan, Monza, Cernusco sul Naviglio, online — the same fee everywhere." },
    { label: "First session", value: "A complete session, at the ordinary fee." },
    { label: "Payment", value: "Cash, bank transfer or card, at the end of the session. Receipt always issued." },
    { label: "Deduction", value: "19% as a medical expense, for traceable payments." },
  ],
};

// ADD 1 — services lead-in: the one place the four locations appear as a
// natural sentence outside the facts card (ADD 3's own requirement), kept
// out of the untouched intro paragraphs above.
export const SERVICES_INTRO = {
  it: "In studio — a Milano (Citylife e Bicocca), a Monza, a Cernusco sul Naviglio — oppure online:",
  en: "In the studio — in Milan (Citylife and Bicocca), in Monza, in Cernusco sul Naviglio — or online:",
};

// Pillar-page link targets for the six areas named in this pass's brief.
// Slugs/titles read from Sanity (pillarPage documents), not invented —
// see this pass's own report for the live values fetched. Unchanged this
// copy pass — same links, same positions, only the surrounding prose moved.
export const PILLAR_LINKS = {
  anxiety: {
    it: { slug: "disturbi-d-ansia", label: "ansia" },
    en: { slug: "anxiety-disorders", label: "anxiety" },
  },
  panic: {
    it: { slug: "attacchi-di-panico", label: "attacchi di panico" },
    en: { slug: "panic-attacks", label: "panic attacks" },
  },
  stress: {
    it: { slug: "stress-e-burnout", label: "stress" },
    en: { slug: "stress-and-burnout", label: "stress" },
  },
  trauma: {
    it: { slug: "trauma", label: "trauma" },
    en: { slug: "trauma", label: "trauma" },
  },
  coppia: {
    it: { slug: "terapia-di-coppia", label: "difficoltà di coppia" },
    en: { slug: "couples-therapy", label: "relationship difficulties" },
  },
  sessuali: {
    it: { slug: "disfunzioni-sessuali", label: "difficoltà sessuali" },
    en: { slug: "sexual-difficulties", label: "sexual difficulties" },
  },
} as const;

export const SERVICES_COPY = {
  it: {
    individual: {
      title: "Seduta individuale",
      paragraph1:
        "Quarantacinque minuti, di norma una volta a settimana. Il primo incontro serve a mettere a fuoco che cosa la porta qui e a capire se il modo in cui lavoro le è utile: non deve arrivare preparato, né sapere già da dove cominciare.",
      linkPrefix: "Indicata, tra le altre cose, per chi lavora su",
      linkKeys: ["anxiety", "panic", "stress", "trauma"] as const,
      linkSuffix: ".",
    },
    couple: {
      title: "Terapia di coppia",
      paragraph1:
        "Un'ora, con entrambi presenti. Non è la sede in cui si stabilisce chi ha ragione: si guarda a come funziona il rapporto, che cosa si ripete e che cosa ciascuno porta dentro quello schema. Quando serve, il percorso può alternare qualche incontro individuale.",
      linkPrefix: "Pensata per chi affronta",
      linkKeys: ["coppia"] as const,
      linkSuffix: ".",
    },
    sexology: {
      title: "Consulenza sessuologica",
      derivedNote: "stessa tariffa e durata della seduta individuale",
      paragraph1:
        "Uno spazio dedicato alla sessualità — da soli o in coppia — con la stessa riservatezza di qualsiasi altro colloquio. Si parte da quello che sta succedendo adesso, senza dare per scontato che la causa sia solo fisica o solo psicologica.",
      linkPrefix: "Un percorso dedicato a chi affronta",
      linkKeys: ["sessuali"] as const,
      linkSuffix: ".",
    },
    online: {
      title: "Incontri online",
      derivedNote: "stessa durata e stessa tariffa della seduta corrispondente in studio",
      paragraph1:
        "Stessa durata, stessa tariffa e stesso modo di lavorare della seduta in studio. Riceve il link prima dell'appuntamento; quello che conta davvero è avere una connessione stabile e una stanza in cui nessuno la interrompa.",
    },
  },
  en: {
    individual: {
      title: "Individual session",
      paragraph1:
        "Forty-five minutes, usually once a week. The first meeting is for working out what brings you here and whether the way I work is useful to you: you don't need to arrive prepared, or to know where to start.",
      linkPrefix: "Suited, among other things, to work on",
      linkKeys: ["anxiety", "panic", "stress", "trauma"] as const,
      linkSuffix: ".",
    },
    couple: {
      title: "Couples therapy",
      paragraph1:
        "One hour, with both of you present. This isn't the place where it's decided who's right: we look at how the relationship works, what keeps repeating, and what each of you brings to that pattern. Where it helps, a course of work can include occasional individual meetings.",
      linkPrefix: "For couples facing",
      linkKeys: ["coppia"] as const,
      linkSuffix: ".",
    },
    sexology: {
      title: "Sexology consultation",
      derivedNote: "same fee and duration as the individual session",
      paragraph1:
        "A space for talking about sexuality — on your own or as a couple — with the same confidentiality as any other session. We start from what is happening now, without assuming the cause is purely physical or purely psychological.",
      linkPrefix: "For those facing",
      linkKeys: ["sessuali"] as const,
      linkSuffix: ".",
    },
    online: {
      title: "Online sessions",
      derivedNote: "same duration and fee as the corresponding in-studio session",
      paragraph1:
        "Same duration, same fee and same way of working as a session in the studio. You'll receive the link before the appointment; what matters most is a stable connection and a room where you won't be interrupted.",
    },
  },
};

// ADD 2 — dark green band. Placement: after the new services section,
// before ContactBlock — see this pass's own report for why "between the
// spread and the facts card" (as literally worded) isn't possible without
// breaking the "stay as they are" instruction on the spread, and why this
// position still serves the same rhythmic purpose.
export const DARK_BAND = {
  it: {
    kicker: "In breve",
    heading: "Quello che paga è quello che legge qui",
    emphasisPhrase: "sempre alle stesse condizioni",
    column1:
      "Non ci sono pacchetti da acquistare, sedute minime, quote di iscrizione o supplementi per il primo incontro. La tariffa è quella indicata sopra e non cambia in corso di percorso senza che gliene parli prima.",
    column2:
      "Non cambia nemmeno in base al luogo o al mezzo. Milano, Monza, Cernusco o videochiamata: si lavora sempre alle stesse condizioni, in ogni sede.",
  },
  en: {
    kicker: "In short",
    heading: "What you pay is what you read here",
    emphasisPhrase: "on the same terms every time",
    column1:
      "There are no packages to buy, no minimum number of sessions, no registration fee and no surcharge for the first meeting. The fee is the one shown above, and it doesn't change mid-course without my discussing it with you first.",
    column2:
      "It doesn't change with the place or the medium either. Milan, Monza, Cernusco or video call: the work happens on the same terms every time, in every location.",
  },
};

export const BANNER = {
  it: {
    label: "Proposta C — Editoriale",
    weak:
      "Le cifre a corpo grande, per quanto neutre nel colore, restano l'elemento visivamente più forte della pagina. La fascia scura aggiunge una seconda cosa da bilanciare: due elementi ad alto contrasto (numeri grandi + fascia scura) sulla stessa pagina rischiano di sommarsi invece di restare ciascuno una pausa.",
  },
  en: {
    label: "Proposal C — Editorial (EN)",
    weak:
      "The large figures, neutral in colour as they are, remain the page's strongest visual element. The dark band adds a second thing to balance — two high-contrast elements (big numbers + dark band) on one page risk compounding instead of each reading as its own pause.",
  },
};
