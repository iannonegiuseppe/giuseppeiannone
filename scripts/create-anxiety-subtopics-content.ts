import { createClient } from "@sanity/client";

// Three new anxiety subtopics pass — creates 18 faqItem documents, 6
// subtopicPage documents, and appends 3 recognition items (isDraft: true)
// to the anxiety pillar in both locales. Copy is verbatim from
// contents/subtopic-ansia-tre.md — not rephrased, not translated, not
// punctuation-corrected. createIfNotExists for new documents (idempotent,
// first-time creation); patch().insert() for the recognition append
// (preserves every existing item's _key and position, never a whole-array
// .set()).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

interface Section {
  heading: string;
  paragraphs: string[];
}

// Mirrors the exact key convention observed live on subtopicPage-ansia-sociale-*:
// block key "blk-N", its single span child "span-N+1", counter advancing by 2
// per block (heading block counts as one block, same as a paragraph block).
function buildBody(sections: Section[]) {
  const blocks: unknown[] = [];
  let counter = 1;
  for (const section of sections) {
    blocks.push({
      _key: `blk-${counter}`,
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _key: `span-${counter + 1}`, _type: "span", marks: [], text: section.heading }],
    });
    counter += 2;
    for (const p of section.paragraphs) {
      blocks.push({
        _key: `blk-${counter}`,
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [{ _key: `span-${counter + 1}`, _type: "span", marks: [], text: p }],
      });
      counter += 2;
    }
  }
  return blocks;
}

// Mirrors the exact shape observed live on faqItem-ansia-sociale-*-*: a
// single "normal" block, key "faq-answer-1" / span "faq-answer-span-1".
function buildAnswer(text: string) {
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

function faqItemDoc(id: string, language: "it" | "en", question: string, answerText: string) {
  return {
    _id: id,
    _type: "faqItem",
    language,
    question,
    answer: buildAnswer(answerText),
  };
}

// === FAQ items ============================================================

const faqItems = [
  // --- 1. Ansia da prestazione / Performance anxiety ---
  faqItemDoc(
    "faqItem-prestazione-1-it",
    "it",
    "È solo mancanza di preparazione?",
    "No, e spesso è il contrario: molte persone che arrivano si erano preparate più del necessario. Il vuoto durante la prova non riguarda il materiale, riguarda le risorse cognitive impegnate a monitorare l'andamento invece che a recuperare l'informazione. Per questo studiare ancora di più, da solo, di solito non sposta il problema.",
  ),
  faqItemDoc(
    "faqItem-prestazione-1-en",
    "en",
    "Is it just a lack of preparation?",
    "No, and often the opposite: many people who come had prepared more than they needed to. The blank during the test is not about the material — it is about cognitive resources being spent on monitoring how it is going rather than on retrieving what you know. Which is why studying still harder, on your own, usually does not shift it.",
  ),
  faqItemDoc(
    "faqItem-prestazione-2-it",
    "it",
    "Serve una valutazione medica?",
    "Se i sintomi fisici sono intensi o compaiono anche fuori dalle situazioni di prestazione, sì. Tachicardia, respiro corto e vertigini hanno cause organiche possibili che vanno escluse da un medico. Quando gli accertamenti sono stati fatti e i sintomi restano legati a quelle situazioni, il lavoro psicologico ha un oggetto chiaro.",
  ),
  faqItemDoc(
    "faqItem-prestazione-2-en",
    "en",
    "Do I need a medical assessment?",
    "If the physical symptoms are intense, or appear outside performance situations too, then yes. A racing heart, shortness of breath and dizziness have possible organic causes that a doctor needs to rule out. Once that has been done and the symptoms remain tied to those situations, the psychological work has a clear object.",
  ),
  faqItemDoc(
    "faqItem-prestazione-3-it",
    "it",
    "Non passa con l'esperienza?",
    "A volte sì, quando la ripetizione permette di verificare che l'esito temuto non arriva. Ma se durante ogni prova l'attenzione resta rivolta a te, la ripetizione conferma il meccanismo invece di smontarlo — e dopo anni di esperienza la difficoltà può essere identica al primo giorno.",
  ),
  faqItemDoc(
    "faqItem-prestazione-3-en",
    "en",
    "Doesn't it fade with experience?",
    "Sometimes, when repetition allows you to see that the feared outcome does not arrive. But if attention stays turned on yourself throughout each attempt, repetition confirms the mechanism rather than dismantling it — and after years of experience the difficulty can be exactly what it was on the first day.",
  ),

  // --- 2. Ansia nelle relazioni / Anxiety in relationships ---
  faqItemDoc(
    "faqItem-relazioni-ansia-1-it",
    "it",
    "È gelosia?",
    "Non necessariamente. La gelosia riguarda un terzo; qui il timore è che il legame si interrompa, e un terzo può non esserci affatto. A volte le due cose si sovrappongono, ma il meccanismo su cui si lavora — la ricerca di certezza attraverso la verifica — è lo stesso in entrambi i casi.",
  ),
  faqItemDoc(
    "faqItem-relazioni-ansia-1-en",
    "en",
    "Is this jealousy?",
    "Not necessarily. Jealousy involves a third person; here the fear is that the bond will break, and there may be no third person at all. The two sometimes overlap, but the mechanism being worked on — seeking certainty through checking — is the same either way.",
  ),
  faqItemDoc(
    "faqItem-relazioni-ansia-2-it",
    "it",
    "Il partner deve venire?",
    "No. Il lavoro è individuale e riguarda il tuo modo di stare in relazione. In alcuni casi, quando la difficoltà si è organizzata attorno alla coppia, un percorso a due ha senso — ma è una valutazione a sé, e la terapia di coppia è un altro tipo di lavoro.",
  ),
  faqItemDoc(
    "faqItem-relazioni-ansia-2-en",
    "en",
    "Does my partner have to come?",
    "No. The work is individual and concerns your own way of being in a relationship. In some cases, where the difficulty has organised itself around the couple, working as a pair makes sense — but that is a separate assessment, and couples therapy is a different kind of work.",
  ),
  faqItemDoc(
    "faqItem-relazioni-ansia-3-it",
    "it",
    "Riguarda solo le relazioni di coppia?",
    "No. Lo stesso meccanismo compare nelle amicizie, nei rapporti familiari e a volte sul lavoro: rileggere un messaggio di un collega, cercare conferme sul proprio posto in un gruppo. Il legame cambia, la struttura dell'allarme no.",
  ),
  faqItemDoc(
    "faqItem-relazioni-ansia-3-en",
    "en",
    "Is it only about romantic relationships?",
    "No. The same mechanism appears in friendships, in family relationships and sometimes at work: rereading a colleague's message, looking for confirmation of your place in a group. The attachment changes; the structure of the alarm does not.",
  ),

  // --- 3. Ansia sessuale / Sexual performance anxiety ---
  faqItemDoc(
    "faqItem-ansia-sessuale-1-it",
    "it",
    "È un problema fisico o psicologico?",
    "Può essere entrambe le cose, e spesso lo è. Una causa organica può innescare la difficoltà, e l'ansia che ne segue può mantenerla anche dopo che la causa iniziale è stata risolta. Per questo la valutazione medica e il lavoro psicologico non sono alternativi: si escludono le cause organiche e, se la difficoltà resta, si lavora sul meccanismo.",
  ),
  faqItemDoc(
    "faqItem-ansia-sessuale-1-en",
    "en",
    "Is this a physical or a psychological problem?",
    "It can be both, and often is. An organic cause can trigger the difficulty, and the anxiety that follows can maintain it even after the original cause has been resolved. Medical assessment and psychological work are therefore not alternatives: organic causes get ruled out, and if the difficulty remains, the mechanism is where the work goes.",
  ),
  faqItemDoc(
    "faqItem-ansia-sessuale-2-it",
    "it",
    "Devo raccontare tutto nel dettaglio?",
    "No. Servono le informazioni cliniche necessarie a capire il meccanismo, non un resoconto. Le domande le faccio io, e rispondere a una domanda precisa è diverso dal dover trovare le parole da solo. Si procede al ritmo che è sostenibile.",
  ),
  faqItemDoc(
    "faqItem-ansia-sessuale-2-en",
    "en",
    "Do I have to describe everything in detail?",
    "No. What is needed is the clinical information required to understand the mechanism, not an account. I ask the questions, and answering a specific question is different from having to find the words unaided. The pace is whatever is sustainable.",
  ),
  faqItemDoc(
    "faqItem-ansia-sessuale-3-it",
    "it",
    "Passa da solo se smetto di pensarci?",
    "Il consiglio di non pensarci è il più diffuso e il meno praticabile: provare a non monitorare è ancora una forma di monitoraggio. Quello su cui si lavora non è smettere di pensare, ma spostare l'attenzione su quello che sta effettivamente accadendo — ed è una cosa che si allena, non che si decide.",
  ),
  faqItemDoc(
    "faqItem-ansia-sessuale-3-en",
    "en",
    "Will it pass on its own if I stop thinking about it?",
    "\"Stop thinking about it\" is the most common advice and the least workable: trying not to monitor is still a form of monitoring. What the work addresses is not stopping the thought but moving attention onto what is actually happening — and that is something trained rather than decided.",
  ),
];

// === Subtopic pages ========================================================
// IDs: no id convention was given for subtopicPage documents in the source
// (only faqItem ids were specified) — chosen to match each subtopic's own
// faqItem topic-key (prestazione / relazioni-ansia / ansia-sessuale) rather
// than guess at the existing four subtopics' inconsistent shortening
// pattern (agorafobia, ansia-malattia, ansia-sociale, insonnia all shorten
// their slug differently). Flagged in this pass's own report.

const subtopics = [
  {
    it: {
      _id: "subtopicPage-prestazione-it",
      _type: "subtopicPage",
      language: "it",
      title: "Ansia da prestazione",
      titleEmphasisWord: "prestazione",
      parentPillar: { _type: "reference", _ref: "pillarPage-anxiety-it" },
      slug: { _type: "slug", current: "ansia-da-prestazione" },
      heroKicker: "Un sottotipo dell'ansia",
      standfirst:
        "Quando l'attenzione si sposta su come stai andando, invece che su quello che stai facendo.",
      epigraph:
        "Le settimane prima non riesco a pensare ad altro, e quando arriva il momento non ricordo niente di quello che avevo preparato.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-prestazione-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-prestazione-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-prestazione-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cos'è l'ansia da prestazione",
          paragraphs: [
            "Non è la tensione che precede una cosa importante: quella è ordinaria, e in dosi contenute aiuta. L'ansia da prestazione è quando la tensione smette di essere legata al compito e si attacca al giudizio — al fatto che qualcuno stia valutando, e che il risultato dica qualcosa su di te.",
            "Il segnale che orienta è cosa succede quando il compito è finito. Se il sollievo dura poco e lascia posto all'analisi di come è andata, l'oggetto della paura non era il compito.",
          ],
        },
        {
          heading: "Non è solo il palco",
          paragraphs: [
            "Le situazioni sono più ordinarie di quanto il nome suggerisca: un esame, una riunione in cui devi parlare, una telefonata di lavoro, una prova pratica, un colloquio. Anche guidare con qualcuno accanto, o cucinare per ospiti.",
            "Quello che le accomuna non è il pubblico. È il fatto che ci sia un esito, e che l'esito sia visibile.",
          ],
        },
        {
          heading: "Il meccanismo: l'attenzione che si gira",
          paragraphs: [
            "Durante la prestazione l'attenzione fa una cosa precisa: si stacca da quello che stai facendo e si gira su di te. Su come suona la tua voce, su cosa stanno pensando gli altri, su quanto ti trema la mano.",
            "Ed è quel controllo a peggiorare esattamente la prestazione che sta sorvegliando. Il vuoto di memoria durante un esame non arriva dall'impreparazione: arriva dal fatto che una parte delle risorse cognitive è impegnata a monitorare l'andamento invece che a recuperare l'informazione.",
            "Per questo studiare di più, da solo, spesso non basta. Il problema non è nel materiale.",
          ],
        },
        {
          heading: "La spirale dell'anticipazione",
          paragraphs: [
            "La parte più lunga non è la prestazione. Sono i giorni prima: le prove mentali, gli scenari, il ripasso che non riesce a fermarsi. E poi le notti, in cui il sonno arriva tardi proprio quando servirebbe di più.",
            "Molte persone arrivano descrivendo quella settimana, non l'evento. Ed è corretto: è lì che si consuma la maggior parte del costo.",
          ],
        },
        {
          heading: "Quando evitare sembra una soluzione",
          paragraphs: [
            "Rifiutare una presentazione, rimandare un esame, non candidarsi per un ruolo che comporta parlare in pubblico. Ogni singola scelta è ragionevole e dà sollievo immediato.",
            "Il costo si vede solo a distanza di anni, guardando quante cose non hai fatto. È un perimetro che si stringe lentamente, e dall'interno somiglia a una preferenza personale più che a un sintomo.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Il lavoro riguarda dove va l'attenzione, prima ancora delle tecniche per gestire la singola situazione. Ricostruiamo cosa succede nelle ore precedenti, cosa cambia durante, e cosa fai subito dopo — perché anche l'analisi a posteriori è parte del meccanismo.",
            "Poi si sperimenta: piccole prove concordate, e l'annotazione di quello che è successo davvero invece di quello che avevi previsto. La distanza fra le due cose è quasi sempre l'informazione più utile.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Ansia da prestazione — psicologo a Milano e Monza",
        metaDescription:
          "Ansia da prestazione: perché l'attenzione rivolta a sé peggiora la prestazione, cosa succede nei giorni prima, e come si lavora. Studi a Milano, Monza, Cernusco sul Naviglio e online.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-prestazione-en",
      _type: "subtopicPage",
      language: "en",
      title: "Performance anxiety",
      titleEmphasisWord: "Performance",
      parentPillar: { _type: "reference", _ref: "pillarPage-anxiety-en" },
      slug: { _type: "slug", current: "performance-anxiety" },
      heroKicker: "A form of anxiety",
      standfirst:
        "When attention shifts onto how you are doing, instead of onto what you are doing.",
      epigraph:
        "For weeks beforehand I can think of nothing else, and when the moment comes I remember none of what I prepared.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-prestazione-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-prestazione-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-prestazione-3-en" },
      ],
      body: buildBody([
        {
          heading: "What performance anxiety is",
          paragraphs: [
            "It is not the tension that precedes something that matters: that is ordinary, and in moderate doses it helps. Performance anxiety is when the tension detaches from the task and attaches to being judged — to someone assessing, and to the result saying something about you.",
            "The signal that orients things is what happens once the task is over. If the relief is brief and gives way to analysing how it went, the fear was never really about the task.",
          ],
        },
        {
          heading: "Not only the stage",
          paragraphs: [
            "The situations are more ordinary than the name suggests: an exam, a meeting where you have to speak, a work phone call, a practical test, an interview. Driving with someone beside you, or cooking for guests.",
            "What they share is not an audience. It is that there is an outcome, and that the outcome is visible.",
          ],
        },
        {
          heading: "The mechanism: attention turning inward",
          paragraphs: [
            "During the performance, attention does something specific: it detaches from what you are doing and turns onto you. Onto how your voice sounds, what others are thinking, how much your hand is shaking.",
            "And that monitoring degrades the very performance it is watching. The blank during an exam does not come from being unprepared: it comes from part of your cognitive resources being spent on monitoring how it is going rather than on retrieving the information.",
            "Which is why studying harder, alone, often does not help. The problem is not in the material.",
          ],
        },
        {
          heading: "The anticipation spiral",
          paragraphs: [
            "The longest part is not the performance. It is the days before: the mental rehearsals, the scenarios, the revision that cannot stop. And the nights, where sleep arrives late exactly when it is most needed.",
            "Many people arrive describing that week rather than the event itself. They are right to: that is where most of the cost is paid.",
          ],
        },
        {
          heading: "When avoiding looks like a solution",
          paragraphs: [
            "Turning down a presentation, postponing an exam, not applying for a role that involves speaking in public. Each individual choice is reasonable and brings immediate relief.",
            "The cost only becomes visible years later, in how many things went undone. The perimeter tightens slowly, and from the inside it looks more like a personal preference than a symptom.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "The work is about where attention goes, before any technique for managing a particular situation. We reconstruct what happens in the hours beforehand, what changes during, and what you do immediately afterwards — because the post-mortem is part of the mechanism too.",
            "Then we experiment: small agreed trials, and a note of what actually happened rather than what you had predicted. The gap between those two is almost always the most useful information.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Performance anxiety — English-speaking psychotherapist in Milan",
        metaDescription:
          "Performance anxiety: why self-focused attention degrades performance, what happens in the days beforehand, and how the work proceeds. Studios in Milan, Monza, Cernusco sul Naviglio and online.",
        noIndex: true,
      },
    },
  },
  {
    it: {
      _id: "subtopicPage-relazioni-ansia-it",
      _type: "subtopicPage",
      language: "it",
      title: "Ansia nelle relazioni",
      titleEmphasisWord: "relazioni",
      parentPillar: { _type: "reference", _ref: "pillarPage-anxiety-it" },
      slug: { _type: "slug", current: "ansia-nelle-relazioni" },
      heroKicker: "Un sottotipo dell'ansia",
      standfirst: "Quando stare vicino a qualcuno attiva un allarme invece di calmarlo.",
      epigraph:
        "Controllo se ha letto il messaggio, e se non risponde subito comincio a pensare che stia per finire tutto.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-relazioni-ansia-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-relazioni-ansia-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-relazioni-ansia-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cos'è l'ansia nelle relazioni",
          paragraphs: [
            "È l'ansia che si attiva dentro i legami: con un partner, ma anche con un amico, un familiare, a volte un collega. Il tema non è la relazione in sé — è la sua tenuta. Quanto durerà, cosa pensa davvero l'altro, se qualcosa si è incrinato.",
            "La differenza con una preoccupazione ordinaria sta nella proporzione: l'allarme si accende su segnali minimi, e la calma dura finché non arriva il segnale successivo.",
          ],
        },
        {
          heading: "Le forme che prende",
          paragraphs: [
            "Rileggere un messaggio per capire il tono. Controllare quando è stato letto. Chiedere se va tutto bene, e chiederlo di nuovo poco dopo. Anticipare la fine di una storia che sta andando bene. Oppure il contrario: ritirarsi prima, per non trovarsi lasciati.",
            "Sono comportamenti diversi con la stessa funzione — abbassare l'incertezza. Ed è per questo che funzionano per qualche ora e poi vanno rifatti.",
          ],
        },
        {
          heading: "Il meccanismo: la rassicurazione che non basta mai",
          paragraphs: [
            "Chiedere rassicurazione dà sollievo immediato, e per questo si ripete. Ma risponde a una domanda diversa da quella che ti stai facendo: la risposta dell'altro riguarda questo momento, mentre la domanda riguarda la certezza.",
            "Quello che si consolida, ogni volta, è l'idea che senza quella verifica non si possa stare tranquilli. È il meccanismo, non un effetto collaterale.",
          ],
        },
        {
          heading: "Non è la stessa cosa di una relazione difficile",
          paragraphs: [
            "Una relazione può essere davvero problematica, e l'inquietudine essere una lettura corretta di quello che sta succedendo. Distinguere le due cose è parte della valutazione iniziale, e non è sempre immediato.",
            "Il criterio pratico: se lo stesso allarme si accende in relazioni diverse, con persone diverse, il tema probabilmente viaggia con te. Se riguarda una relazione sola, potrebbe riguardare quella relazione — e allora il lavoro cambia oggetto.",
          ],
        },
        {
          heading: "Cosa succede a chi sta dall'altra parte",
          paragraphs: [
            "Le richieste di rassicurazione ripetute stancano, e la stanchezza produce risposte più brevi. Le risposte più brevi vengono lette come conferma del timore, e il timore aumenta le richieste.",
            "È un circolo in cui entrambi hanno ragione dal proprio lato, e nessuno dei due lo ha costruito da solo. Vederlo come circolo, invece che come colpa di qualcuno, è di solito il primo passaggio utile.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Si comincia da situazioni concrete: un messaggio non risposto, una serata andata storta, il momento preciso in cui l'allarme si è acceso. Il diario serve esattamente a questo, perché a distanza di giorni resta l'impressione e si perdono i dettagli.",
            "Poi si lavora sulla riduzione graduale delle verifiche, concordata e non decisa in blocco. Il lavoro è individuale, anche quando l'argomento è una relazione: riguarda il tuo modo di starci dentro, che è anche l'unica parte su cui hai davvero margine.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Ansia nelle relazioni — psicologo a Milano e Monza",
        metaDescription:
          "Ansia nelle relazioni: richieste di rassicurazione, controllo, paura dell'abbandono. Come si distingue da una relazione difficile e come si lavora. Milano, Monza, Cernusco sul Naviglio e online.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-relazioni-ansia-en",
      _type: "subtopicPage",
      language: "en",
      title: "Anxiety in relationships",
      titleEmphasisWord: "relationships",
      parentPillar: { _type: "reference", _ref: "pillarPage-anxiety-en" },
      slug: { _type: "slug", current: "anxiety-in-relationships" },
      heroKicker: "A form of anxiety",
      standfirst: "When being close to someone sets off an alarm instead of settling one.",
      epigraph:
        "I check whether he has read the message, and if he doesn't reply straight away I start thinking it is all about to end.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-relazioni-ansia-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-relazioni-ansia-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-relazioni-ansia-3-en" },
      ],
      body: buildBody([
        {
          heading: "What anxiety in relationships is",
          paragraphs: [
            "It is anxiety that activates inside attachments: with a partner, but also with a friend, a family member, sometimes a colleague. The subject is not the relationship itself — it is whether the relationship will hold. How long it will last, what the other person really thinks, whether something has cracked.",
            "What separates it from ordinary concern is proportion: the alarm goes off on minimal signals, and the calm lasts only until the next one.",
          ],
        },
        {
          heading: "The forms it takes",
          paragraphs: [
            "Rereading a message to work out its tone. Checking when it was read. Asking whether everything is all right, and asking again shortly afterwards. Anticipating the end of a relationship that is going well. Or the reverse: withdrawing first, so as not to be the one left.",
            "These are different behaviours with the same function — lowering uncertainty. Which is why they work for a few hours and then have to be done again.",
          ],
        },
        {
          heading: "The mechanism: reassurance that is never enough",
          paragraphs: [
            "Asking for reassurance brings immediate relief, and so it repeats. But it answers a different question from the one you are asking: the other person's answer is about this moment, while the question is about certainty.",
            "What consolidates, each time, is the sense that without that check you cannot be at ease. That is the mechanism, not a side effect of it.",
          ],
        },
        {
          heading: "It is not the same as a difficult relationship",
          paragraphs: [
            "A relationship can genuinely be a problem, and the unease can be an accurate reading of what is happening. Telling the two apart is part of the initial assessment, and it is not always immediate.",
            "The practical test: if the same alarm goes off across different relationships, with different people, the theme probably travels with you. If it concerns one relationship only, it may well be about that relationship — and then the work has a different object.",
          ],
        },
        {
          heading: "What happens for the other person",
          paragraphs: [
            "Repeated requests for reassurance are tiring, and tiredness produces shorter answers. Shorter answers get read as confirmation of the fear, and the fear increases the requests.",
            "It is a loop in which both people are right from where they stand, and neither built it alone. Seeing it as a loop rather than as someone's fault is usually the first useful step.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "We start from concrete situations: an unanswered message, an evening that went wrong, the precise moment the alarm went off. The diary is for exactly this, because days later the impression survives and the details are gone.",
            "Then we work on reducing the checking gradually, by agreement rather than in one decision. The work is individual even when the subject is a relationship: it concerns your own way of being in one, which is also the only part you have real leverage over.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Anxiety in relationships — English-speaking psychotherapist in Milan",
        metaDescription:
          "Anxiety in relationships: reassurance seeking, checking, fear of abandonment. How it differs from a genuinely difficult relationship, and how the work proceeds. Milan, Monza and online.",
        noIndex: true,
      },
    },
  },
  {
    it: {
      _id: "subtopicPage-ansia-sessuale-it",
      _type: "subtopicPage",
      language: "it",
      title: "Ansia da prestazione sessuale",
      titleEmphasisWord: "sessuale",
      parentPillar: { _type: "reference", _ref: "pillarPage-anxiety-it" },
      slug: { _type: "slug", current: "ansia-sessuale" },
      heroKicker: "Un sottotipo dell'ansia",
      standfirst:
        "Quando la paura che qualcosa non funzioni è esattamente ciò che impedisce che funzioni.",
      epigraph: "Ci penso già prima che succeda, e proprio perché ci penso non succede.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-ansia-sessuale-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-ansia-sessuale-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-ansia-sessuale-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cos'è l'ansia da prestazione sessuale",
          paragraphs: [
            "È la forma che l'ansia da prestazione prende nell'intimità: l'attenzione si sposta da quello che sta accadendo al modo in cui sta andando. Da esperienza diventa verifica.",
            "La particolarità è che qui il controllo è particolarmente controproducente, perché la risposta sessuale non è volontaria: non risponde allo sforzo, e monitorarla la interrompe.",
          ],
        },
        {
          heading: "Il circolo che si autoalimenta",
          paragraphs: [
            "Un episodio in cui qualcosa non funziona può avere mille cause occasionali: stanchezza, alcol, una giornata pesante, una relazione nuova. Quello che accade dopo conta più dell'episodio.",
            "Se quell'episodio diventa un precedente, l'incontro successivo comincia con una domanda — andrà come l'altra volta? — e la domanda porta l'attenzione dove non serve. A quel punto la difficoltà si conferma, e il precedente diventa due.",
            "Da lì in poi il problema non è più quello iniziale. È l'attesa.",
          ],
        },
        {
          heading: "Non riguarda solo gli uomini",
          paragraphs: [
            "Nell'uomo si presenta spesso come difficoltà erettile o come controllo dell'eiaculazione. Nella donna più frequentemente come difficoltà di eccitazione, calo del desiderio, o dolore durante i rapporti — dove la tensione muscolare che l'ansia produce ha un effetto diretto.",
            "La forma cambia, il meccanismo no: l'attenzione che sorveglia interferisce con una risposta che non può essere prodotta a comando.",
          ],
        },
        {
          heading: "La valutazione medica viene prima",
          paragraphs: [
            "Disfunzione erettile, calo del desiderio e dolore durante i rapporti hanno tutti cause organiche possibili, e vanno escluse da un medico prima o accanto al lavoro psicologico.",
            "Le cause possono anche essere miste: una componente organica e una psicologica che si alimentano a vicenda, dove l'ansia mantiene una difficoltà cominciata per altro. Per questo l'accertamento medico non rimanda il lavoro psicologico — spesso i due percorsi procedono insieme.",
          ],
        },
        {
          heading: "Quando comincia a organizzare la coppia",
          paragraphs: [
            "A un certo punto l'evitamento entra nella relazione: si rimanda, si trovano ragioni, l'intimità si riduce. L'altro spesso interpreta il ritiro come disinteresse, e quella lettura aggiunge un secondo problema al primo.",
            "È il momento in cui parlarne diventa difficile proprio mentre servirebbe di più. Qui un incontro insieme può essere utile — si valuta, non si dà per scontato.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Si parte da quello che succede adesso, non da un resoconto. Servono le informazioni cliniche necessarie a capire il meccanismo — quando accade, in quali circostanze, da quanto tempo — e si procede al ritmo che è sostenibile.",
            "Il lavoro riguarda lo spostamento dell'attenzione e la riduzione dell'evitamento, per gradi e in modo concordato. È un ambito in cui il pudore è la regola, non l'eccezione, e non è un ostacolo.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Ansia da prestazione sessuale — psicologo e sessuologo a Milano",
        metaDescription:
          "Ansia da prestazione sessuale: il circolo fra attesa e difficoltà, perché la valutazione medica viene prima, e come si lavora. Milano, Monza, Cernusco sul Naviglio e online.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-ansia-sessuale-en",
      _type: "subtopicPage",
      language: "en",
      title: "Sexual performance anxiety",
      titleEmphasisWord: "performance",
      parentPillar: { _type: "reference", _ref: "pillarPage-anxiety-en" },
      slug: { _type: "slug", current: "sexual-performance-anxiety" },
      heroKicker: "A form of anxiety",
      standfirst: "When the fear that something will not work is exactly what stops it working.",
      epigraph:
        "I am already thinking about it beforehand, and precisely because I am thinking about it, it doesn't happen.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-ansia-sessuale-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-ansia-sessuale-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-ansia-sessuale-3-en" },
      ],
      body: buildBody([
        {
          heading: "What sexual performance anxiety is",
          paragraphs: [
            "It is the form performance anxiety takes in intimacy: attention shifts from what is happening to how it is going. Experience turns into assessment.",
            "What makes it particular is that monitoring is especially counterproductive here, because sexual response is not voluntary: it does not answer to effort, and watching it interrupts it.",
          ],
        },
        {
          heading: "The self-feeding loop",
          paragraphs: [
            "A single occasion where something does not work can have any number of incidental causes: tiredness, alcohol, a heavy day, a new relationship. What happens afterwards matters more than the occasion itself.",
            "If it becomes a precedent, the next encounter begins with a question — will it go like last time? — and the question puts attention where it does not help. At that point the difficulty confirms itself, and one precedent becomes two.",
            "From there the problem is no longer the original one. It is the anticipation.",
          ],
        },
        {
          heading: "It is not only about men",
          paragraphs: [
            "In men it often presents as erectile difficulty or as control over ejaculation. In women more often as difficulty with arousal, loss of desire, or pain during sex — where the muscular tension anxiety produces has a direct effect.",
            "The form changes; the mechanism does not. Monitoring attention interferes with a response that cannot be produced on command.",
          ],
        },
        {
          heading: "Medical assessment comes first",
          paragraphs: [
            "Erectile difficulty, loss of desire and pain during sex all have possible organic causes, and a doctor needs to rule them out before or alongside psychological work.",
            "Causes can also be mixed: an organic component and a psychological one feeding each other, where anxiety maintains a difficulty that began for another reason. Medical assessment therefore does not postpone the psychological work — the two often proceed together.",
          ],
        },
        {
          heading: "When it starts organising the couple",
          paragraphs: [
            "At some point avoidance enters the relationship: things get postponed, reasons get found, intimacy contracts. The other person often reads the withdrawal as disinterest, and that reading adds a second problem to the first.",
            "It becomes hard to talk about at precisely the point where talking would help most. A session together can be useful here — it is assessed rather than assumed.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "We start from what is happening now, not from an account. What is needed is the clinical information required to understand the mechanism — when it happens, in what circumstances, for how long — and the pace is whatever is sustainable.",
            "The work concerns shifting attention and reducing avoidance, gradually and by agreement. Reticence is the norm in this area rather than the exception, and it does not obstruct the work.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Sexual performance anxiety — English-speaking psychotherapist in Milan",
        metaDescription:
          "Sexual performance anxiety: the loop between anticipation and difficulty, why medical assessment comes first, and how the work proceeds. Milan, Monza and online.",
        noIndex: true,
      },
    },
  },
];

// === Recognition items (appended, never replacing) =======================
// Key format matches the existing convention exactly (recognition-{locale}-{index}),
// continuing from index 12 (last existing item) to 13/14/15.

const recognitionItemsIt = [
  {
    _key: "recognition-it-13",
    _type: "recognitionItem",
    label: "Ansia da prestazione",
    quote: "Mi preparo per settimane e poi, sul momento, il vuoto.",
    subtopic: { _type: "reference", _ref: "subtopicPage-prestazione-it" },
    isDraft: true,
  },
  {
    _key: "recognition-it-14",
    _type: "recognitionItem",
    label: "Ansia nelle relazioni",
    quote: "Se non risponde subito, comincio a pensare al peggio.",
    subtopic: { _type: "reference", _ref: "subtopicPage-relazioni-ansia-it" },
    isDraft: true,
  },
  {
    _key: "recognition-it-15",
    _type: "recognitionItem",
    label: "Ansia sessuale",
    quote: "Ci penso prima, e proprio per questo non funziona.",
    subtopic: { _type: "reference", _ref: "subtopicPage-ansia-sessuale-it" },
    isDraft: true,
  },
];

const recognitionItemsEn = [
  {
    _key: "recognition-en-13",
    _type: "recognitionItem",
    label: "Performance anxiety",
    quote: "I prepare for weeks and then, in the moment, nothing.",
    subtopic: { _type: "reference", _ref: "subtopicPage-prestazione-en" },
    isDraft: true,
  },
  {
    _key: "recognition-en-14",
    _type: "recognitionItem",
    label: "Anxiety in relationships",
    quote: "If he doesn't reply straight away, I start thinking the worst.",
    subtopic: { _type: "reference", _ref: "subtopicPage-relazioni-ansia-en" },
    isDraft: true,
  },
  {
    _key: "recognition-en-15",
    _type: "recognitionItem",
    label: "Sexual performance anxiety",
    quote: "I think about it beforehand, and that is exactly why it doesn't work.",
    subtopic: { _type: "reference", _ref: "subtopicPage-ansia-sessuale-en" },
    isDraft: true,
  },
];

async function main() {
  console.log(`Creating ${faqItems.length} faqItem documents...`);
  for (const doc of faqItems) {
    const result = await client.createIfNotExists(doc as never);
    console.log(`  ${result._id}`);
  }

  console.log(`Creating ${subtopics.length * 2} subtopicPage documents...`);
  for (const pair of subtopics) {
    for (const doc of [pair.it, pair.en]) {
      const result = await client.createIfNotExists(doc as never);
      console.log(`  ${result._id}`);
    }
  }

  console.log("Appending 3 recognition items to pillarPage-anxiety-it...");
  await client
    .patch("pillarPage-anxiety-it")
    .insert("after", "recognition.items[-1]", recognitionItemsIt)
    .commit();
  console.log("  done");

  console.log("Appending 3 recognition items to pillarPage-anxiety-en...");
  await client
    .patch("pillarPage-anxiety-en")
    .insert("after", "recognition.items[-1]", recognitionItemsEn)
    .commit();
  console.log("  done");

  console.log("All writes complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
