import { createClient } from "@sanity/client";

// City/online pages pass — seeds milanPage/monzaPage/onlineTherapyPage
// (it/en), sourced verbatim from contents/pagina-milano.md,
// contents/pagina-monza.md, contents/pagina-online-estero.md. Same
// createIfNotExists + patch.set convention as every other patch-*.ts
// script in this folder — never a reseed/createOrReplace. No
// translation.metadata writes: these are genuine SINGLETON_TYPES
// (structure.ts), and CLAUDE.md's own "Singleton page routes" note
// already confirmed zero translation.metadata documents exist for any
// singleton type — the Studio in-document language switcher pairs them
// by the `${type}-${locale}` id convention alone.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

type Locale = "it" | "en";

const PILLAR_IDS: Record<string, Record<Locale, string>> = {
  ansia: { it: "pillarPage-anxiety-it", en: "pillarPage-anxiety-en" },
  panico: { it: "pillarPage-panic-it", en: "pillarPage-panic-en" },
  stress: { it: "pillarPage-stress-it", en: "pillarPage-stress-en" },
  relazioni: { it: "pillarPage-relazioni-it", en: "pillarPage-relazioni-en" },
  coppia: { it: "pillarPage-coppia-it", en: "pillarPage-coppia-en" },
  trauma: { it: "pillarPage-trauma-it", en: "pillarPage-trauma-en" },
};

function pillarLink(key: keyof typeof PILLAR_IDS, locale: Locale, label: string) {
  const ids = PILLAR_IDS[key];
  if (!ids) throw new Error(`Unknown pillar key: ${key}`);
  return { label, pillar: { _type: "reference", _ref: ids[locale] } };
}

async function upsertSingleton(id: string, type: string, fields: Record<string, unknown>) {
  await client.createIfNotExists({ _id: id, _type: type, language: id.endsWith("-en") ? "en" : "it", ...fields });
  await client.patch(id).set(fields).commit();
}

// ============================================================ MILAN ====

const MILAN_IT = {
  kicker: "Milano",
  title: "Psicologo e psicoterapeuta a Milano",
  titleEmphasisWord: "a Milano",
  lead:
    "Due studi in città — Citylife e Bicocca — e la possibilità di lavorare online. Mi occupo di ansia e attacchi di panico, di stress e burnout, di difficoltà relazionali e sessuali, e delle conseguenze di esperienze traumatiche.",
  sixAreas: {
    kicker: "Di cosa mi occupo",
    heading: "Con che cosa si arriva, a Milano",
    intro:
      "Le difficoltà non cambiano da una città all'altra, ma il contesto in cui si vivono sì. Milano è una città in cui si arriva, spesso da soli e spesso per lavoro, e questo si sente anche in studio.",
    items: [
      {
        title: "Ansia",
        body:
          "L'ansia raramente arriva da sola: si accompagna al sonno che non tiene, alla testa che non si ferma la sera, al controllo continuo. In una città dove molte persone sono arrivate da poco, si somma spesso al non avere ancora una rete intorno.",
        link: pillarLink("ansia", "it", "Disturbi d'ansia"),
      },
      {
        title: "Attacchi di panico e agorafobia",
        body:
          "Il primo attacco arriva quasi sempre in un luogo ordinario, e a Milano quel luogo è spesso la metropolitana all'ora di punta. Quello che segue non è la paura dell'attacco in sé, ma il restringersi progressivo delle strade che si possono percorrere.",
        link: pillarLink("panico", "it", "Attacchi di panico e agorafobia"),
      },
      {
        title: "Stress e burnout",
        body:
          "Milano è una città in cui ci si trasferisce per lavorare, e questo rende più difficile accorgersi di quando il lavoro ha smesso di lasciare spazio ad altro. Il segnale che orienta di solito è cosa succede in ferie.",
        link: pillarLink("stress", "it", "Stress e burnout"),
      },
      {
        title: "Difficoltà relazionali",
        body:
          "Il modo di stare in relazione — quanto si chiede, quanto si tollera, quando ci si ritira — non riguarda solo la coppia. Si vede con gli amici, in famiglia, a volte al lavoro.",
        link: pillarLink("relazioni", "it", "Difficoltà nelle relazioni"),
      },
      {
        title: "Terapia di coppia",
        body:
          "Molte coppie qui si vedono davvero un'ora la sera, e quell'ora finisce per contenere tutto: la logistica, le tensioni, le decisioni. Il lavoro di coppia serve a riaprire uno spazio in cui parlarsi senza doverlo risolvere subito.",
        link: pillarLink("coppia", "it", "Terapia di coppia"),
      },
      {
        title: "Trauma",
        body:
          "Quello che ha una data, e quello che non ce l'ha: un ambiente prolungato che non lascia un episodio da raccontare. Non serve un ricordo nitido per cominciare.",
        link: pillarLink("trauma", "it", "Trauma"),
      },
    ],
  },
  split: {
    left: {
      label: "Milano · Citylife",
      heading: "Via Michelangelo Buonarroti 41",
      p1: "Zona Citylife, a pochi minuti a piedi dalla fermata Buonarroti della linea M1.",
      p2: "È lo studio più comodo per chi lavora in zona Fiera, Sempione o in centro, e per chi arriva dalla direttrice ovest.",
    },
    right: {
      label: "Milano · Bicocca",
      heading: "Piazza della Trivulziana 4/A",
      p1: "Zona Bicocca, nell'area universitaria, a pochi minuti dalla fermata Bicocca della linea M5.",
      p2: "Parcheggio in strada senza particolari difficoltà, il che lo rende pratico per chi arriva in auto da nord o dall'hinterland.",
    },
  },
  asymmetric: {
    kicker: "Come si sceglie",
    heading: "La tariffa è la stessa nei due studi. La scelta è solo pratica.",
    headingEmphasisWord: "solo pratica",
    p1:
      "Cento euro per quarantacinque minuti, in entrambe le sedi e online. Non c'è uno studio più costoso dell'altro, e non c'è motivo di scegliere per ragioni che non siano la comodità.",
    p2: "Si può anche cambiare in corso di percorso, se cambiano gli orari o gli spostamenti: capita spesso e non comporta nulla.",
    offset: {
      heading: "Se nessuno dei due è comodo",
      p1: "Ricevo anche a Monza e a Cernusco sul Naviglio, e online. La tariffa non cambia in nessuna delle quattro sedi.",
      p2: "Per molte persone la scelta finisce per essere fra lo studio più vicino e la videochiamata, e va benissimo così.",
    },
  },
  twoBands: {
    band1: {
      heading: "Se venire in studio è complicato",
      p1: "Gli incontri online hanno la stessa durata e lo stesso costo di quelli in presenza, e si svolgono su una piattaforma riservata.",
      p2:
        "A Milano è la scelta di chi ha orari che non lasciano margine, di chi abita fuori città, e di chi in questo momento fatica a spostarsi — che è una condizione clinica, non un dettaglio organizzativo.",
    },
    band2: {
      heading: "Il primo incontro",
      p1:
        "Dura quarantacinque minuti e serve a capire di cosa stiamo parlando: da quanto tempo, in quali situazioni, cosa hai già provato a fare. Le domande le faccio io.",
      p2: "Alla fine ti dico che cosa ho capito e che cosa proporrei. Non comporta impegno a proseguire, ed è una seduta a tutti gli effetti, alla tariffa ordinaria.",
    },
  },
  practical: {
    col1: {
      heading: "Tariffe",
      p: "Seduta individuale 100 € per quarantacinque minuti, seduta di coppia 130 € per sessanta. Stesso costo nei due studi di Milano e online. Ricevuta sempre rilasciata, detraibile al 19% come spesa sanitaria sui pagamenti tracciabili.",
    },
    col2: {
      heading: "Lingue",
      p: "Ricevo in italiano e in inglese. A Milano una parte consistente delle persone che seguo è arrivata da un altro paese, e poter parlare nella lingua in cui si pensa cambia molto.",
    },
    col3: {
      heading: "Per fissare un appuntamento",
      p: "Il canale più veloce è WhatsApp. Rispondo personalmente, di solito entro 24 ore. Negli studi non c'è segreteria: gli appuntamenti si fissano in anticipo.",
    },
    closingQuote:
      "Non ho mai incontrato due persone con la stessa ansia. Ogni percorso comincia dai pezzi sparsi di una storia che è solo di quella persona.",
  },
  seo: {
    metaTitle: "Psicologo e psicoterapeuta a Milano — ansia e attacchi di panico",
    metaDescription:
      "Psicoterapeuta a Milano, in due studi — Citylife e Bicocca — e online. Ansia, attacchi di panico, stress, difficoltà relazionali e sessuali. Prima seduta 45 minuti, 100 €.",
    noIndex: true,
  },
};

const MILAN_EN = {
  kicker: "Milan",
  title: "English-speaking psychologist and psychotherapist in Milan",
  titleEmphasisWord: "in Milan",
  lead:
    "Two practices in the city — Citylife and Bicocca — and the option of working online. I work with anxiety and panic attacks, stress and burnout, relationship and sexual difficulties, and the aftermath of traumatic experience.",
  sixAreas: {
    kicker: "What I work with",
    heading: "What people arrive with, in Milan",
    intro:
      "Difficulties do not change from one city to another, but the context they are lived in does. Milan is a city people arrive in, often alone and often for work, and that shows in the consulting room.",
    items: [
      {
        title: "Anxiety",
        body:
          "Anxiety rarely arrives on its own: it comes with sleep that does not hold, with a head that will not stop in the evening, with constant checking. In a city where many people arrived recently, it compounds with not yet having a network around you.",
        link: pillarLink("ansia", "en", "Anxiety disorders"),
      },
      {
        title: "Panic attacks and agoraphobia",
        body:
          "The first attack almost always happens somewhere ordinary, and in Milan that place is often the metro at rush hour. What follows is not fear of the attack itself but the steady narrowing of the routes you are willing to take.",
        link: pillarLink("panico", "en", "Panic attacks and agoraphobia"),
      },
      {
        title: "Stress and burnout",
        body:
          "Milan is a city people move to in order to work, which makes it harder to notice when work has stopped leaving room for anything else. The signal that usually orients things is what happens on holiday.",
        link: pillarLink("stress", "en", "Stress and burnout"),
      },
      {
        title: "Relationship difficulties",
        body:
          "How you are in a relationship — what you ask for, what you tolerate, when you withdraw — is not only about a partner. It shows with friends, in families, sometimes at work.",
        link: pillarLink("relazioni", "en", "Relationship difficulties"),
      },
      {
        title: "Couples therapy",
        body:
          "Many couples here genuinely see each other for an hour in the evening, and that hour ends up holding everything: the logistics, the tension, the decisions. Couples work is about reopening a space to talk without having to resolve it immediately.",
        link: pillarLink("coppia", "en", "Couples therapy"),
      },
      {
        title: "Trauma",
        body:
          "What has a date, and what does not: a prolonged environment that leaves no single episode to recount. You do not need a clear memory to begin.",
        link: pillarLink("trauma", "en", "Trauma"),
      },
    ],
  },
  split: {
    left: {
      label: "Milan · Citylife",
      heading: "Via Michelangelo Buonarroti 41",
      p1: "Citylife, a few minutes on foot from Buonarroti station on the M1 line.",
      p2: "The easier of the two for anyone working around Fiera, Sempione or the centre, and for anyone coming in from the west.",
    },
    right: {
      label: "Milan · Bicocca",
      heading: "Piazza della Trivulziana 4/A",
      p1: "Bicocca, in the university district, a few minutes from Bicocca station on the M5 line.",
      p2: "Street parking is straightforward, which makes it practical for anyone driving in from the north or from outside the city.",
    },
  },
  asymmetric: {
    kicker: "Choosing",
    heading: "The fee is the same at both practices. The choice is purely practical.",
    headingEmphasisWord: "purely practical",
    p1:
      "One hundred euros for forty-five minutes, at either address and online. Neither practice is more expensive than the other, and there is no reason to choose on any basis other than convenience.",
    p2: "It can also change part-way through, if your hours or your commute change. That happens often and involves nothing.",
    offset: {
      heading: "If neither is convenient",
      p1: "I also work in Monza and in Cernusco sul Naviglio, and online. The fee is identical at all four.",
      p2: "For many people the choice ends up being between the nearest practice and a video call, and that is a perfectly good way to decide.",
    },
  },
  twoBands: {
    band1: {
      heading: "If coming to the practice is difficult",
      p1: "Online sessions run the same length and cost the same as those in person, on a private platform.",
      p2:
        "In Milan it is the choice of people whose hours leave no margin, people who live outside the city, and people who at this moment find travelling difficult — which is a clinical matter, not a logistical one.",
    },
    band2: {
      heading: "The first session",
      p1: "Forty-five minutes to understand what we are dealing with: how long it has been going on, in which situations, what you have already tried. I ask the questions.",
      p2: "At the end I tell you what I have understood and what I would propose. It carries no obligation to continue, and it is a full session at the ordinary fee.",
    },
  },
  practical: {
    col1: {
      heading: "Fees",
      p: "Individual session €100 for forty-five minutes, couple session €130 for sixty. The same at both Milan practices and online. A receipt is always issued, deductible at 19% as a medical expense on traceable payments if you file an Italian tax return.",
    },
    col2: {
      heading: "Languages",
      p: "I work in Italian and in English. In Milan a substantial proportion of the people I see arrived from another country, and being able to speak in the language you think in changes a great deal.",
    },
    col3: {
      heading: "Making an appointment",
      p: "WhatsApp is quickest. I reply personally, usually within 24 hours. There is no receptionist at the practices: appointments are arranged in advance.",
    },
    closingQuote:
      "I have never met two people with the same anxiety. Each course of work begins from the scattered pieces of a history that belongs to one person only.",
  },
  seo: {
    metaTitle: "English-speaking psychotherapist in Milan — anxiety and panic",
    metaDescription:
      "Psychotherapy in English in Milan, at two practices — Citylife and Bicocca — and online. Anxiety, panic attacks, stress, relationships. First session 45 minutes, €100.",
    noIndex: true,
  },
};

// ============================================================ MONZA ====

const MONZA_IT = {
  kicker: "Monza",
  title: "Psicoterapeuta a Monza, senza dover andare a Milano",
  titleEmphasisWord: "senza dover andare a Milano",
  lead:
    "Ricevo in via Tolomeo 10, a dieci minuti dalla stazione. Ansia, attacchi di panico, stress e difficoltà di coppia. Stessa tariffa che negli studi di Milano.",
  split: {
    left: {
      label: "Perché a Monza",
      heading: "Curarsi dove si vive",
      p1: "Molte persone che seguo a Monza passano la giornata a Milano: quaranta minuti di treno all'andata e altrettanti al ritorno, cinque giorni su sette.",
      p2:
        "Aggiungere un appuntamento in centro a una giornata già così significa, in pratica, non andarci. Uno studio vicino a casa non è un dettaglio organizzativo: è la differenza fra cominciare un percorso e rimandarlo.",
    },
    right: {
      label: "Perché a Milano",
      heading: "E perché qualcuno sceglie il contrario",
      p1: "C'è anche chi preferisce l'opposto, e per una ragione precisa: Monza è una città in cui i giri si incrociano. Colleghi, vicini, genitori della stessa classe.",
      p2: "Per alcune persone questo è sufficiente a scegliere Milano, o la videochiamata. È una preoccupazione ragionevole e non c'è bisogno di spiegarla: si sceglie la sede e basta.",
    },
  },
  confidentiality: {
    kicker: "Riservatezza",
    epigraph: "Il segreto professionale copre anche il fatto stesso che tu sia in terapia.",
    p1:
      "Non è una cortesia né una politica dello studio: per lo psicologo è un obbligo di legge, previsto dall'articolo 622 del Codice penale e dagli articoli 11–15 del Codice deontologico.",
    p2:
      "Riguarda i contenuti degli incontri e la loro esistenza. Se un familiare chiama, non riceve conferma né smentita. Le deroghe sono poche e definite dalla norma, e la principale è il tuo consenso scritto.",
    p3:
      "Lo studio di via Tolomeo non ha segreteria e non condivide sala d'attesa con altre attività. Gli appuntamenti si fissano in anticipo, il che significa anche che non ci si incontra per caso.",
  },
  fourAreas: {
    kicker: "Di cosa mi occupo",
    heading: "Con che cosa si arriva",
    bands: [
      {
        heading: "Ansia e attacchi di panico",
        p1:
          "Sono la ragione più frequente per cui le persone mi scrivono. L'ansia che non si spegne la sera, il primo attacco arrivato in un posto qualunque, e poi il perimetro che si stringe: prima il treno, poi l'auto in tangenziale, poi le code.",
        p2: "Per chi fa il pendolare questo è particolarmente costoso, perché il mezzo evitato è lo stesso che serve ogni giorno.",
        links: [pillarLink("ansia", "it", "Disturbi d'ansia"), pillarLink("panico", "it", "Attacchi di panico e agorafobia")],
      },
      {
        heading: "Stress e burnout",
        p1:
          "La Brianza è fatta di aziende familiari e di attività in cui il lavoro e la famiglia non stanno in stanze separate. Quando il socio è anche il fratello, o l'azienda è quella del padre, staccare non è una questione di orari.",
        p2: "Il segnale che orienta di solito è cosa succede in ferie: se dopo una settimana qualcosa si allenta, il quadro somiglia al burnout.",
        links: [pillarLink("stress", "it", "Stress e burnout")],
      },
      {
        heading: "Difficoltà di coppia",
        p1:
          "Coppie in cui uno dei due si sposta ogni giorno e l'altro no, coppie che lavorano insieme, coppie che vivono a pochi chilometri dalle rispettive famiglie d'origine e ne sentono il peso.",
        p2: "Il lavoro di coppia dura sessanta minuti e costa 130 €. Quando serve, può alternarsi a qualche incontro individuale.",
        links: [pillarLink("coppia", "it", "Terapia di coppia")],
      },
      {
        heading: "Trauma e conseguenze",
        p1: "Quello che ha una data e quello che non ce l'ha. Non serve un ricordo nitido per cominciare, e non serve che sia successo qualcosa di grave: conta l'effetto che ha avuto.",
        p2: undefined,
        links: [pillarLink("trauma", "it", "Trauma")],
      },
    ],
  },
  asymmetric: {
    kicker: "In pratica",
    heading: "Via Tolomeo 10, a dieci minuti dalla stazione",
    headingEmphasisWord: "dieci minuti",
    p1: "Lo studio è in zona tranquilla, raggiungibile a piedi dalla stazione di Monza e comodo per chi arriva in auto: parcheggio in strada senza particolari difficoltà.",
    p2: "Ricevo qui in giorni fissi. Gli appuntamenti si concordano via WhatsApp o per email, di solito con qualche giorno di anticipo.",
    offset: {
      heading: "Se un periodo si complica",
      p1: "Si può passare temporaneamente agli incontri online senza interrompere il percorso, e tornare in studio quando torna comodo.",
      p2: "Durata e costo non cambiano. Capita spesso: un trasferimento, un cambio di orari, un periodo in cui uscire di casa è più difficile.",
    },
  },
  practical: {
    col1: {
      heading: "Tariffe e pagamento",
      p: "Individuale 100 € per quarantacinque minuti, coppia 130 € per sessanta. Identico a Monza, nei due studi di Milano, a Cernusco sul Naviglio e online. Si paga a fine seduta, in contanti, con bonifico o con carta; la ricevuta viene rilasciata sempre.",
    },
    col2: {
      heading: "Prima di venire",
      p: "Il primo incontro è una seduta a tutti gli effetti: quarantacinque minuti per capire di cosa stiamo parlando. Non serve arrivare preparato — le domande le faccio io — e non comporta impegno a proseguire.",
    },
    col3: {
      heading: "Come si fissa",
      p: "WhatsApp è il canale più rapido, ma va bene anche l'email. Rispondo personalmente, di solito entro 24 ore.",
    },
  },
  seo: {
    metaTitle: "Psicologo e psicoterapeuta a Monza — ansia, panico, coppia",
    metaDescription:
      "Psicoterapeuta a Monza, in via Tolomeo 10, a dieci minuti dalla stazione. Ansia, attacchi di panico, stress, terapia di coppia. Prima seduta 45 minuti, 100 €. Anche online.",
    noIndex: true,
  },
};

const MONZA_EN = {
  kicker: "Monza",
  title: "Psychotherapy in Monza, without going into Milan",
  titleEmphasisWord: "without going into Milan",
  lead:
    "I practise at via Tolomeo 10, ten minutes from the station. Anxiety, panic attacks, stress and couple difficulties. The same fee as at the Milan practices.",
  split: {
    left: {
      label: "Why Monza",
      heading: "Getting help where you live",
      p1: "Many of the people I see in Monza spend their day in Milan: forty minutes on the train each way, five days a week.",
      p2:
        "Adding an appointment in the centre to a day like that means, in practice, not going. A practice near home is not a logistical detail — it is the difference between starting and postponing.",
    },
    right: {
      label: "Why Milan",
      heading: "And why some choose the opposite",
      p1: "Some people prefer the reverse, for a specific reason: Monza is a city where circles overlap. Colleagues, neighbours, parents from the same class.",
      p2: "For some that is reason enough to choose Milan, or a video call. It is a reasonable concern and it does not need explaining — you simply pick the location.",
    },
  },
  confidentiality: {
    kicker: "Confidentiality",
    epigraph: "Professional secrecy covers the fact of your being in therapy at all.",
    p1:
      "It is neither a courtesy nor a policy of the practice: for a psychologist in Italy it is a legal obligation, set out in article 622 of the Criminal Code and articles 11–15 of the professional code of conduct.",
    p2:
      "It covers what is said in session and that sessions exist. If a family member calls, they receive neither confirmation nor denial. The exceptions are few and defined by law, and the main one is your own written consent.",
    p3: "The via Tolomeo practice has no receptionist and shares no waiting room with other businesses. Appointments are arranged in advance, which also means nobody runs into anybody by chance.",
  },
  fourAreas: {
    kicker: "What I work with",
    heading: "What people arrive with",
    bands: [
      {
        heading: "Anxiety and panic attacks",
        p1:
          "The most frequent reason people write to me. Anxiety that will not switch off in the evening, a first attack somewhere unremarkable, and then the perimeter tightening: first the train, then the ring road, then queues.",
        p2: "For a commuter this is particularly expensive, because the thing being avoided is the same thing needed every day.",
        links: [pillarLink("ansia", "en", "Anxiety disorders"), pillarLink("panico", "en", "Panic attacks and agoraphobia")],
      },
      {
        heading: "Stress and burnout",
        p1:
          "Brianza is built on family firms and businesses where work and family do not sit in separate rooms. When your business partner is also your brother, or the company is your father's, switching off is not a matter of hours.",
        p2: "The signal that usually orients things is what happens on holiday: if a week away loosens something, the picture resembles burnout.",
        links: [pillarLink("stress", "en", "Stress and burnout")],
      },
      {
        heading: "Couple difficulties",
        p1: "Couples where one commutes daily and the other does not, couples who work together, couples living a few kilometres from both sets of parents and feeling the weight of it.",
        p2: "Couple sessions last sixty minutes and cost €130. Where it helps, they can alternate with individual sessions.",
        links: [pillarLink("coppia", "en", "Couples therapy")],
      },
      {
        heading: "Trauma and its aftermath",
        p1: "What has a date and what does not. You do not need a clear memory to begin, and it does not need to have been something severe: what counts is the effect it had.",
        p2: undefined,
        links: [pillarLink("trauma", "en", "Trauma")],
      },
    ],
  },
  asymmetric: {
    kicker: "In practice",
    heading: "Via Tolomeo 10, ten minutes from the station",
    headingEmphasisWord: "ten minutes",
    p1: "The practice is in a quiet area, walkable from Monza station and straightforward to reach by car — street parking without particular difficulty.",
    p2: "I work here on fixed days. Appointments are arranged by WhatsApp or email, usually a few days ahead.",
    offset: {
      heading: "If a period gets complicated",
      p1: "You can move to online sessions temporarily without interrupting the work, and return to the practice when it suits again.",
      p2: "Length and cost do not change. It happens often: a relocation, a change of hours, a period when leaving the house is harder.",
    },
  },
  practical: {
    col1: {
      heading: "Fees and payment",
      p: "Individual €100 for forty-five minutes, couples €130 for sixty. Identical in Monza, at both Milan practices, in Cernusco sul Naviglio and online. Payment at the end of each session, by cash, bank transfer or card; a receipt is always issued.",
    },
    col2: {
      heading: "Before you come",
      p: "The first session is a full session: forty-five minutes to understand what we are dealing with. You do not need to arrive prepared — I ask the questions — and it carries no obligation to continue.",
    },
    col3: {
      heading: "Arranging it",
      p: "WhatsApp is quickest, though email is fine too. I reply personally, usually within 24 hours.",
    },
  },
  seo: {
    metaTitle: "English-speaking psychotherapist in Monza — anxiety and panic",
    metaDescription:
      "Psychotherapy in English in Monza, at via Tolomeo 10, ten minutes from the station. Anxiety, panic attacks, stress, couples. First session 45 minutes, €100. Also online.",
    noIndex: true,
  },
};

// =========================================================== ONLINE ====

const ONLINE_IT = {
  kicker: "Online",
  title: "Psicoterapia in italiano, da dove vivi adesso",
  titleEmphasisWord: "in italiano",
  lead:
    "Lavoro online con italiani che si sono trasferiti all'estero — per studio, per lavoro, per una persona. Ansia e attacchi di panico, stress, difficoltà relazionali, e quello che comporta ricominciare altrove.",
  languageEpigraph: {
    kicker: "La lingua",
    epigraph: "Si può parlare correntemente una lingua e non riuscire a dirci le cose difficili.",
    p1:
      "È una differenza che molte persone scoprono in terapia e non altrove. Il vocabolario del lavoro si costruisce in fretta; quello delle emozioni no. Si finisce per descrivere quello che si prova con parole approssimative, e per accorgersi che l'approssimazione toglie qualcosa.",
    p2:
      "C'è anche un motivo più concreto: le esperienze di cui si parla in terapia sono quasi sempre precedenti al trasferimento. Un'infanzia, una famiglia, una città. Sono state vissute in italiano, e tradurle mentre le racconti è un lavoro in più proprio quando serve meno.",
    p3: "Questo non significa che una terapia in un'altra lingua non funzioni. Significa che, se la tua è l'italiano, non c'è motivo di aggiungere quella fatica.",
  },
  fourAreas: {
    kicker: "Di cosa mi occupo",
    heading: "Quello che porta a scrivermi",
    bands: [
      {
        heading: "Ansia e attacchi di panico",
        p1: "Sono il motivo più frequente. A volte erano già presenti prima di partire; a volte compaiono nel primo anno, quando l'entusiasmo del trasferimento si esaurisce e resta la routine.",
        p2: "Il primo attacco arriva spesso in un posto ordinario, e da lì il perimetro si stringe. Vivere in un paese nuovo lo rende più costoso: le cose da evitare sono anche quelle che stavi ancora imparando a fare.",
        links: [pillarLink("ansia", "it", "Disturbi d'ansia"), pillarLink("panico", "it", "Attacchi di panico e agorafobia")],
      },
      {
        heading: "Solitudine e nostalgia",
        p1: "Non è un disturbo e non compare in nessun manuale, ed è una delle cose di cui si parla più spesso. Amicizie che richiedono anni per ricostruirsi, una rete che è rimasta a duemila chilometri, feste in cui manchi.",
        p2: "Diventa un tema clinico quando comincia a chiudere: quando smetti di uscire perché è faticoso, e la fatica cresce proprio perché non esci.",
        links: [pillarLink("relazioni", "it", "Difficoltà nelle relazioni")],
      },
      {
        heading: "Lavoro e riconoscimento",
        p1: "Ricominciare da una posizione più bassa di quella che avevi. Lavorare in una lingua in cui sei bravo ma non brillante. Sentire di dover dimostrare qualcosa a ogni riunione.",
        p2: "Sono situazioni che consumano più di quanto sembri, e che spesso vengono chiamate stanchezza fino a quando non lo sono più.",
        links: [pillarLink("stress", "it", "Stress e burnout")],
      },
      {
        heading: "Coppie e famiglie a distanza",
        p1: "Coppie in cui si è partiti in due e uno solo ha trovato il proprio posto. Coppie a distanza. Rapporti con i genitori che cambiano quando la distanza li rende telefonate.",
        p2: "Il lavoro di coppia si può fare online anche se siete in due città diverse.",
        links: [pillarLink("coppia", "it", "Terapia di coppia")],
      },
    ],
  },
  timeZones: {
    kicker: "Orari",
    heading: "Lavoro in orario italiano, ma non solo",
    headingEmphasisWord: "non solo",
    p1: "Con l'Europa non c'è quasi nessun problema: un'ora di differenza al massimo, e la sera italiana è la sera anche a Londra, Berlino o Madrid.",
    p2: "Con le Americhe si trova quasi sempre una fascia: la mattina presto qui è la sera tardi a New York, e il primo pomeriggio italiano è l'inizio della giornata sulla costa ovest.",
    p3: "Con l'Asia e l'Oceania è più stretto, ma non impossibile — di solito funziona la mattina presto italiana, che è la sera in Giappone o in Australia.",
    offset: {
      heading: "Prima di prendere impegni",
      p1: "Scrivimi con il tuo fuso e i tuoi orari possibili, e ti dico subito se c'è una fascia compatibile. È la prima cosa da verificare, prima di qualsiasi altra.",
      p2: "Quando l'ora legale cambia in Italia e non da te, l'orario slitta di un'ora: lo sistemiamo insieme, succede due volte l'anno.",
    },
  },
  howItWorks: {
    band1: {
      heading: "La piattaforma",
      p1: "Gli incontri si svolgono su una piattaforma riservata, con collegamento cifrato. Ti mando il link prima di ogni seduta; non serve installare nulla né aprire un account.",
      p2: "Serve una connessione stabile, una stanza in cui non essere interrotto, e delle cuffie. Quest'ultimo dettaglio conta più di quanto sembri.",
    },
    band2: {
      heading: "Durata, costo, pagamento",
      p1: "Quarantacinque minuti a seduta, 100 €. La coppia dura sessanta minuti e costa 130 €. Sono le stesse tariffe degli incontri in studio.",
      p2: "Si paga con bonifico, anche dall'estero. La ricevuta viene rilasciata sempre: se presenti la dichiarazione dei redditi in Italia, è detraibile al 19% come spesa sanitaria sui pagamenti tracciabili.",
    },
    band3: {
      heading: "Se torni, o ti sposti ancora",
      p1: "Il percorso non si interrompe. Chi rientra in Italia continua online oppure passa agli incontri in studio, a Milano, a Monza o a Cernusco sul Naviglio.",
      p2: "Chi si trasferisce di nuovo continua da dove è arrivato: cambia il fuso, non il resto.",
    },
  },
  practical: {
    col1: {
      heading: "Dove sono iscritto",
      p: "Sono iscritto all'Albo degli Psicologi della Lombardia, sezione A, n. 18949. L'iscrizione è pubblica e verificabile. Esercito secondo la normativa italiana, ovunque tu ti trovi.",
    },
    col2: {
      heading: "Il primo incontro",
      p: "Quarantacinque minuti per capire di cosa stiamo parlando: da quanto tempo, in quali situazioni, cosa hai già provato. Le domande le faccio io. Alla fine ti dico cosa ho capito e cosa proporrei.",
    },
    col3: {
      heading: "Per scrivermi",
      p: "WhatsApp o email, come preferisci. Indica il paese in cui vivi e le fasce orarie in cui saresti disponibile: serve a rispondere subito con qualcosa di utile. Rispondo di solito entro 24 ore.",
    },
    closingQuote: "Chi si trasferisce non lascia solo un posto. Lascia anche il modo in cui, in quel posto, era ovvio essere sé stessi.",
  },
  seo: {
    metaTitle: "Psicoterapia online in italiano per chi vive all'estero",
    metaDescription:
      "Psicologo psicoterapeuta italiano, online per chi vive fuori dall'Italia. Ansia, attacchi di panico, solitudine, lavoro. Seduta di 45 minuti, 100 €. Iscritto all'Albo della Lombardia.",
    noIndex: true,
  },
};

const ONLINE_EN = {
  kicker: "Online",
  title: "Therapy in Italian, from wherever you live now",
  titleEmphasisWord: "in Italian",
  lead:
    "I work online with Italians who have moved abroad — for study, for work, for someone. Anxiety and panic attacks, stress, relationship difficulties, and what comes with starting again somewhere else.",
  languageEpigraph: {
    kicker: "Language",
    epigraph: "You can speak a language fluently and still not be able to say the difficult things in it.",
    p1:
      "It is a distinction most people discover in therapy rather than anywhere else. A working vocabulary builds quickly; an emotional one does not. You end up describing what you feel with approximate words, and noticing that the approximation takes something away.",
    p2:
      "There is a more concrete reason too. What gets talked about in therapy almost always predates the move — a childhood, a family, a city. It was lived in Italian, and translating it while recounting it is extra work at exactly the moment you need less of it.",
    p3: "This does not mean therapy in another language does not work. It means that if Italian is yours, there is no reason to add that effort.",
  },
  fourAreas: {
    kicker: "What I work with",
    heading: "What brings people to write",
    bands: [
      {
        heading: "Anxiety and panic attacks",
        p1: "The most frequent reason. Sometimes it was already there before leaving; sometimes it appears in the first year, when the excitement of the move runs out and the routine is what remains.",
        p2: "The first attack usually happens somewhere ordinary, and from there the perimeter tightens. Living in a new country makes that more expensive: the things being avoided are also the things you were still learning to do.",
        links: [pillarLink("ansia", "en", "Anxiety disorders"), pillarLink("panico", "en", "Panic attacks and agoraphobia")],
      },
      {
        heading: "Loneliness and homesickness",
        p1: "Not a disorder, in no manual, and one of the most frequent subjects. Friendships that take years to rebuild, a network still two thousand kilometres away, occasions you are absent from.",
        p2: "It becomes a clinical matter when it starts closing things down: when you stop going out because it is an effort, and the effort grows precisely because you do not go.",
        links: [pillarLink("relazioni", "en", "Relationship difficulties")],
      },
      {
        heading: "Work and recognition",
        p1: "Starting again from a lower position than the one you had. Working in a language you are good in but not brilliant in. Feeling you have something to prove at every meeting.",
        p2: "These wear more than they appear to, and tend to be called tiredness until they stop being that.",
        links: [pillarLink("stress", "en", "Stress and burnout")],
      },
      {
        heading: "Couples and families at a distance",
        p1: "Couples where two people left and only one found their place. Couples living apart. Relationships with parents that change once distance turns them into phone calls.",
        p2: "Couples work can be done online even from two different cities.",
        links: [pillarLink("coppia", "en", "Couples therapy")],
      },
    ],
  },
  timeZones: {
    kicker: "Hours",
    heading: "I work on Italian hours, but not only",
    headingEmphasisWord: "not only",
    p1: "Within Europe there is barely a problem: an hour's difference at most, and evening in Italy is evening in London, Berlin or Madrid too.",
    p2: "With the Americas a window can almost always be found: early morning here is late evening in New York, and early Italian afternoon is the start of the day on the west coast.",
    p3: "With Asia and Oceania it is tighter but not impossible — early Italian morning usually works, which is evening in Japan or Australia.",
    offset: {
      heading: "Before committing to anything",
      p1: "Write with your time zone and the hours that could work, and I will tell you straight away whether there is a compatible window. It is the first thing to establish, before anything else.",
      p2: "When the clocks change in Italy and not where you are, the time shifts by an hour. We sort it out between us; it happens twice a year.",
    },
  },
  howItWorks: {
    band1: {
      heading: "The platform",
      p1: "Sessions are held on a private platform with an encrypted connection. I send the link before each session; nothing to install, no account to create.",
      p2: "You need a stable connection, a room where you will not be interrupted, and headphones. That last one matters more than it sounds.",
    },
    band2: {
      heading: "Length, fee, payment",
      p1: "Forty-five minutes per session, €100. Couples sessions run sixty minutes and cost €130. These are the same fees as in-person sessions.",
      p2: "Payment by bank transfer, including from abroad. A receipt is always issued: if you file an Italian tax return it is deductible at 19% as a medical expense on traceable payments.",
    },
    band3: {
      heading: "If you come back, or move again",
      p1: "The work does not stop. People returning to Italy either continue online or move to in-person sessions in Milan, Monza or Cernusco sul Naviglio.",
      p2: "People moving on again continue from wherever they land: the time zone changes, nothing else does.",
    },
  },
  practical: {
    col1: {
      heading: "Where I am registered",
      p: "I am registered with the Order of Psychologists of Lombardy, section A, no. 18949. The register is public and verifiable. I practise under Italian regulation, wherever you happen to be.",
    },
    col2: {
      heading: "The first session",
      p: "Forty-five minutes to understand what we are dealing with: how long, in which situations, what you have already tried. I ask the questions. At the end I tell you what I have understood and what I would propose.",
    },
    col3: {
      heading: "Getting in touch",
      p: "WhatsApp or email, whichever you prefer. Say which country you are in and which hours could work — it means I can reply with something useful straight away. I usually answer within 24 hours.",
    },
    closingQuote: "Moving does not only mean leaving a place. It means leaving the version of yourself that was obvious there.",
  },
  seo: {
    metaTitle: "Italian-speaking psychotherapist online, for Italians abroad",
    metaDescription:
      "Online therapy in Italian for Italians living abroad. Anxiety, panic attacks, loneliness, work stress. 45-minute session, €100. Registered with the Lombardy board.",
    noIndex: true,
  },
};

async function main() {
  const docs: Array<[string, string, Record<string, unknown>]> = [
    ["milanPage-it", "milanPage", MILAN_IT],
    ["milanPage-en", "milanPage", MILAN_EN],
    ["monzaPage-it", "monzaPage", MONZA_IT],
    ["monzaPage-en", "monzaPage", MONZA_EN],
    ["onlineTherapyPage-it", "onlineTherapyPage", ONLINE_IT],
    ["onlineTherapyPage-en", "onlineTherapyPage", ONLINE_EN],
  ];

  for (const [id, type, fields] of docs) {
    const before = await client.fetch(`*[_id == $id][0]._rev`, { id });
    await upsertSingleton(id, type, fields);
    const after = await client.fetch(`*[_id == $id][0]._rev`, { id });
    console.log(`${id}: ${before ?? "(new)"} -> ${after}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
