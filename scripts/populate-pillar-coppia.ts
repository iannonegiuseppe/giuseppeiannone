import { createClient } from "@sanity/client";
import { h2, p } from "./lib/portableText";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Pillar rollout — couples therapy, unblocked. Source:
// contents/pillar-coppia-bozza.md (IT+EN combined). Copy transcribed
// verbatim, no edits, review note not imported. The draft's own note
// confirms the "stay or leave" line was already removed before this
// draft was written ("Rimossa la frase... Giuseppe ha chiesto di non
// menzionarla") — nothing further to strip here. Recognition quotes are
// Giuseppe's own (draft note: "Le sei frasi sono sue"), isDraft stays
// false throughout. Facts strip: per explicit instruction this page
// states BOTH duration and price (the other five pillars state neither)
// — combined onto one "Seduta"/"Session" line rather than dropping one
// of the strip's other three usual facts, to keep the same 4-item shape
// every other pillar uses. noIndex: true throughout.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_ASSET = "image-b75507adc977fa959cb1558f2de444cf983cb420-2000x1333-jpg";

const faqIt = [
  { q: "Dobbiamo venire tutti e due?", a: "Per la terapia di coppia sì. Se uno dei due non vuole o non può, il lavoro individuale sulle difficoltà relazionali è un'alternativa reale, non un ripiego." },
  { q: "Quanto dura una seduta di coppia?", a: "Quarantacinque minuti, come le sedute individuali, e allo stesso costo." },
  { q: "Prende posizione per uno dei due?", a: "No. Non è il ruolo. Il compito è rendere visibile quello che accade fra i due, non stabilire chi ha ragione." },
  { q: "Si può fare online?", a: "Sì, anche con i due partner in luoghi diversi." },
  { q: "Dove ricevi?", a: "In due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online." },
];

const faqEn = [
  { q: "Do we both have to come?", a: "For couples therapy, yes. If one of you won't or can't, individual work on relationship difficulties is a real alternative, not a fallback." },
  { q: "How long is a couples session?", a: "Forty-five minutes, the same as individual sessions, and at the same cost." },
  { q: "Do you take sides?", a: "No. That isn't the role. The task is to make visible what happens between the two of you, not to establish who's right." },
  { q: "Can this be done online?", a: "Yes, including with the two partners in different places." },
  { q: "Where do you practise?", a: "Two practices in Milan, one in Monza and one in Cernusco sul Naviglio, plus online." },
];

// Confidence notes (reported to the user, not encoded here): 1,2,3,5,6
// are direct lifts from this page's own H2 titles; 4 is paraphrased —
// no clean lift existed for it.
const recognitionIt = [
  { quote: "Ogni discussione finisce per parlare dell'ultima lite. Mai di quello che ci ha fatto soffrire davvero.", label: "Conflitti che si ripetono" },
  { quote: "Viviamo nella stessa casa. Ma è da tempo che non ci sentiamo nello stesso posto.", label: "Distanza emotiva" },
  { quote: "Cambiano le parole. La sensazione alla fine della discussione è sempre la stessa.", label: "Problemi di comunicazione" },
  { quote: "Non ci chiediamo più come stiamo. Ci chiediamo soltanto chi ha sbagliato.", label: "Ricerca di colpa" },
  { quote: "Da quando è successo, vorrei perdonare ma non ce la faccio.", label: "Tradimento" },
  { quote: "Dormiamo nello stesso letto, ma ci sentiamo lontanissimi. L'affetto è rimasto. La vicinanza no.", label: "Mancanza di intimità" },
];

const recognitionEn = [
  { quote: "Every argument ends up being about the last argument. Never about what actually hurt.", label: "Repeating conflict" },
  { quote: "We live in the same house. But it's been a long time since we felt like we were in the same place.", label: "Emotional distance" },
  { quote: "The words change. The feeling at the end of the argument is always the same.", label: "Communication problems" },
  { quote: "We don't ask each other how we are any more. We only ask who was wrong.", label: "Searching for blame" },
  { quote: "Since it happened, I want to forgive but I can't.", label: "Infidelity" },
  { quote: "We sleep in the same bed but feel very far apart. The affection is still there. The closeness isn't.", label: "Lost intimacy" },
];

const bodyIt = [
  h2("Terapia di coppia: quando serve un terzo nella stanza"),
  p("Molte coppie non arrivano perché non si parlano. Arrivano perché parlano moltissimo e non arriva niente."),
  p("La conversazione esiste, ma gira: ogni discussione finisce per riguardare l'ultima discussione, e quello che faceva male all'inizio non viene mai detto."),
  p("Un terzo nella stanza non serve a dare ragione. Serve perché da dentro una dinamica non si vede la dinamica — si vede solo l'altro che la alimenta."),
  h2("Problemi di comunicazione nella coppia"),
  p("Il problema raramente è il contenuto delle discussioni. È la loro forma."),
  p("Chi porta il tema si sente accusatore. Chi ascolta si sente sotto processo e si difende. La difesa viene letta come mancanza di ascolto. E il tema originale — quello per cui si era cominciato — non arriva mai al centro."),
  p("In seduta la prima cosa che si fa è rallentare: fermarsi al punto in cui la conversazione ha cambiato direzione, e guardare cosa è successo lì. Di solito succede molto prima di quanto entrambi ricordino."),
  h2("Distanza emotiva e mancanza di intimità"),
  p("C'è una difficoltà che non produce litigi. Produce silenzio."),
  p("L'affetto è rimasto, la convivenza funziona, l'organizzazione familiare non ha problemi. Quello che è sparito è il sentirsi nello stesso posto."),
  p("Spesso non c'è un momento in cui è successo. È una serie di piccole rinunce: conversazioni non fatte per stanchezza, argomenti evitati per non litigare, gesti che hanno smesso di avere un senso. Nessuna singola rinuncia sembra importante. L'insieme lo è."),
  h2("Crisi di coppia e conflitti che si ripetono"),
  p("Quando la stessa lite ritorna con parole diverse, non è un problema di memoria. È un ciclo."),
  p("Ognuno reagisce alla reazione dell'altro, e il punto di partenza scompare. A quel punto la discussione non riguarda più il fatto: riguarda chi ha ragione su come è andata la volta scorsa."),
  p("Il lavoro è interrompere il ciclo prima che si chiuda — cosa che richiede di riconoscerlo mentre sta accadendo, non dopo."),
  h2("Tradimento: quando la fiducia si è rotta"),
  p("Dopo un tradimento la domanda che arriva in studio quasi sempre non è \"restiamo insieme?\". È \"posso fidarmi di nuovo?\"."),
  p("Sono due domande diverse e vanno tenute separate. La prima è una decisione. La seconda è un processo, e non dipende dalla volontà: nessuno decide di fidarsi."),
  p("Il lavoro qui è lento e riguarda entrambi: chi ha tradito e chi è stato tradito hanno due percorsi diversi da fare, e forzarli a coincidere non funziona."),
  h2("Terapia di coppia a Milano, Monza e Cernusco sul Naviglio"),
  p("Ricevo in due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Lavoro in italiano e in inglese, il che rende possibile la terapia anche per coppie in cui i due partner non condividono la stessa lingua madre."),
  p("Il primo incontro serve a capire cosa sta chiedendo la coppia, e se la terapia di coppia è la forma giusta per quella richiesta. A volte non lo è: succede che il percorso più utile sia individuale, per uno dei due o per entrambi."),
  h2("Quando ha senso chiedere aiuto"),
  p("— Le discussioni finiscono sempre allo stesso modo?"),
  p("— Abbiamo smesso di parlare di certe cose per non litigare?"),
  p("— C'è un argomento che evitiamo da mesi?"),
  p("— Stiamo insieme per scelta o per abitudine?"),
  p("Non serve essere sull'orlo della separazione per chiedere una consulenza."),
];

const bodyEn = [
  h2("Couples therapy: why a third person in the room helps"),
  p("Many couples don't come because they've stopped talking. They come because they talk a great deal and nothing arrives."),
  p("The conversation exists, but it circles: every argument ends up being about the last argument, and whatever hurt in the first place never gets said."),
  p("A third person in the room isn't there to decide who's right. They're there because from inside a dynamic you can't see the dynamic — you only see the other person feeding it."),
  h2("Communication problems in a relationship"),
  p("The problem is rarely what the arguments are about. It's their shape."),
  p("Whoever raises the subject sounds accusing. Whoever listens feels on trial and defends themselves. The defence reads as not listening. And the original subject — the reason it started — never reaches the centre."),
  p("The first thing we do in session is slow down: stop at the point where the conversation changed direction, and look at what happened there. It's usually much earlier than either person remembers."),
  h2("Emotional distance and lost intimacy"),
  p("There's a difficulty that produces no arguments at all. It produces silence."),
  p("The affection is still there, living together works, the household runs. What's gone is the sense of being in the same place."),
  p("Often there's no moment when it happened. It's a series of small withdrawals: conversations not had because of tiredness, subjects avoided to prevent a row, gestures that stopped meaning anything. No single withdrawal seems important. The accumulation is."),
  h2("Repeating conflict and relationship crisis"),
  p("When the same argument returns in different words, it isn't a memory problem. It's a cycle."),
  p("Each person responds to the other's response, and the starting point disappears. At that point the argument is no longer about the thing: it's about who's right regarding how last time went."),
  p("The work is interrupting the cycle before it closes — which requires recognising it while it's happening, not afterwards."),
  h2("Infidelity: when trust has broken"),
  p("After infidelity, the question that arrives in the room is almost never \"should we stay together?\". It's \"can I trust again?\"."),
  p("Those are two different questions and they need to stay separate. The first is a decision. The second is a process, and it doesn't answer to willpower: nobody decides to trust."),
  p("The work here is slow and concerns both people: the one who betrayed and the one who was betrayed have two different paths to walk, and forcing them to coincide doesn't work."),
  h2("Couples therapy in English in Milan, Monza and Cernusco"),
  p("I'm an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy. I see couples in two practices in Milan, in Monza and in Cernusco sul Naviglio, and online."),
  p("I work in English and in Italian — which makes therapy possible for couples where the two partners don't share a first language. That situation is common in Milan, and it isn't a detail: an argument conducted in someone's second language is a different argument."),
  p("The first session is about understanding what the couple is asking for, and whether couples therapy is the right form for that request. Sometimes it isn't: occasionally the more useful path is individual work, for one or both."),
  h2("When it makes sense to ask for help"),
  p("— Do arguments always end the same way?"),
  p("— Have we stopped raising certain things to avoid a row?"),
  p("— Is there a subject we've been avoiding for months?"),
  p("— Are we together by choice or by habit?"),
  p("You don't need to be on the edge of separating to ask for a consultation."),
];

function faqAnswer(text: string) {
  return [
    {
      _key: "faq-answer-1",
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _key: "faq-answer-span-1", _type: "span", marks: [], text }],
    },
  ];
}

async function main() {
  const faqItIds: string[] = [];
  const faqEnIds: string[] = [];

  for (let i = 0; i < faqIt.length; i++) {
    const n = i + 1;
    const itItem = faqIt[i];
    const enItem = faqEn[i];
    if (!itItem || !enItem) throw new Error(`Missing FAQ item at index ${i}`);
    const itId = `faqItem-coppia-${n}-it`;
    const enId = `faqItem-coppia-${n}-en`;
    await upsertDoc(client, itId, "faqItem", { question: itItem.q, answer: faqAnswer(itItem.a), language: "it" });
    await upsertDoc(client, enId, "faqItem", { question: enItem.q, answer: faqAnswer(enItem.a), language: "en" });
    await upsertTranslationMetadata(client, `faqItem-coppia-${n}`, "faqItem", itId, enId);
    faqItIds.push(itId);
    faqEnIds.push(enId);
  }

  const recognitionItItems = recognitionIt.map((r, i) => ({
    _key: `recognition-it-${i}`,
    _type: "recognitionItem",
    quote: r.quote,
    label: r.label,
    isDraft: false,
  }));
  const recognitionEnItems = recognitionEn.map((r, i) => ({
    _key: `recognition-en-${i}`,
    _type: "recognitionItem",
    quote: r.quote,
    label: r.label,
    isDraft: false,
  }));

  await upsertDoc(client, "pillarPage-coppia-it", "pillarPage", {
    title: "Terapia di coppia",
    slug: { _type: "slug", current: "terapia-di-coppia" },
    titleEmphasisWord: "coppia",
    heroKicker: "AREA DI INTERVENTO",
    standfirst: "Quando le stesse parole tornano ogni volta, e la sensazione alla fine è sempre la stessa.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Due persone sedute vicine, mani intrecciate, inquadratura ravvicinata su busto e ginocchia." },
    factsStrip: {
      items: [
        { label: "Seduta", value: "45 minuti, 100 €" },
        { label: "Modalità", value: "In studio e online" },
        { label: "Lingue", value: "Italiano e inglese" },
        { label: "Dove", value: "Milano, Monza, Cernusco sul Naviglio" },
      ],
    },
    recognition: { items: recognitionItItems },
    faqItems: faqItIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyIt,
    seo: {
      metaTitle: "Terapia di coppia a Milano e Monza — Psicoterapeuta",
      metaDescription: "Comunicazione, distanza emotiva, tradimento, conflitti che si ripetono. Terapia di coppia a Milano, Monza, Cernusco sul Naviglio e online.",
      noIndex: true,
    },
    language: "it",
  });

  await upsertDoc(client, "pillarPage-coppia-en", "pillarPage", {
    title: "Couples therapy",
    slug: { _type: "slug", current: "couples-therapy" },
    titleEmphasisWord: "therapy",
    heroKicker: "AREA OF WORK",
    standfirst: "When the same words come back every time, and the feeling at the end is always the same.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Two people sitting close together, hands clasped, close-up framing on torso and knees." },
    factsStrip: {
      items: [
        { label: "Session", value: "45 minutes, €100" },
        { label: "Format", value: "In person and online" },
        { label: "Languages", value: "English and Italian" },
        { label: "Where", value: "Milan, Monza, Cernusco sul Naviglio" },
      ],
    },
    recognition: { items: recognitionEnItems },
    faqItems: faqEnIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyEn,
    seo: {
      metaTitle: "Couples Therapy in English — Milan, Monza, Online",
      metaDescription: "Communication, emotional distance, infidelity, repeating conflict. Couples therapy in English and Italian in Milan, Monza and online.",
      noIndex: true,
    },
    language: "en",
  });

  await upsertTranslationMetadata(client, "pillarPage-coppia", "pillarPage", "pillarPage-coppia-it", "pillarPage-coppia-en");

  console.log("\n=== couples pillar: done ===");
}

main();
