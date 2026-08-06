import { createClient } from "@sanity/client";
import { h2, p, pBoldStart } from "./lib/portableText";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Pillar rollout — sexual difficulties. Source: contents/pillar-sessuali-bozza.md
// (IT+EN combined). Copy transcribed verbatim, no edits. All 6 recognition quotes
// (both locales) are direct one-to-one matches to this page's own H2 section
// titles, lifted verbatim — zero invention, high confidence. isDraft stays false
// throughout (quotes are Giuseppe's own, per the draft's own review note "Le sei
// frasi sono sue"). Two bold-lead paragraphs (medical-assessment callouts, repeated
// deliberately per the draft's own review note) use pBoldStart. No bracketed
// placeholders existed in this draft. noIndex: true throughout.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_ASSET = "image-384f8b6716efcff4a4c1240b717b339420458899-2000x1331-jpg";

const faqIt = [
  { q: "Devo fare prima una visita medica?", a: "Sì, se non è già stata fatta. Disfunzione erettile, calo del desiderio e dolore durante i rapporti hanno tutti cause organiche possibili, che vanno escluse da un medico prima o accanto al lavoro psicologico." },
  { q: "Devo raccontare tutto nel dettaglio?", a: "No. Servono le informazioni cliniche necessarie a capire il meccanismo, non un resoconto. Si procede al ritmo che è sostenibile." },
  { q: "Il partner deve venire?", a: "Non necessariamente. Molto del lavoro è individuale. In alcuni casi un incontro insieme è utile, ma si valuta, non si dà per scontato." },
  { q: "Si può lavorare online?", a: "Sì. Gli incontri online hanno la stessa durata e lo stesso costo di quelli in studio. Per alcune persone la distanza rende più facile affrontare questi temi." },
  { q: "Dove ricevi?", a: "In due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online." },
];

const faqEn = [
  { q: "Do I need to see a doctor first?", a: "Yes, if you haven't. Erectile difficulty, low desire and pain during sex all have possible physical causes that a doctor needs to rule out, before or alongside psychological work." },
  { q: "Do I have to describe everything in detail?", a: "No. What's needed is the clinical information required to understand the mechanism, not an account. We go at a pace that's sustainable." },
  { q: "Does my partner need to come?", a: "Not necessarily. Much of the work is individual. In some cases a joint session helps, but that's assessed rather than assumed." },
  { q: "Can this be done online?", a: "Yes. Online sessions run the same length and cost the same as those in person. For some people the distance makes these subjects easier to raise." },
  { q: "Where do you practise?", a: "Two practices in Milan, one in Monza and one in Cernusco sul Naviglio, plus online." },
];

const recognitionIt = [
  { quote: "Vorrei lasciarmi andare, ma il desiderio non parte. È come se qualcosa dentro fosse spento.", label: "Calo del desiderio" },
  { quote: "Più cerco di controllare l'erezione, più la perdo. E ho paura che succeda di nuovo.", label: "Disfunzione erettile" },
  { quote: "Più provo a resistere, meno riesco a farlo.", label: "Eiaculazione precoce" },
  { quote: "Più mi concentro, più sembra impossibile arrivare all'orgasmo.", label: "Eiaculazione ritardata" },
  { quote: "Vorrei vivere l'intimità con serenità, ma il mio corpo si irrigidisce prima di me perché ho paura di provare dolore.", label: "Dolore durante i rapporti" },
  { quote: "Vivo l'intimità come un esame da superare e, invece di godermi il momento, controllo continuamente se sto funzionando.", label: "Ansia da prestazione sessuale" },
];

const recognitionEn = [
  { quote: "I want to let go, but the desire doesn't start. It's as if something inside were switched off.", label: "Low desire" },
  { quote: "The more I try to control the erection, the more I lose it. And I'm afraid it will happen again.", label: "Erectile difficulty" },
  { quote: "The more I try to hold back, the less I can.", label: "Premature ejaculation" },
  { quote: "The more I concentrate, the more impossible it seems to reach orgasm.", label: "Delayed ejaculation" },
  { quote: "I want to experience intimacy calmly, but my body tenses before I do, because I'm afraid of pain.", label: "Pain during sex" },
  { quote: "I treat intimacy as an exam to pass and, instead of enjoying the moment, I keep checking whether I'm working properly.", label: "Sexual performance anxiety" },
];

const bodyIt = [
  h2("Disfunzioni sessuali: perché il controllo peggiora le cose"),
  p("C'è un tratto comune a quasi tutte le difficoltà sessuali, ed è controintuitivo: più si prova a governare la risposta, meno la risposta arriva."),
  p("L'eccitazione, l'erezione, il desiderio, l'orgasmo non sono azioni volontarie. Sono risposte che si producono quando l'attenzione è altrove — su chi si ha davanti, su quello che si sta facendo. Nel momento in cui l'attenzione si sposta sul funzionamento, la risposta si interrompe."),
  p("Da qui nasce quasi sempre il circolo. Un episodio va male. La volta dopo si arriva già in allerta, verificando. La verifica occupa esattamente lo spazio mentale che servirebbe alla risposta. L'episodio va male di nuovo, e ora c'è una prova."),
  h2("Ansia da prestazione sessuale"),
  p("È la forma più frequente, e quella che descrive meglio il meccanismo."),
  p("L'intimità diventa un esame. C'è un risultato atteso, c'è chi valuta — spesso solo nella propria testa — e c'è la paura di non essere all'altezza. In quelle condizioni il corpo fa esattamente quello che farebbe in qualsiasi situazione percepita come una prova: si attiva l'allarme, e l'allarme è incompatibile con l'eccitazione."),
  p("Non è una questione di volontà o di attrazione. Molte persone che ne soffrono desiderano il partner senza alcun dubbio: è proprio questo a rendere la cosa incomprensibile dall'interno."),
  h2("Disfunzione erettile e calo del desiderio"),
  p("Sono due difficoltà diverse e vanno distinte, anche se spesso arrivano insieme."),
  p("Nella disfunzione erettile il corpo non risponde come ci si aspetta, e il tentativo di controllare la risposta la rende meno probabile. Nel calo del desiderio non c'è un tentativo fallito: manca l'avvio, e questo produce spesso più senso di colpa che paura."),
  p("Il calo del desiderio raramente ha una sola causa. Contano lo stress prolungato, il sonno, la fase della relazione, i farmaci in corso, e quello che è successo intorno. Trattarlo come un problema solo sessuale spesso significa guardare nel posto sbagliato."),
  pBoldStart("Prima di tutto: la valutazione medica.", " La disfunzione erettile può avere cause vascolari, ormonali, metaboliche o farmacologiche. Il calo del desiderio anche. Un accertamento medico non è un passaggio burocratico: è il primo."),
  h2("Eiaculazione precoce e ritardata"),
  p("Anche qui il controllo è il centro della difficoltà, in due direzioni opposte."),
  p("Nell'eiaculazione precoce si prova a trattenere, e lo sforzo di trattenere aumenta l'attivazione. Nell'eiaculazione ritardata si prova a raggiungere, e lo sforzo di raggiungere sposta l'attenzione sul risultato invece che sulla sensazione."),
  p("Sono due esperienze diverse, ma il meccanismo che le mantiene è lo stesso: un'attenzione che sorveglia invece di partecipare."),
  h2("Dolore durante i rapporti"),
  p("Quando l'intimità è associata al dolore, il corpo impara ad anticiparlo. La tensione muscolare arriva prima del pensiero, e spesso prima del contatto."),
  p("Si crea un circolo particolarmente difficile: la paura del dolore produce tensione, la tensione produce dolore, il dolore conferma la paura."),
  pBoldStart("Anche qui la valutazione medica viene prima", ", e in questo caso è non negoziabile: il dolore durante i rapporti ha cause organiche possibili che vanno escluse da uno specialista prima di qualsiasi lavoro psicologico."),
  h2("Psicoterapia per le difficoltà sessuali a Milano, Monza e Cernusco"),
  p("Ricevo in due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Lavoro in italiano e in inglese."),
  p("Il primo incontro serve a capire di cosa stiamo parlando: da quanto tempo, in quali circostanze, se succede sempre o solo in certe situazioni, cosa è già stato fatto. È una conversazione clinica, non un interrogatorio, e non richiede di raccontare più di quello che si vuole raccontare."),
  p("Da lì il lavoro riguarda tre cose: capire il meccanismo specifico che mantiene la difficoltà, ridurre il ruolo della verifica e del controllo, e — dove c'è un partner — lavorare su come la difficoltà viene comunicata, perché il silenzio intorno a questi temi ne è quasi sempre una parte."),
  p("Molte di queste difficoltà hanno una componente ansiosa riconoscibile, e questo è il terreno su cui lavoro da anni."),
  h2("Quando ha senso chiedere aiuto"),
  p("— È già stata fatta una valutazione medica?"),
  p("— Sto evitando l'intimità per non trovarmi in quella situazione?"),
  p("— Controllo, durante, se sto funzionando?"),
  p("— Ne ho parlato con il partner, o ci giro intorno?"),
  p("Non serve che la difficoltà sia costante per parlarne."),
];

const bodyEn = [
  h2("Sexual difficulties: why trying to control makes it worse"),
  p("Almost all sexual difficulties share one counterintuitive feature: the harder you try to govern the response, the less the response arrives."),
  p("Arousal, erection, desire, orgasm are not voluntary actions. They're responses that occur when attention is elsewhere — on the person in front of you, on what you're doing. The moment attention moves onto whether it's working, the response stops."),
  p("That's where the cycle almost always begins. One occasion goes badly. The next time you arrive already alert, checking. The checking occupies exactly the mental space the response would need. It goes badly again — and now there's evidence."),
  h2("Sexual performance anxiety"),
  p("This is the most common form, and it describes the mechanism best."),
  p("Intimacy becomes an exam. There's an expected result, there's someone assessing — often only in your own head — and there's the fear of not measuring up. Under those conditions the body does what it would do in any situation read as a test: the alarm fires, and the alarm is incompatible with arousal."),
  p("It isn't a question of willingness or attraction. Many people experiencing it desire their partner without any doubt: that's exactly what makes it incomprehensible from the inside."),
  h2("Erectile difficulties and low desire"),
  p("These are two different problems and worth separating, even when they arrive together."),
  p("With erectile difficulty the body doesn't respond as expected, and trying to control the response makes it less likely. With low desire there's no failed attempt: the start is missing, and that tends to produce guilt rather than fear."),
  p("Low desire rarely has a single cause. Prolonged stress matters, sleep matters, the stage of the relationship matters, current medication matters, and so does whatever else is going on. Treating it as a purely sexual problem often means looking in the wrong place."),
  pBoldStart("First of all: medical assessment.", " Erectile difficulty can have vascular, hormonal, metabolic or medication-related causes. So can low desire. A medical examination isn't a formality here — it's the first step."),
  h2("Premature and delayed ejaculation"),
  p("Here too, control sits at the centre of the difficulty, in two opposite directions."),
  p("With premature ejaculation you try to hold back, and the effort of holding back increases arousal. With delayed ejaculation you try to arrive, and the effort of arriving moves attention onto the outcome rather than the sensation."),
  p("They're different experiences, but what maintains them is the same: attention that supervises instead of participating."),
  h2("Pain during sex"),
  p("When intimacy is associated with pain, the body learns to anticipate it. Muscular tension arrives before the thought, and often before contact."),
  p("A particularly difficult cycle forms: fear of pain produces tension, tension produces pain, pain confirms the fear."),
  pBoldStart("Here too, medical assessment comes first", ", and in this case it isn't negotiable: pain during sex has possible physical causes that a specialist needs to rule out before any psychological work."),
  h2("Therapy in English for sexual difficulties in Milan and Monza"),
  p("I'm an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy. I see people in two practices in Milan, in Monza and in Cernusco sul Naviglio, and online, in English and in Italian."),
  p("These are subjects many people find hard to raise at all — and harder still in a second language, with a clinician they've just met. That's part of why I work in English: not as an accommodation, but because the language you can describe something in determines whether you describe it."),
  p("The first session is about understanding what we're dealing with: how long, in what circumstances, whether it happens always or only sometimes, what's already been tried. It's a clinical conversation, not an interrogation, and it doesn't require telling more than you want to tell."),
  p("From there the work concerns three things: understanding the specific mechanism maintaining the difficulty, reducing the role of checking and control, and — where there's a partner — working on how the difficulty gets communicated, because the silence around these subjects is almost always part of them."),
  p("Many of these difficulties have a recognisable anxiety component, and that's the ground I've worked on for years."),
  h2("When it makes sense to ask for help"),
  p("— Has a medical assessment already been done?"),
  p("— Am I avoiding intimacy so as not to be in that situation?"),
  p("— Do I check, during, whether I'm working properly?"),
  p("— Have I talked to my partner about it, or am I going around it?"),
  p("The difficulty doesn't have to be constant for it to be worth discussing."),
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
    const itId = `faqItem-sessuali-${n}-it`;
    const enId = `faqItem-sessuali-${n}-en`;
    await upsertDoc(client, itId, "faqItem", { question: itItem.q, answer: faqAnswer(itItem.a), language: "it" });
    await upsertDoc(client, enId, "faqItem", { question: enItem.q, answer: faqAnswer(enItem.a), language: "en" });
    await upsertTranslationMetadata(client, `faqItem-sessuali-${n}`, "faqItem", itId, enId);
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

  await upsertDoc(client, "pillarPage-sessuali-it", "pillarPage", {
    title: "Disfunzioni sessuali",
    slug: { _type: "slug", current: "disfunzioni-sessuali" },
    titleEmphasisWord: "sessuali",
    heroKicker: "AREA DI INTERVENTO",
    standfirst: "Più si cerca di controllare una risposta del corpo, meno quella risposta arriva.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Camera da letto vuota con lenzuola gialle disfatte, tende leggere e luce del mattino che filtra dalla finestra." },
    factsStrip: {
      items: [
        { label: "Durata", value: "45 minuti" },
        { label: "Modalità", value: "In studio e online" },
        { label: "Lingue", value: "Italiano e inglese" },
        { label: "Dove", value: "Milano, Monza, Cernusco sul Naviglio" },
      ],
    },
    recognition: { items: recognitionItItems },
    faqItems: faqItIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyIt,
    seo: {
      metaTitle: "Disfunzioni sessuali — Psicoterapeuta a Milano e Monza",
      metaDescription: "Ansia da prestazione, disfunzione erettile, calo del desiderio, dolore. Psicoterapia a Milano, Monza, Cernusco sul Naviglio e online.",
      noIndex: true,
    },
    language: "it",
  });

  await upsertDoc(client, "pillarPage-sessuali-en", "pillarPage", {
    title: "Sexual difficulties",
    slug: { _type: "slug", current: "sexual-difficulties" },
    titleEmphasisWord: "difficulties",
    heroKicker: "AREA OF WORK",
    standfirst: "The harder you try to control a bodily response, the less it arrives.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Empty bedroom with rumpled yellow bedding, sheer curtains, and morning light coming through the window." },
    factsStrip: {
      items: [
        { label: "Length", value: "45 minutes" },
        { label: "Format", value: "In person and online" },
        { label: "Languages", value: "English and Italian" },
        { label: "Where", value: "Milan, Monza, Cernusco sul Naviglio" },
      ],
    },
    recognition: { items: recognitionEnItems },
    faqItems: faqEnIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyEn,
    seo: {
      metaTitle: "Sexual Difficulties — Therapist in English, Milan",
      metaDescription: "Performance anxiety, erectile difficulties, low desire, pain. Italian psychotherapist working in English in Milan, Monza and online.",
      noIndex: true,
    },
    language: "en",
  });

  await upsertTranslationMetadata(client, "pillarPage-sessuali", "pillarPage", "pillarPage-sessuali-it", "pillarPage-sessuali-en");

  console.log("\n=== sessuali pillar: done ===");
}

main();
