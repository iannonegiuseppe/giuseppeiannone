import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

// --- Portable text builders --------------------------------------------
let keySeq = 0;
function key(prefix: string) {
  keySeq += 1;
  return `${prefix}-${keySeq}`;
}

function h2(text: string) {
  return {
    _key: key("blk"),
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: key("span"), _type: "span", marks: [], text }],
  };
}

type Part = { text: string; mark?: "strong" | "em" };

function p(...parts: (string | Part)[]) {
  const children = parts.map((part) => {
    const isPlain = typeof part === "string";
    const text = isPlain ? part : part.text;
    const marks = isPlain ? [] : part.mark ? [part.mark] : [];
    return { _key: key("span"), _type: "span", marks, text };
  });
  return { _key: key("blk"), _type: "block", style: "normal", markDefs: [], children };
}

// --- IT body -------------------------------------------------------------
const bodyIt = [
  h2("Cos'è l'ansia"),
  p("L'ansia non è un difetto. È una funzione."),
  p(
    "Serve ad anticipare: prepara il corpo e la mente a qualcosa che potrebbe succedere. Il battito accelera, i muscoli si tendono, l'attenzione si restringe su ciò che conta. È un sistema antico e, quando funziona come dovrebbe, è utile — è quello che ti fa controllare due volte prima di attraversare, o preparare bene un colloquio importante.",
  ),
  p(
    "Il problema non è l'ansia. Il problema è quando resta accesa in assenza di qualcosa da cui difendersi, e quando comincia a restringere quello che fai.",
  ),
  p(
    "La differenza tra un'ansia normale e un disturbo d'ansia non sta nell'intensità di quello che senti. Sta in tre cose: quanto dura, quanto occupa spazio nella giornata, e quante cose hai smesso di fare per non sentirla.",
  ),
  p(
    "Una persona può convivere per anni con un livello di ansia alto senza pensare che sia un problema, semplicemente perché ha organizzato la propria vita intorno ad essa: evita certi posti, rimanda certe decisioni, sceglie il percorso più lungo. L'ansia non si è ridotta. Si è solo fatta spazio.",
  ),

  h2("Come si manifesta"),
  p("L'ansia si presenta su tre piani contemporaneamente, e spesso ci si accorge solo di uno."),
  p(
    { text: "Nel corpo.", mark: "strong" },
    " Tensione muscolare, soprattutto collo, spalle e mascella. Difficoltà a respirare a fondo. Battito accelerato. Disturbi gastrointestinali. Sudorazione. Vertigini o sensazione di testa leggera. Difficoltà ad addormentarsi o risvegli notturni. Stanchezza che non passa con il riposo.",
  ),
  p(
    "Molte persone arrivano in studio dopo aver fatto esami che non hanno trovato nulla. Non significa che i sintomi non ci fossero: significa che il corpo stava rispondendo a qualcosa che non era una malattia.",
  ),
  p(
    { text: "Nei pensieri.", mark: "strong" },
    " Preoccupazioni che si ripresentano nonostante tu sappia che sono sproporzionate. Anticipazione: la mente costruisce lo scenario peggiore prima che accada qualsiasi cosa. Difficoltà a concentrarsi, perché una parte dell'attenzione è sempre impegnata altrove. Bisogno di rassicurazione, che funziona per poco e poi va rinnovato.",
  ),
  p(
    { text: "Nei comportamenti.", mark: "strong" },
    " L'evitamento è il segnale più affidabile. Non prendere l'autostrada, non andare a quella cena, non candidarsi per quel ruolo, controllare il telefono, controllare il corpo, chiedere conferme. Ogni evitamento riduce l'ansia sul momento — ed è proprio per questo che si ripete.",
  ),

  h2("Perché l'ansia si mantiene"),
  p("C'è un meccanismo che riconosco quasi sempre, in forme diverse."),
  p(
    "Una sensazione viene interpretata come segnale di pericolo. Il corpo risponde come se il pericolo fosse reale. Quella risposta — il cuore che accelera, il respiro corto — diventa la prova che il pericolo c'era davvero.",
  ),
  p(
    "Poi arriva l'evitamento, e con l'evitamento arriva il sollievo. Il sollievo è immediato e concreto, e insegna una cosa precisa: ",
    { text: "ho evitato, e non è successo niente", mark: "em" },
    ". Ma la conclusione che il cervello ne trae non è «non c'era pericolo». È «ho fatto bene a evitare».",
  ),
  p("Così il campo si restringe. Non per una decisione, ma per una serie di piccole scelte ragionevoli prese una alla volta."),
  p(
    "Lo stesso vale per il controllo. Controllare il corpo, i sintomi, i messaggi, gli esami: ogni controllo abbassa l'ansia per qualche minuto e la rialza subito dopo, perché una verifica ne chiama un'altra.",
  ),
  p(
    "Non c'è una causa unica dei disturbi d'ansia. Contano la predisposizione individuale, la storia personale, i periodi di stress prolungato, e il modo in cui si è imparato a leggere i segnali del proprio corpo. Ma il modo in cui l'ansia ",
    { text: "si mantiene", mark: "em" },
    " è spesso più accessibile della sua origine — ed è da lì che si può cominciare a lavorare.",
  ),

  h2("Come lavoro con l'ansia"),
  p(
    "Il primo incontro serve a capire di cosa stiamo parlando. Non è un test e non è un impegno a proseguire: è una conversazione in cui mi racconti cosa succede, da quanto, e cosa hai già provato a fare.",
  ),
  p("Da lì il lavoro procede su due binari."),
  p(
    "Il primo è capire il meccanismo — non l'ansia in generale, ma il tuo. Quali situazioni la attivano, quali interpretazioni la alimentano, quali strategie la stanno mantenendo senza che tu te ne accorga. Molte persone scoprono in questa fase che quello che facevano per gestire l'ansia era parte di ciò che la teneva viva.",
  ),
  p(
    "Il secondo è il lavoro sulle situazioni concrete, con gradualità e in accordo. Non si tratta di affrontare di colpo quello che si evita, ma di ricostruire margine dove il campo si era ristretto.",
  ),
  p("Lavoro anche con il corpo, perché nell'ansia il corpo non è un accessorio: è dove la cosa accade per prima."),
  p(
    "Ho studiato Neuroscienze Cognitive e Cliniche all'Università di Maastricht e ho lavorato come ricercatore proprio sui meccanismi dell'ansia e del panico, prima di specializzarmi in psicoterapia. È il motivo per cui il modo in cui il corpo produce e mantiene l'ansia è al centro di come lavoro.",
  ),

  h2("Quando ha senso chiedere aiuto"),
  p("Non esiste una soglia di gravità da superare per avere diritto a chiedere."),
  p("Le domande più utili non sono «è abbastanza grave?», ma:"),
  p("— Quante cose ho smesso di fare per non sentire ansia?"),
  p("— Da quanto tempo va avanti?"),
  p("— Le persone vicine se ne sono accorte?"),
  p("— Quanto della mia giornata è occupato dal gestirla?"),
  p(
    "Se la risposta a una di queste ti mette a disagio, è un motivo sufficiente per parlarne. Non serve aspettare che peggiori, e non serve avere già capito cosa dire: il primo colloquio esiste anche per quello.",
  ),
];

// --- EN body -------------------------------------------------------------
const bodyEn = [
  h2("What anxiety is"),
  p("Anxiety isn't a flaw. It's a function."),
  p(
    "Its job is to anticipate: it prepares the body and mind for something that might happen. The heart speeds up, the muscles tighten, attention narrows to what matters. It's an old system, and when it works as it should it's useful — it's what makes you check twice before crossing, or prepare properly for an interview.",
  ),
  p(
    "The problem isn't anxiety. The problem is when it stays switched on with nothing to defend against, and when it starts narrowing what you do.",
  ),
  p(
    "The difference between ordinary anxiety and an anxiety disorder isn't the intensity of what you feel. It's three other things: how long it lasts, how much of the day it occupies, and how many things you've stopped doing in order not to feel it.",
  ),
  p(
    "Someone can live for years with a high level of anxiety without thinking of it as a problem, simply because they've organised their life around it: avoiding certain places, postponing certain decisions, taking the longer route. The anxiety hasn't decreased. It has just been given room.",
  ),

  h2("How it shows up"),
  p("Anxiety appears on three levels at once, and often only one of them gets noticed."),
  p(
    { text: "In the body.", mark: "strong" },
    " Muscle tension, especially the neck, shoulders and jaw. Difficulty breathing deeply. A racing heart. Digestive problems. Sweating. Dizziness or light-headedness. Trouble falling asleep, or waking in the night. Tiredness that rest doesn't fix.",
  ),
  p(
    "Many people come to see me after medical tests that found nothing. That doesn't mean the symptoms weren't there: it means the body was responding to something that wasn't an illness.",
  ),
  p(
    { text: "In thought.", mark: "strong" },
    " Worries that keep returning even when you know they're out of proportion. Anticipation: the mind builds the worst-case scenario before anything has happened. Difficulty concentrating, because part of your attention is always somewhere else. A need for reassurance that works briefly and then has to be renewed.",
  ),
  p(
    { text: "In behaviour.", mark: "strong" },
    " Avoidance is the most reliable signal. Not taking the motorway, not going to that dinner, not applying for that role, checking your phone, checking your body, asking for reassurance. Every avoidance reduces the anxiety in the moment — which is exactly why it repeats.",
  ),

  h2("Why anxiety keeps itself going"),
  p("There's a mechanism I recognise almost every time, in different forms."),
  p(
    "A sensation gets read as a signal of danger. The body responds as though the danger were real. That response — the racing heart, the short breath — then becomes the evidence that the danger was there.",
  ),
  p(
    "Then comes avoidance, and with avoidance comes relief. The relief is immediate and concrete, and it teaches something specific: ",
    { text: "I avoided it, and nothing happened.", mark: "em" },
    " But the conclusion the brain draws isn't \"there was no danger.\" It's \"I was right to avoid it.\"",
  ),
  p("So the field narrows. Not through a decision, but through a series of small reasonable choices made one at a time."),
  p(
    "The same applies to control. Checking your body, your symptoms, your messages, your test results: each check lowers the anxiety for a few minutes and raises it again straight after, because one verification calls for the next.",
  ),
  p(
    "There is no single cause of anxiety disorders. Individual predisposition matters, personal history matters, prolonged periods of stress matter, and so does the way you learned to read your body's signals. But how anxiety ",
    { text: "sustains itself", mark: "em" },
    " is usually more accessible than where it came from — and that's where the work can start.",
  ),

  h2("Anxiety and moving country"),
  p("A large part of the people I see in English didn't grow up in Italy."),
  p(
    "Relocation puts pressure on the things that usually hold anxiety in check. The support network is somewhere else, often in another time zone. Ordinary tasks — a doctor's appointment, a bank, a lease — take more effort in a second language. Work identity may have shifted. And the people who would normally notice that something is wrong aren't in the room.",
  ),
  p(
    "This shows up in a few recognisable ways: anxiety that started after the move and was put down to adjustment; a partner's family becoming the entire social world; the sense that going home would be an admission of failure; symptoms that appear physical and get investigated medically for months.",
  ),
  p("None of this makes anxiety different in kind. But it changes what maintains it, and that's worth naming rather than working around."),

  h2("How I work with anxiety"),
  p(
    "The first session is about understanding what we're dealing with. It isn't a test and it isn't a commitment to continue: it's a conversation in which you tell me what happens, how long it's been going on, and what you've already tried.",
  ),
  p("From there the work runs on two tracks."),
  p(
    "The first is understanding the mechanism — not anxiety in general, but yours. Which situations set it off, which interpretations feed it, which strategies are keeping it going without your noticing. Many people discover at this stage that what they were doing to manage the anxiety was part of what kept it alive.",
  ),
  p(
    "The second is working on the concrete situations, gradually and by agreement. It isn't about facing everything you avoid at once, but about rebuilding room where the field had narrowed.",
  ),
  p("I also work with the body, because in anxiety the body isn't an accessory: it's where the thing happens first."),
  p(
    "I studied Cognitive and Clinical Neuroscience at Maastricht University and worked as a researcher on the mechanisms of anxiety and panic before training as a psychotherapist. That's why how the body produces and maintains anxiety is central to how I work.",
  ),

  h2("Working in English, in Italy"),
  p(
    "I'm an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy, and I work in both English and Italian.",
  ),
  p(
    "I see people in person at two practices in Milan, in Monza, and in Cernusco sul Naviglio, and online across Italy and beyond. Working in English isn't an accommodation here: I studied and worked abroad, and a real part of my practice has always been with people who moved to Milan from elsewhere — expats, people who relocated for work, partners of Italians, students, people who arrived for a year and stayed.",
  ),
  p("If Italian isn't the language you'd choose to describe what's happening to you, that matters. Anxiety is hard enough to put into words in your own language."),

  h2("When it makes sense to ask for help"),
  p("There's no threshold of severity you have to cross before you're allowed to ask."),
  p("The more useful questions aren't \"is it bad enough?\" but:"),
  p("— How many things have I stopped doing in order not to feel anxious?"),
  p("— How long has this been going on?"),
  p("— Have the people close to me noticed?"),
  p("— How much of my day goes into managing it?"),
  p(
    "If any of those makes you uncomfortable to answer, that's reason enough to talk about it. You don't need to wait for it to get worse, and you don't need to have worked out what to say: the first session exists partly for that.",
  ),
];

// --- Facts strip -----------------------------------------------------------
const factsStripIt = {
  items: [
    { label: "Durata", value: "45 minuti" },
    { label: "Modalità", value: "In studio e online" },
    { label: "Lingue", value: "Italiano e inglese" },
    { label: "Dove", value: "Milano, Monza, Cernusco sul Naviglio" },
  ],
};
const factsStripEn = {
  items: [
    { label: "Length", value: "45 minutes" },
    { label: "Format", value: "In person and online" },
    { label: "Languages", value: "English and Italian" },
    { label: "Where", value: "Milan, Monza, Cernusco sul Naviglio" },
  ],
};

// --- Recognition (quotation text only — labels reported separately, not imported) ---
const recognitionIt = {
  items: [
    "Non riesco a smettere di preoccuparmi, anche quando so che sto esagerando.",
    "Ho sentito il cuore battere forte, mi mancava il fiato e ho avuto paura di stare per morire.",
    "Non ho paura solo dell'attacco di panico. Ho paura del prossimo.",
    "Ho paura di sentirmi male lontano da casa.",
    "Appena la porta in metro o in aereo si chiude sento di non avere più aria. Non è il posto chiuso. È l'idea di sentirmi male e non poter uscire.",
    "Evito le persone per non sentirmi giudicato e ho paura di fare una figuraccia anche nelle situazioni più normali.",
    "Vivo controllando continuamente il mio corpo per paura delle malattie.",
    "Gli esami dicono che va tutto bene. Ma ogni sintomo mi fa pensare alla malattia peggiore.",
    "Prima di qualsiasi evento mi preoccupo di quello che di negativo potrebbe succedere.",
    "Ho paura di non essere abbastanza o di non fare bene.",
    "Quando non risponde ai messaggi sento subito un vuoto e penso che voglia abbandonarmi.",
    "Ho il terrore di vomitare o di strozzarmi ed evito cibi, luoghi e persone.",
    "Anche se sono stanco, la mia testa non va mai a dormire. E appena spengo la luce iniziano i pensieri negativi.",
  ],
};
const recognitionEn = {
  items: [
    "I can't stop worrying, even when I know I'm overdoing it.",
    "My heart was pounding, I couldn't breathe, and I was afraid I was about to die.",
    "It's not the panic attack I'm afraid of. It's the next one.",
    "I'm afraid of feeling unwell far from home.",
    "The moment the metro doors or the aircraft doors close, I feel like there's no air. It isn't the enclosed space. It's the idea of feeling unwell and not being able to leave.",
    "I avoid people so I won't feel judged, and I'm afraid of embarrassing myself even in ordinary situations.",
    "I check my body constantly, afraid of illness.",
    "The tests say everything is fine. But every symptom makes me think of the worst possible illness.",
    "Before anything happens, I'm already worrying about what could go wrong.",
    "I'm afraid of not being enough, or of not doing well enough.",
    "When they don't reply, I feel an immediate emptiness and think they want to leave me.",
    "I'm terrified of vomiting or choking, and I avoid foods, places and people because of it.",
    "Even when I'm exhausted, my head never goes to sleep. The moment I turn off the light, the thoughts start.",
  ],
};

const subtopicLabelsIt = [
  "Ansia generalizzata", "Attacco di panico", "Disturbo di panico", "Agorafobia", "Claustrofobia",
  "Ansia sociale", "Ansia da malattia", "Ipocondria", "Ansia anticipatoria", "Ansia da prestazione",
  "Ansia da separazione", "Emetofobia", "Insonnia da ansia",
];
const subtopicLabelsEn = [
  "Generalised anxiety", "Panic attack", "Panic disorder", "Agoraphobia", "Claustrophobia",
  "Social anxiety", "Health anxiety", "Hypochondria", "Anticipatory anxiety", "Performance anxiety",
  "Separation anxiety", "Emetophobia", "Anxiety-related insomnia",
];

// --- FAQ -------------------------------------------------------------------
const faqIt = [
  {
    q: "Come funziona il primo colloquio?",
    a: "È un incontro di 45 minuti in cui mi racconti cosa succede. Serve a capire la richiesta e a valutare insieme se e come proseguire. Non comporta impegno a continuare.",
  },
  {
    q: "Perché il primo colloquio non è gratuito?",
    a: "Perché è già un incontro clinico, non una presentazione commerciale. Il tempo, l'ascolto e la valutazione sono gli stessi di qualsiasi altra seduta.",
  },
  {
    q: "Si può lavorare sull'ansia online?",
    a: "Sì. Gli incontri online hanno la stessa durata e lo stesso costo di quelli in studio. Per alcune persone è la modalità che rende possibile iniziare, per esempio quando l'ansia rende difficile spostarsi.",
  },
  {
    q: "Devo prendere farmaci?",
    a: "Non sono un medico e non prescrivo farmaci. La psicoterapia può essere svolta con o senza terapia farmacologica; quando è già in corso, o quando emerge che potrebbe essere utile valutarla, lavoro in raccordo con il medico curante o lo psichiatra.",
  },
  {
    q: "Come faccio a sapere se è ansia o un problema fisico?",
    a: "La valutazione medica viene prima. Se non l'hai ancora fatta, è il primo passo. Molti sintomi dell'ansia sono corporei, e distinguere richiede un accertamento medico, non un'interpretazione psicologica.",
  },
  {
    q: "Devo sapere cosa dire al primo incontro?",
    a: "No. È abbastanza comune arrivare senza sapere da dove cominciare. Le domande le faccio io.",
  },
];
const faqEn = [
  {
    q: "How does the first session work?",
    a: "It's a 45-minute meeting where you tell me what's going on. It's there to understand what you're asking for and to work out together whether and how to continue. It doesn't commit you to carrying on.",
  },
  {
    q: "Why isn't the first session free?",
    a: "Because it's already clinical work, not a sales meeting. The time, the listening and the assessment are the same as in any other session.",
  },
  {
    q: "Can this be done online?",
    a: "Yes. Online sessions run the same length and cost the same as those in person. For some people it's what makes starting possible at all — for instance when anxiety makes travelling difficult, or when you're not in Milan.",
  },
  {
    q: "Do I need medication?",
    a: "I'm not a medical doctor and I don't prescribe. Psychotherapy can be done with or without medication; where medication is already in place, or where it emerges that it might be worth considering, I work alongside your GP or psychiatrist.",
  },
  {
    q: "How do I know whether it's anxiety or something physical?",
    a: "Medical assessment comes first. If you haven't had one, that's the first step. Many symptoms of anxiety are physical, and telling them apart takes a medical examination, not a psychological interpretation.",
  },
  {
    q: "Do I need to know what to say in the first session?",
    a: "No. Arriving without knowing where to start is common. I'll ask the questions.",
  },
];

const heroKickerIt = "AREA DI INTERVENTO";
const heroKickerEn = "AREA OF WORK";
const titleIt = "Ansia e disturbi d'ansia";
const titleEmphasisWordIt = "d'ansia";
const titleEn = "Anxiety and anxiety disorders";
const titleEmphasisWordEn = "disorders";
const standfirstIt =
  "Quando la preoccupazione smette di essere occasionale e comincia a decidere cosa fai, dove vai e cosa eviti.";
const standfirstEn =
  "When worry stops being occasional and starts deciding what you do, where you go, and what you avoid.";

const altIt =
  "Donna seduta su un divano chiaro, ginocchia strette al petto e viso in parte coperto dalle mani, con lo sguardo teso rivolto di lato.";
const altEn =
  "A woman sitting on a light-coloured sofa with her knees drawn up, hands partly covering her face, looking tensely to one side.";

const seoIt = {
  metaTitle: "Ansia e disturbi d'ansia — Psicologo a Milano e Monza",
  metaDescription:
    "Come si riconosce un disturbo d'ansia, come si mantiene e come si lavora in psicoterapia. Studi a Milano, Monza, Cernusco sul Naviglio e online.",
};
const seoEn = {
  metaTitle: "Anxiety Disorders — English-Speaking Therapist in Milan",
  metaDescription:
    "How anxiety disorders show up, what keeps them going, and how the work is done. Italian psychotherapist working in English in Milan, Monza and online.",
};

async function main() {
  console.log("=== SEO character counts ===");
  console.log(`IT metaTitle: ${seoIt.metaTitle.length} chars`);
  console.log(`IT metaDescription: ${seoIt.metaDescription.length} chars`);
  console.log(`EN metaTitle: ${seoEn.metaTitle.length} chars`);
  console.log(`EN metaDescription: ${seoEn.metaDescription.length} chars`);

  // --- Upload the illustration once, reused by both locale documents.
  // Idempotent: reuses an existing asset with the same filename instead of
  // re-uploading on a re-run.
  const existingAsset = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == "anxiety-hero.jpg"][0]{_id, metadata}`,
  );
  let asset: { _id: string; metadata?: { dimensions?: unknown } };
  if (existingAsset) {
    asset = existingAsset;
    console.log("\nReusing existing heroImage asset:", asset._id, asset.metadata?.dimensions);
  } else {
    const imageBuffer = readFileSync("contents/anxiety.jpg");
    asset = await client.assets.upload("image", imageBuffer, { filename: "anxiety-hero.jpg" });
    console.log("\nUploaded heroImage asset:", asset._id, asset.metadata?.dimensions);
  }

  // --- FAQ items: repurpose faqItem-1/2/3 (Q1-3), create faqItem-4/5/6 (Q4-6) ---
  const faqItemIds: Record<"it" | "en", string[]> = { it: [], en: [] };

  for (const locale of ["it", "en"] as const) {
    const faqs = locale === "it" ? faqIt : faqEn;
    for (let i = 0; i < faqs.length; i++) {
      const n = i + 1;
      const id = `faqItem-${n}-${locale}`;
      const faq = faqs[i];
      if (!faq) continue;
      const before = await client.fetch(`*[_id == $id][0]{question, "answerText": answer[0].children[0].text}`, { id });

      const answerBlock = {
        _key: key("faq-answer"),
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [{ _key: key("faq-answer-span"), _type: "span", marks: [], text: faq.a }],
      };

      if (n <= 3) {
        // Existing placeholder doc — repurpose (patch.set, not delete/recreate)
        await client
          .patch(id)
          .set({ question: faq.q, answer: [answerBlock] })
          .commit();
        console.log(`\n${id} (repurposed existing doc)`);
      } else {
        // New doc — createIfNotExists, then patch.set (idempotent on re-run)
        await client.createIfNotExists({
          _id: id,
          _type: "faqItem",
          language: locale,
          question: faq.q,
          answer: [answerBlock],
        });
        await client.patch(id).set({ question: faq.q, answer: [answerBlock] }).commit();
        console.log(`\n${id} (new doc, createIfNotExists + patch.set)`);

        // Matching translation.metadata pairing, same shape as the existing
        // faqItem-1..3 ones — only created once both locales' docs exist.
      }
      console.log("  before:", JSON.stringify(before));
      console.log("  after: ", JSON.stringify({ question: faq.q, answerText: faq.a }));
      faqItemIds[locale].push(id);
    }
  }

  // translation.metadata for the 3 new pairs (faqItem-4/5/6)
  for (let i = 3; i < 6; i++) {
    const n = i + 1;
    const metaId = `translation.metadata.faqItem-${n}`;
    await client.createIfNotExists({
      _id: metaId,
      _type: "translation.metadata",
      schemaTypes: ["faqItem"],
      translations: [
        {
          _key: "it",
          _type: "internationalizedArrayReferenceValue",
          language: "it",
          value: { _type: "reference", _ref: `faqItem-${n}-it` },
        },
        {
          _key: "en",
          _type: "internationalizedArrayReferenceValue",
          language: "en",
          value: { _type: "reference", _ref: `faqItem-${n}-en` },
        },
      ],
    });
    console.log(`\n${metaId} (createIfNotExists)`);
  }

  // --- Patch the two pillarPage documents ---
  for (const locale of ["it", "en"] as const) {
    const docId = `pillarPage-anxiety-${locale}`;
    const before = await client.fetch(
      `*[_id == $docId][0]{title, heroKicker, standfirst, titleEmphasisWord, factsStrip, recognition, faqItems, relatedArticles, seo, "bodyLength": length(body), "heroImageSet": defined(heroImage)}`,
      { docId },
    );
    console.log(`\n=== ${docId} — BEFORE ===`);
    console.log(JSON.stringify(before, null, 2));

    const patchDoc = {
      title: locale === "it" ? titleIt : titleEn,
      titleEmphasisWord: locale === "it" ? titleEmphasisWordIt : titleEmphasisWordEn,
      heroKicker: locale === "it" ? heroKickerIt : heroKickerEn,
      standfirst: locale === "it" ? standfirstIt : standfirstEn,
      heroImage: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: locale === "it" ? altIt : altEn,
      },
      factsStrip: locale === "it" ? factsStripIt : factsStripEn,
      recognition: locale === "it" ? recognitionIt : recognitionEn,
      faqItems: faqItemIds[locale].map((id, i) => ({
        _key: `faq-ref-${i}`,
        _type: "reference",
        _ref: id,
      })),
      body: locale === "it" ? bodyIt : bodyEn,
    };

    // seo.metaTitle/metaDescription set via dotted paths, NOT a whole-object
    // "seo: {...}" replacement — a real bug caught live the first time this
    // ran: `.set({ seo: seoIt })` replaced the ENTIRE seo object, silently
    // wiping seo.noIndex (true -> null) since seoIt only carries
    // metaTitle/metaDescription. Fixed immediately after (a corrective
    // `"seo.noIndex": true` patch, verified) but the bug is fixed here too
    // so a future re-run of this script can't reintroduce it.
    const seoPatch = locale === "it" ? seoIt : seoEn;
    await client
      .patch(docId)
      .set({
        ...patchDoc,
        "seo.metaTitle": seoPatch.metaTitle,
        "seo.metaDescription": seoPatch.metaDescription,
      })
      .commit();

    const after = await client.fetch(
      `*[_id == $docId][0]{title, heroKicker, standfirst, titleEmphasisWord, factsStrip, recognition, faqItems, relatedArticles, seo, "bodyLength": length(body), "heroImageSet": defined(heroImage), slug, "noIndex": seo.noIndex, medicalEntityType}`,
      { docId },
    );
    console.log(`\n=== ${docId} — AFTER ===`);
    console.log(JSON.stringify(after, null, 2));
  }

  console.log("\n=== Subtopic labels (IT) ===");
  subtopicLabelsIt.forEach((l, i) => console.log(`${i + 1}. ${l}`));
  console.log("\n=== Subtopic labels (EN) ===");
  subtopicLabelsEn.forEach((l, i) => console.log(`${i + 1}. ${l}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
