import { createClient } from "@sanity/client";
import { h2, p, pBoldStart } from "./lib/portableText";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Pillar rollout — stress and burnout. Source: contents/pillar-stress-bozza.md
// (IT+EN combined). Copy transcribed verbatim, no edits. The draft's own banner
// is explicit: "per quest'area Giuseppe non ha fornito frasi. Le sei del blocco
// Recognition sono scritte da me" — so every recognition item ships isDraft:
// true (Studio-only flag, see pillarPage.ts's recognitionItem type), and the
// lead-in uses the draft's own neutral wording via the new (owner-approved)
// recognition.leadInOverride field instead of the standard "Frasi che sento
// spesso in studio" disclaimer, which would misattribute these quotes to
// Giuseppe. Recognition labels are derived from this page's own H2/bold
// sub-labels (burnout's three components map directly); flagged as
// lower-confidence in the population report, same as the quotes themselves.
// No bracketed placeholders existed in this draft. noIndex: true throughout.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_ASSET = "image-1237307dfdc95916641c4b96d2a8195226a263cd-2000x1333-jpg";

const faqIt = [
  { q: "Burnout e depressione sono la stessa cosa?", a: "No, anche se condividono sintomi. Il burnout è legato a un contesto — di solito lavorativo — e tende a variare con esso; la depressione riguarda tutti gli ambiti della vita. Distinguerli è parte della valutazione iniziale." },
  { q: "Devo fare prima una visita medica?", a: "Se ci sono sintomi fisici persistenti, sì. Stanchezza cronica, disturbi del sonno e sintomi gastrointestinali hanno cause organiche possibili che vanno escluse." },
  { q: "Serve cambiare lavoro?", a: "Non è una domanda a cui rispondo io. È una decisione che riguarda la vita di chi la prende. Il lavoro in studio serve a prenderla con chiarezza, non per esaurimento." },
  { q: "Si può lavorare online?", a: "Sì. Gli incontri online hanno la stessa durata e lo stesso costo di quelli in studio." },
  { q: "Dove ricevi?", a: "In due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online." },
];

const faqEn = [
  { q: "Are burnout and depression the same thing?", a: "No, though they share symptoms. Burnout is tied to a context — usually work — and tends to vary with it; depression affects every area of life. Telling them apart is part of the initial assessment." },
  { q: "Do I need to see a doctor first?", a: "If there are persistent physical symptoms, yes. Chronic tiredness, sleep problems and digestive symptoms all have possible physical causes that need ruling out." },
  { q: "Do I need to change job?", a: "That isn't a question I answer. It's a decision about someone's own life. The work in the room is there so the decision gets made with clarity rather than through exhaustion." },
  { q: "Can this be done online?", a: "Yes. Online sessions run the same length and cost the same as those in person." },
  { q: "Where do you practise?", a: "Two practices in Milan, one in Monza and one in Cernusco sul Naviglio, plus online." },
];

const recognitionIt = [
  { quote: "Dormo, ma mi sveglio già stanco.", label: "Stress cronico" },
  { quote: "Faccio le stesse cose di prima e mi costano il doppio.", label: "Esaurimento" },
  { quote: "Ho smesso di sentire qualcosa per il lavoro. Né bene né male.", label: "Distacco" },
  { quote: "Rimando le cose che prima facevo senza pensarci.", label: "Senso di inefficacia" },
  { quote: "Il corpo mi presenta il conto: stomaco, testa, sonno.", label: "Sintomi fisici dello stress" },
  { quote: "Quando finalmente mi fermo, sto peggio.", label: "Il crollo nelle pause" },
];

const recognitionEn = [
  { quote: "I sleep, but I wake up already tired.", label: "Chronic stress" },
  { quote: "I do the same things as before and they cost me twice as much.", label: "Exhaustion" },
  { quote: "I've stopped feeling anything about work. Not good, not bad.", label: "Detachment" },
  { quote: "I put off things I used to do without thinking.", label: "A sense of ineffectiveness" },
  { quote: "My body is presenting the bill: stomach, head, sleep.", label: "Physical symptoms of stress" },
  { quote: "When I finally stop, I feel worse.", label: "Collapsing during the breaks" },
];

const bodyIt = [
  h2("Stress cronico: quando il riposo non basta più"),
  p("Lo stress non è un problema in sé. È la risposta con cui l'organismo affronta una richiesta, e quando la richiesta finisce la risposta si spegne."),
  p("Il problema comincia quando non si spegne. Quando la fase di recupero non arriva mai per intero, e ogni nuova richiesta parte da un livello di attivazione che non è mai tornato a zero."),
  p("Il segnale più affidabile non è quanto si è stanchi. È che il riposo non ripaga più: si dorme e ci si sveglia stanchi, si passa un fine settimana fermi e il lunedì è identico a prima."),
  h2("Sintomi fisici dello stress"),
  p("Lo stress prolungato si presenta prima nel corpo che nei pensieri, ed è il motivo per cui molte persone arrivano dopo mesi di accertamenti medici."),
  p("Disturbi del sonno, in entrata o con risvegli. Tensione a collo, spalle, mascella. Disturbi gastrointestinali. Mal di testa ricorrenti. Cambiamenti dell'appetito. Infezioni più frequenti. Un senso di stanchezza che non corrisponde a quello che si è fatto."),
  p("Se gli esami non trovano nulla, non significa che i sintomi non ci fossero. Significa che il corpo stava rispondendo a qualcosa che non è una malattia."),
  h2("Burnout lavorativo: le tre componenti"),
  p("Il burnout non è semplicemente stanchezza da troppo lavoro. Ha una forma riconoscibile, e si sviluppa in tre direzioni contemporaneamente."),
  pBoldStart("Esaurimento.", " Le energie non si ricostituiscono. Non è la stanchezza di una giornata pesante: è una stanchezza di fondo che precede la giornata."),
  pBoldStart("Distacco.", " Ci si allontana emotivamente da quello che si fa. Le persone con cui si lavora diventano pratiche da smaltire. Il cinismo cresce, e spesso sorprende chi lo sente arrivare."),
  pBoldStart("Senso di inefficacia.", " L'impressione di non incidere più, di non essere bravi come si era, di non riuscire a chiudere niente davvero."),
  p("Il burnout riguarda soprattutto chi ha investito molto: raramente colpisce chi era indifferente al proprio lavoro fin dall'inizio."),
  h2("Perché ci si ferma quando ci si ferma"),
  p("Molte persone crollano non durante il periodo difficile, ma subito dopo. In vacanza, nel primo weekend libero, alla fine di un progetto."),
  p("Non è una coincidenza. Finché la richiesta è attiva, l'attivazione la sostiene. Quando la richiesta cade, cade anche l'attivazione, e quello che era stato rimandato arriva tutto insieme."),
  p("Questo produce un'ulteriore difficoltà: si arriva a temere le pause, perché è lì che si sta peggio."),
  h2("Stress, ansia e insonnia: cosa si tiene insieme"),
  p("Stress prolungato e ansia si alimentano a vicenda. Lo stress abbassa la soglia a cui il sistema di allarme si attiva; l'ansia impedisce il recupero che ridurrebbe lo stress."),
  p("Il sonno è spesso il punto in cui la cosa si vede per prima. Non riuscire ad addormentarsi perché la testa non si ferma, o svegliarsi alle quattro con i pensieri già in corsa, è tra i primi segnali e tra gli ultimi a rientrare."),
  h2("Psicoterapia per stress e burnout a Milano, Monza e Cernusco"),
  p("Ricevo in due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Lavoro in italiano e in inglese."),
  p("Il primo incontro serve a capire da quanto dura, cosa è cambiato, e cosa è già stato provato. Serve anche a distinguere: stress prolungato, burnout e depressione condividono sintomi ma non sono la stessa cosa, e il lavoro cambia a seconda di quale sia."),
  p("Da lì si lavora su tre fronti: ridurre l'attivazione di fondo, ricostruire un recupero che funzioni davvero, e guardare le richieste — quelle esterne e quelle che ci si fa da soli, che spesso sono le più difficili da negoziare."),
  p("Non prometto che il carico diminuisca: molte volte non dipende da chi è in studio. Quello su cui si può lavorare è come quel carico viene attraversato."),
  h2("Quando ha senso chiedere aiuto"),
  p("— Il riposo mi rimette in sesto, o non più?"),
  p("— La stanchezza c'era già al risveglio?"),
  p("— Ho smesso di sentire qualcosa per cose che prima mi importavano?"),
  p("— Il corpo mi sta dando segnali da mesi?"),
  p("Se il riposo non funziona più, aspettare che funzioni raramente aiuta."),
];

const bodyEn = [
  h2("Chronic stress: when rest stops working"),
  p("Stress isn't a problem in itself. It's how the body meets a demand, and when the demand ends the response switches off."),
  p("The problem starts when it doesn't. When the recovery phase never fully arrives, and each new demand begins from a level of activation that never went back to zero."),
  p("The most reliable signal isn't how tired you are. It's that rest stops paying you back: you sleep and wake up tired, you spend a weekend doing nothing and Monday is identical."),
  h2("Physical symptoms of stress"),
  p("Prolonged stress shows up in the body before it shows up in thought, which is why many people arrive after months of medical investigation."),
  p("Sleep problems, falling asleep or waking. Tension in the neck, shoulders, jaw. Digestive problems. Recurring headaches. Changes in appetite. More frequent infections. A tiredness that doesn't match what you've actually done."),
  p("If tests find nothing, it doesn't mean the symptoms weren't there. It means the body was responding to something that isn't an illness."),
  h2("Workplace burnout: the three components"),
  p("Burnout isn't simply tiredness from too much work. It has a recognisable shape, and it develops in three directions at once."),
  pBoldStart("Exhaustion.", " Energy doesn't rebuild. It isn't the tiredness of a hard day: it's a baseline tiredness that precedes the day."),
  pBoldStart("Detachment.", " You move away emotionally from what you do. The people you work with become items to process. Cynicism grows, and often surprises the person feeling it arrive."),
  pBoldStart("A sense of ineffectiveness.", " The impression of no longer making a difference, of not being as good as you were, of never really finishing anything."),
  p("Burnout mostly affects people who invested heavily: it rarely reaches anyone who was indifferent to their work from the start."),
  h2("Why you collapse when you finally stop"),
  p("Many people don't break down during the difficult period but immediately afterwards. On holiday, on the first free weekend, at the end of a project."),
  p("That isn't a coincidence. While the demand is live, the activation sustains it. When the demand drops, the activation drops too, and everything that was postponed arrives at once."),
  p("That produces a further difficulty: you start to dread the breaks, because that's where you feel worst."),
  h2("Stress, anxiety and insomnia"),
  p("Prolonged stress and anxiety feed each other. Stress lowers the threshold at which the alarm system fires; anxiety prevents the recovery that would reduce the stress."),
  p("Sleep is often where it shows first. Not being able to fall asleep because your head won't stop, or waking at four with the thoughts already running, is among the earliest signs and among the last to settle."),
  h2("Therapy in English for stress and burnout in Milan and Monza"),
  p("I'm an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy. I see people in two practices in Milan, in Monza and in Cernusco sul Naviglio, and online, in English and in Italian."),
  p("Milan runs on demanding work, and a large part of the people I see in English came here for it. That adds something specific: performing in a second language, being far from the people who'd notice you were struggling, and a visa or a contract that can make stepping back feel impossible."),
  p("The first session is about how long it's been going on, what changed, and what's already been tried. It also serves to distinguish: prolonged stress, burnout and depression share symptoms but aren't the same thing, and the work differs depending on which it is."),
  p("From there we work on three fronts: reducing baseline activation, rebuilding recovery that actually recovers, and looking at the demands — the external ones and the ones you make of yourself, which are usually the harder to renegotiate."),
  p("I don't promise the load will get lighter: often that isn't in the hands of the person in the room. What can be worked on is how that load is carried."),
  h2("When it makes sense to ask for help"),
  p("— Does rest still put me right, or not any more?"),
  p("— Was the tiredness already there when I woke up?"),
  p("— Have I stopped feeling anything about things that used to matter?"),
  p("— Has my body been sending signals for months?"),
  p("If rest has stopped working, waiting for it to start again rarely helps."),
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
    const itId = `faqItem-stress-${n}-it`;
    const enId = `faqItem-stress-${n}-en`;
    await upsertDoc(client, itId, "faqItem", { question: itItem.q, answer: faqAnswer(itItem.a), language: "it" });
    await upsertDoc(client, enId, "faqItem", { question: enItem.q, answer: faqAnswer(enItem.a), language: "en" });
    await upsertTranslationMetadata(client, `faqItem-stress-${n}`, "faqItem", itId, enId);
    faqItIds.push(itId);
    faqEnIds.push(enId);
  }

  const recognitionItItems = recognitionIt.map((r, i) => ({
    _key: `recognition-it-${i}`,
    _type: "recognitionItem",
    quote: r.quote,
    label: r.label,
    isDraft: true,
  }));
  const recognitionEnItems = recognitionEn.map((r, i) => ({
    _key: `recognition-en-${i}`,
    _type: "recognitionItem",
    quote: r.quote,
    label: r.label,
    isDraft: true,
  }));

  await upsertDoc(client, "pillarPage-stress-it", "pillarPage", {
    title: "Stress e burnout",
    slug: { _type: "slug", current: "stress-e-burnout" },
    titleEmphasisWord: "burnout",
    heroKicker: "AREA DI INTERVENTO",
    standfirst: "Quando riposare non basta più, e la stanchezza è già lì al risveglio.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Donna seduta sul divano con le braccia incrociate sopra la testa, portatile aperto e tazza di caffè sul tavolino davanti a lei." },
    factsStrip: {
      items: [
        { label: "Durata", value: "45 minuti" },
        { label: "Modalità", value: "In studio e online" },
        { label: "Lingue", value: "Italiano e inglese" },
        { label: "Dove", value: "Milano, Monza, Cernusco sul Naviglio" },
      ],
    },
    recognition: {
      leadInOverride: "Modi in cui questa difficoltà viene descritta. Riconoscersi in uno di questi non significa avere un disturbo.",
      items: recognitionItItems,
    },
    faqItems: faqItIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyIt,
    seo: {
      metaTitle: "Stress e burnout — Psicoterapeuta a Milano e Monza",
      metaDescription: "Stress cronico, burnout lavorativo, esaurimento e sintomi fisici. Psicoterapia a Milano, Monza, Cernusco sul Naviglio e online.",
      noIndex: true,
    },
    language: "it",
  });

  await upsertDoc(client, "pillarPage-stress-en", "pillarPage", {
    title: "Stress and burnout",
    slug: { _type: "slug", current: "stress-and-burnout" },
    titleEmphasisWord: "burnout",
    heroKicker: "AREA OF WORK",
    standfirst: "When rest stops paying you back, and the tiredness is already there when you wake up.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Woman sitting on a sofa with her arms crossed above her head, an open laptop and a coffee cup on the table in front of her." },
    factsStrip: {
      items: [
        { label: "Length", value: "45 minutes" },
        { label: "Format", value: "In person and online" },
        { label: "Languages", value: "English and Italian" },
        { label: "Where", value: "Milan, Monza, Cernusco sul Naviglio" },
      ],
    },
    recognition: {
      leadInOverride: "Ways this difficulty gets described. Recognising yourself in one of them doesn't mean you have a disorder.",
      items: recognitionEnItems,
    },
    faqItems: faqEnIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyEn,
    seo: {
      metaTitle: "Stress & Burnout — Therapist in English, Milan",
      metaDescription: "Chronic stress, workplace burnout, exhaustion and physical symptoms. Italian psychotherapist working in English in Milan, Monza and online.",
      noIndex: true,
    },
    language: "en",
  });

  await upsertTranslationMetadata(client, "pillarPage-stress", "pillarPage", "pillarPage-stress-it", "pillarPage-stress-en");

  console.log("\n=== stress pillar: done ===");
}

main();
