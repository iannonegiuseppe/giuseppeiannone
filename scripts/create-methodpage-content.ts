import { createClient } from "@sanity/client";

// Metodo build pass — creates methodPage-it / methodPage-en from scratch
// (schema had zero documents before this pass). createIfNotExists, not
// createOrReplace: idempotent, first-time creation, matching the same
// convention create-contactpage-content.ts already established. Copy is
// verbatim from contents/metodo-copy.md, not rephrased.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const methodPageIt = {
  _id: "methodPage-it",
  _type: "methodPage",
  language: "it",
  kicker: "Metodo",
  title: "La psicoterapia guarda in due direzioni",
  titleEmphasisWord: "due direzioni",
  lead: "Verso la storia da cui una difficoltà è emersa, e verso tutto quello che da allora ha messo fuori portata.",
  split: {
    left: {
      label: "Una faccia — il passato",
      heading: "Da dove viene",
      p1: "Quello che le persone raccontano rimanda quasi sempre a un momento preciso: quello in cui il sintomo è comparso, apparentemente dal nulla. Ripercorrere la storia serve a collocarlo, non a scavare per il gusto di scavare.",
      p2: "In pratica significa raccogliere un'anamnesi clinica e familiare: percorsi precedenti, eventuali terapie in corso, il contesto in cui sei cresciuto e le relazioni che lo hanno formato.",
      p3: "Il passato non è una condanna, e non è un destino.",
    },
    right: {
      label: "L'altra — quello che c'è davanti",
      heading: "Verso cosa",
      p1: "La seconda faccia guarda alle possibilità che una difficoltà ha ristretto. Una parte del lavoro è un inventario di quello che c'è ancora: risorse, capacità, margini rimasti inutilizzati.",
      p2: "Quando la memoria o la concentrazione sembrano poco affidabili, si può verificarlo davvero — con test neuropsicologici validati, invece che a impressione.",
      p3: "Verso la fine definiamo degli orizzonti: progetti a medio termine che la difficoltà stava decidendo al posto tuo.",
    },
  },
  path: {
    kicker: "In mezzo",
    heading: "Il percorso",
    phaseOne: {
      label: "Fase uno",
      heading: "Il primo incontro",
      p1: "Cosa succede, da quanto tempo, in quali situazioni, cosa hai già provato a fare. Anamnesi clinica e contesto familiare. Le domande le faccio io, quindi non serve arrivare con un discorso preparato.",
      p2: "Alla fine ti dico che cosa ho capito e che cosa proporrei.",
    },
    phaseTwo: {
      label: "Fase due",
      heading: "Il meccanismo",
      p1: "Una lettura di come si è formato e di cosa lo tiene in vita adesso. Di solito qui qualcosa si muove già — non perché il sintomo sia sparito, ma perché ha smesso di essere illeggibile.",
      p2: "Da lì si lavora su chi vuoi essere senza quel peso addosso.",
    },
    phaseThree: {
      label: "Fase tre",
      heading: "Sperimentare",
      p1: "Capire non basta. Quello che cambia uno schema è fare qualcosa di diverso e vedere cosa succede davvero — non quello che avevi previsto.",
      p2: "Fra un incontro e l'altro c'è materiale concreto che portiamo a quello successivo.",
    },
    diary: {
      heading: "Il diario",
      p: "L'ansia si ricorda male. A distanza di giorni resta l'impressione generale e i dettagli si perdono — e i dettagli sono esattamente quelli su cui si lavora. Non è un compito da consegnare: è materiale.",
      quote:
        "\"Ore 16:00. Il collega mi chiede se posso occuparmi di una pratica. Sono già in ritardo con le mie consegne. Ma ho paura che, se rifiuto, lui possa rimanerci male e così accetto. E poi l'ansia, perché so già che anche stasera farò tardi.\"",
    },
    experiments: {
      heading: "Piccoli esperimenti",
      p1: "Passi concordati, volutamente piccoli. Cosa succede davvero quando ti sottrai a una richiesta che non ti andava — e poi annotiamo quello che è successo, non quello che temevi sarebbe successo.",
      rhythmLeadIn: "Il ritmo.",
      rhythmBody:
        "Il ritmo. I primi due o tre incontri sono ravvicinati, perché il quadro si sta ancora ricostruendo e gli intervalli lunghi disperdono i dettagli. Poi l'intervallo si allarga, e quando allargarlo lo decidiamo insieme invece di annunciarlo in anticipo.",
    },
  },
  relationship: {
    kicker: "La relazione",
    epigraph:
      "Né affetto, né giudizio. Una distanza precisa — abbastanza vicina da servire, abbastanza lontana da vedere.",
    p1: "Una relazione clinica non è quella che hai con un amico o un familiare. Quella conversazione ha un valore suo e regole sue; questa ha un metodo alle spalle, e una distanza mantenuta di proposito.",
    p2: "Le ricerche sugli esiti sono abbastanza concordi su un punto: quello che predice il cambiamento non è tanto la scuola di appartenenza del terapeuta, quanto l'alleanza di lavoro che le due persone riescono a costruire. Che è un altro modo per dire che la relazione non è la cornice del lavoro. È parte del lavoro.",
    p3: "Ed è il motivo per cui farlo da soli è più difficile di quanto sembri. Esaminare i propri errori dall'interno è difficile per costruzione — già Galeno raccomandava di lasciarsi aiutare in questo compito, e da allora il problema non è migliorato. Per diventare psicoterapeuta in Italia servono circa dieci anni di formazione teorica e pratica, con un aggiornamento continuo che non finisce. È su questo che la distanza si regge.",
  },
  approach: {
    kicker: "L'approccio",
    heading: "Compreresti le scarpe da qualcuno che vende un solo numero?",
    headingEmphasisWord: "un solo numero?",
    p1: "Un metodo che costringe ogni difficoltà dentro la stessa cornice parla una lingua sola — la propria — e lascia a te il compito di tradurti. Se hai in mano un martello, tutto comincia a somigliare a un chiodo.",
    p2: "Preferisco partire dalla persona e scegliere lo strumento dopo. Non ho mai incontrato due persone con la stessa ansia.",
    offset: {
      heading: "Cosa chiedo a te",
      p1: "Pensa a una palestra. Un allenatore può costruire il programma e correggerti la postura, ma nessuno può sollevare al posto tuo — lo sforzo non si trasferisce.",
      p2: "Qui vale lo stesso. Non mi sostituirò a te nel tuo percorso. Quello che faccio è tenere una direzione al lavoro, e fare in modo che tu possa accorgerti se si sta muovendo.",
    },
  },
  fitEnding: {
    band1: {
      heading: "Se non sono la persona giusta",
      p1: "Succede. Qualcuno cerca una tecnica specifica che non pratico, o un tipo di sostegno che appartiene a tutt'altro ambito.",
      p2: "Il primo incontro serve anche a stabilirlo, e quando è così te lo dico e ti indirizzo verso dove cercare. Costa un incontro e ne fa risparmiare parecchi.",
    },
    band2: {
      heading: "Come finisce",
      p1: "Di proposito, non per inerzia. Nella fase conclusiva definiamo cosa viene dopo: progetti a medio termine che la difficoltà stava silenziosamente decidendo al posto tuo.",
      p2: "Poi alcuni incontri di controllo, distribuiti nei mesi successivi, per vedere come sta tenendo. Tutto quello che hai imparato lungo il percorso resta con te — che poi è il punto. La direzione del lavoro è verso il non averne più bisogno.",
    },
  },
  practical: {
    col1: {
      heading: "Online e in studio",
      p: "Stessa durata, stessa tariffa, stesso modo di lavorare. Due studi a Milano, uno a Monza, uno a Cernusco sul Naviglio — oppure una piattaforma riservata, da dove ti trovi.",
    },
    col2: {
      heading: "In raccordo con il medico",
      p: "Non sono un medico e non prescrivo farmaci. Quando una terapia è già in corso lavoro in raccordo con chi l'ha prescritta; quando emerge che varrebbe la pena valutarla, te lo dico e ti indirizzo.",
    },
    col3: {
      heading: "Cosa resta nella stanza",
      p: "Tutto, compreso il fatto stesso che tu sia qui. In Italia il segreto professionale è un obbligo di legge, non una cortesia.",
    },
    closingQuote:
      "Riconoscere l'individualità della persona che ho davanti è forse la forma più alta di rispetto che le posso portare.",
  },
  seo: {
    metaTitle: "Metodo — come lavoro, incontro dopo incontro",
    metaDescription:
      "Come si svolge un percorso di psicoterapia cognitivo-neuropsicologica: il primo incontro, la comprensione del meccanismo, il lavoro fra una seduta e l'altra. Milano, Monza, Cernusco sul Naviglio e online.",
    noIndex: true,
  },
};

const methodPageEn = {
  _id: "methodPage-en",
  _type: "methodPage",
  language: "en",
  kicker: "Method",
  title: "Therapy faces in two directions",
  titleEmphasisWord: "two directions",
  lead: "Towards the history a difficulty emerged from, and towards everything it has since put out of reach.",
  split: {
    left: {
      label: "One face — the past",
      heading: "Where it came from",
      p1: "What people describe almost always points back to a particular moment: the one where the symptom appeared, apparently from nothing. Retracing the history places it — it does not excavate for the sake of excavating.",
      p2: "In practice that means a clinical history and a family history: previous care, any medication, the context you grew up in and the relationships that shaped it.",
      p3: "The past is not a sentence, and it is not a destiny.",
    },
    right: {
      label: "The other — what is ahead",
      heading: "Towards what",
      p1: "The second face looks at the possibilities a difficulty has narrowed. Part of the work is an inventory of what is still there: strengths, capacities, room that has gone unused.",
      p2: "Where memory or concentration feel unreliable, that can be checked properly — with validated neuropsychological instruments rather than by impression.",
      p3: "Towards the end we set out horizons: projects over the medium term that the difficulty had been deciding against.",
    },
  },
  path: {
    kicker: "In between",
    heading: "The path",
    phaseOne: {
      label: "Phase one",
      heading: "The first session",
      p1: "What is happening, since when, in which situations, what you have already tried. Clinical history and family context. I ask the questions, so you do not need a prepared account.",
      p2: "At the end I tell you what I have understood and what I would propose.",
    },
    phaseTwo: {
      label: "Phase two",
      heading: "The mechanism",
      p1: "A reading of how it formed and what keeps it running now. Something usually shifts here already — not because the symptom has gone, but because it has stopped being unreadable.",
      p2: "From there we work on who you want to be without that weight.",
    },
    phaseThree: {
      label: "Phase three",
      heading: "Trying things out",
      p1: "Understanding is not enough. What changes a pattern is doing something different and seeing what actually follows — not what you predicted would.",
      p2: "Between sessions there is concrete material we bring to the next one.",
    },
    diary: {
      heading: "The diary",
      p: "Anxiety remembers itself badly. Days later the general impression survives and the details are gone — and the details are exactly what the work needs. It is not homework to hand in; it is material.",
      quote:
        "\"16:00. A colleague asks whether I can take on a file. I am already behind on my own deadlines. But I am afraid that if I refuse he will take it badly, so I accept. Then the anxiety, because I already know I will be late home again.\"",
    },
    experiments: {
      heading: "Small experiments",
      p1: "Agreed steps, deliberately small. What actually happens when you decline something you did not want — and then we write down what happened, rather than what you feared would.",
      rhythmLeadIn: "The rhythm.",
      rhythmBody:
        "The rhythm. The first two or three sessions are close together, because the picture is still being built and long gaps disperse the detail. Then the interval widens, and when to widen it is decided together rather than announced in advance.",
    },
  },
  relationship: {
    kicker: "The relationship",
    epigraph: "Not affection, and not judgement. A particular distance — close enough to be useful, far enough to see.",
    p1: "A clinical relationship is not the one you have with a friend or a relative. That conversation has real value and its own rules; this one has a method behind it, and a distance that is deliberately maintained.",
    p2: "Research on outcomes is fairly consistent on the point: what predicts change is less the school a therapist belongs to than the working alliance the two people manage to build. Which is another way of saying that the relationship is not the setting for the work. It is part of the work.",
    p3: "And it is why doing this alone is harder than it looks. Examining your own errors from the inside is structurally difficult — Galen was already recommending that we let someone else help with the task, and the problem has not improved since. Becoming a psychotherapist in Italy takes about ten years of theoretical and practical training, with continuing education that does not end. That is what the distance is built on.",
  },
  approach: {
    kicker: "The approach",
    heading: "Would you buy shoes from someone who stocks a single size?",
    headingEmphasisWord: "a single size?",
    p1: "A method that forces every difficulty into the same frame speaks one language — its own — and leaves you to translate yourself into it. If you hold a hammer, everything starts to look like a nail.",
    p2: "I would rather begin from the person and choose the tool afterwards. I have never met two people with the same anxiety.",
    offset: {
      heading: "What I ask of you",
      p1: "Think of a gym. A trainer can build the programme and correct your form, but nobody can lift on your behalf — the exertion does not transfer.",
      p2: "The same holds here. I will not stand in for you in your own process. What I will do is make sure the work has a direction, and that you can tell whether it is moving.",
    },
  },
  fitEnding: {
    band1: {
      heading: "If the fit is wrong",
      p1: "Sometimes what someone is looking for is not what I offer — a specific technique I do not practise, or a kind of support that belongs somewhere else entirely.",
      p2: "The first session is partly for establishing that, and when it is the case I say so and point you towards where to look. It costs one session and saves a great deal else.",
    },
    band2: {
      heading: "How it ends",
      p1: "Deliberately, not by drifting. In the closing phase we set out what comes next: projects over the medium term that the difficulty had been quietly deciding against.",
      p2: "Then follow-up sessions, spaced out over the months that follow, to see how things are holding. Everything learned along the way stays with you — that is rather the point. The direction of the work is towards not needing it.",
    },
  },
  practical: {
    col1: {
      heading: "Online and in person",
      p: "Same length, same fee, same way of working. Two studios in Milan, one in Monza, one in Cernusco sul Naviglio — or a private platform, from wherever you are.",
    },
    col2: {
      heading: "Alongside your doctor",
      p: "I am not a physician and I do not prescribe. Where medication is already in place I work with whoever prescribed it; where it is worth assessing, I say so and point you there.",
    },
    col3: {
      heading: "What stays in the room",
      p: "Everything, including the fact that you are here at all. In Italy professional secrecy is a legal obligation rather than a courtesy.",
    },
    closingQuote:
      "Recognising the individuality of the person in front of me is perhaps the highest form of respect I can offer them.",
  },
  seo: {
    metaTitle: "Method — how I work, session after session",
    metaDescription:
      "How a course of cognitive-neuropsychological psychotherapy proceeds: the first session, understanding the mechanism, the work between sessions. Milan, Monza, Cernusco sul Naviglio and online.",
    noIndex: true,
  },
};

async function main() {
  await client.createIfNotExists(methodPageIt);
  console.log("methodPage-it created (or already existed)");
  await client.createIfNotExists(methodPageEn);
  console.log("methodPage-en created (or already existed)");
}
main();
