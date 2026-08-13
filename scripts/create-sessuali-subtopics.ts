import { createClient } from "@sanity/client";
import { buildBody, faqItemDoc } from "./lib/subtopicBuilders";

// Sexual dysfunction pillar batch — eiaculazione-precoce, calo-del-desiderio,
// dolore-durante-i-rapporti. Copy verbatim from contents/subtopic-sessuali-tre.md.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const faqItems = [
  faqItemDoc(
    "faqItem-eiaculazione-1-it",
    "it",
    "Esiste una durata normale?",
    "Non nel senso in cui la domanda viene di solito posta. Il criterio clinico riguarda il controllo volontario e il disagio che l'assenza di controllo produce, non un numero di minuti. Due persone con gli stessi tempi possono trovarsi in situazioni molto diverse, e la differenza sta in quanto la cosa pesa nella loro vita.",
  ),
  faqItemDoc(
    "faqItem-eiaculazione-1-en",
    "en",
    "Is there a normal duration?",
    "Not in the sense the question is usually meant. The clinical criterion concerns voluntary control and the distress its absence produces, not a number of minutes. Two people with identical timings can be in very different situations, and the difference lies in how much it weighs on their lives.",
  ),
  faqItemDoc(
    "faqItem-eiaculazione-2-it",
    "it",
    "Serve una visita urologica?",
    "Sì, soprattutto se la difficoltà è comparsa dopo un periodo in cui non c'era. Prostatiti, alterazioni tiroidee e alcune terapie farmacologiche possono avere un ruolo, e vanno escluse da un medico prima o accanto al lavoro psicologico. Il primo riferimento può essere anche il medico curante.",
  ),
  faqItemDoc(
    "faqItem-eiaculazione-2-en",
    "en",
    "Do I need to see a urologist?",
    "Yes, particularly if the difficulty appeared after a period without it. Prostatitis, thyroid conditions and some medications can play a part, and a doctor needs to rule them out before or alongside psychological work. A family doctor is a perfectly good starting point.",
  ),
  faqItemDoc(
    "faqItem-eiaculazione-3-it",
    "it",
    "Le tecniche che si trovano online servono a qualcosa?",
    "Alcune derivano da protocolli clinici reali, ma vengono presentate fuori dal contesto in cui erano state pensate — senza valutazione iniziale, senza distinzione fra forma primaria e acquisita, e senza nessuno che verifichi cosa succede applicandole. Il rischio concreto è che diventino un'altra cosa da fare bene, e quindi un'altra fonte di controllo.",
  ),
  faqItemDoc(
    "faqItem-eiaculazione-3-en",
    "en",
    "Do the techniques you find online help?",
    "Some derive from real clinical protocols, but they are presented outside the context they were designed for — no initial assessment, no distinction between lifelong and acquired forms, and nobody checking what happens when they are applied. The concrete risk is that they become one more thing to get right, and therefore one more source of monitoring.",
  ),
  faqItemDoc(
    "faqItem-desiderio-1-it",
    "it",
    "È normale che cali con gli anni?",
    "Una certa variazione nel corso della vita è comune, e i cambiamenti ormonali hanno un ruolo. Ma \"è l'età\" è una spiegazione che chiude il discorso troppo presto: molte cause potenzialmente reversibili — farmaci, sonno, stress prolungato, condizioni mediche non diagnosticate — vengono attribuite all'età e quindi non verificate.",
  ),
  faqItemDoc(
    "faqItem-desiderio-1-en",
    "en",
    "Isn't it normal for it to decline with age?",
    "Some variation across a lifetime is common, and hormonal changes play a part. But \"it's my age\" closes the conversation too early: many potentially reversible causes — medication, sleep, prolonged stress, undiagnosed medical conditions — get attributed to age and therefore never checked.",
  ),
  faqItemDoc(
    "faqItem-desiderio-2-it",
    "it",
    "Possono essere i farmaci che prendo?",
    "Può succedere, ed è una delle voci più sottovalutate. Diversi antidepressivi e alcuni contraccettivi modificano il desiderio, e spesso la cosa non viene menzionata al momento della prescrizione. Non sono un medico e non prescrivo: se il sospetto c'è, va portato a chi ha prescritto la terapia, e non si sospende mai di propria iniziativa.",
  ),
  faqItemDoc(
    "faqItem-desiderio-2-en",
    "en",
    "Could it be the medication I take?",
    "It can be, and this is one of the most underestimated factors. Several antidepressants and some contraceptives alter desire, and it is often not mentioned at the point of prescription. I am not a physician and I do not prescribe: if you suspect this, it belongs with whoever prescribed the medication, and it should never be stopped on your own initiative.",
  ),
  faqItemDoc(
    "faqItem-desiderio-3-it",
    "it",
    "Vuol dire che non provo più niente per il mio partner?",
    "Non necessariamente, e per molte persone la risposta è chiaramente no. Il desiderio sessuale e l'affetto sono processi distinti, con cause distinte: si può volere molto bene a qualcuno e avere un desiderio ridotto per ragioni mediche, farmacologiche o di contesto. Confonderli è comprensibile, e aggiunge una preoccupazione che spesso non è fondata.",
  ),
  faqItemDoc(
    "faqItem-desiderio-3-en",
    "en",
    "Does it mean I no longer feel anything for my partner?",
    "Not necessarily, and for many people the answer is clearly no. Sexual desire and affection are distinct processes with distinct causes: it is entirely possible to love someone deeply and have reduced desire for medical, pharmacological or contextual reasons. Conflating them is understandable, and it adds a worry that is often unfounded.",
  ),
  faqItemDoc(
    "faqItem-dolore-rapporti-1-it",
    "it",
    "Mi hanno detto che è psicologico. Vuol dire che me lo invento?",
    "No. Il dolore è un'esperienza reale prodotta dal sistema nervoso, indipendentemente da dove si trovi la sua causa iniziale, e il fatto che una componente psicologica partecipi al mantenimento non lo rende immaginario. Detto questo, \"è psicologico\" viene a volte usato come conclusione quando gli accertamenti non hanno trovato nulla — e in quel caso vale la pena verificare che siano stati fatti tutti quelli indicati.",
  ),
  faqItemDoc(
    "faqItem-dolore-rapporti-1-en",
    "en",
    "I have been told it is psychological. Does that mean I am imagining it?",
    "No. Pain is a real experience produced by the nervous system, regardless of where its initial cause lies, and a psychological component participating in its maintenance does not make it imaginary. That said, \"it's psychological\" is sometimes used as a conclusion when investigations found nothing — and in that case it is worth checking that all the indicated ones were actually done.",
  ),
  faqItemDoc(
    "faqItem-dolore-rapporti-2-it",
    "it",
    "A chi mi rivolgo per primo?",
    "Al ginecologo o all'urologo, o al medico curante se preferisci partire da lì. Le cause organiche del dolore sono frequenti e in buona parte trattabili, e vanno escluse prima. Il lavoro psicologico non sostituisce quel passaggio: procede accanto, e spesso i due percorsi vanno avanti insieme.",
  ),
  faqItemDoc(
    "faqItem-dolore-rapporti-2-en",
    "en",
    "Who should I see first?",
    "A gynaecologist or a urologist, or your family doctor if you would rather start there. Organic causes of pain are common and largely treatable, and they need ruling out first. Psychological work does not replace that step: it proceeds alongside, and the two paths often run together.",
  ),
  faqItemDoc(
    "faqItem-dolore-rapporti-3-it",
    "it",
    "Riguarda solo le donne?",
    "No, anche se è più frequente nelle donne. Negli uomini il dolore durante i rapporti può essere legato a prostatiti, a problemi del frenulo o a condizioni dermatologiche, e il circolo fra dolore e attesa si instaura allo stesso modo. La valutazione medica resta il primo passo in entrambi i casi.",
  ),
  faqItemDoc(
    "faqItem-dolore-rapporti-3-en",
    "en",
    "Does it only affect women?",
    "No, although it is more frequent in women. In men, pain during sex can relate to prostatitis, frenulum problems or dermatological conditions, and the loop between pain and anticipation establishes itself in the same way. Medical assessment remains the first step either way.",
  ),
];

const subtopics = [
  {
    it: {
      _id: "subtopicPage-eiaculazione-it",
      _type: "subtopicPage",
      language: "it",
      title: "Eiaculazione precoce",
      titleEmphasisWord: "precoce",
      parentPillar: { _type: "reference", _ref: "pillarPage-sessuali-it" },
      slug: { _type: "slug", current: "eiaculazione-precoce" },
      heroKicker: "Una difficoltà sessuale",
      standfirst: "Il criterio non è il cronometro, ma il fatto che tu non abbia margine di scelta.",
      epigraph: "Finisce sempre troppo presto, e ormai ci penso ogni volta.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-eiaculazione-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-eiaculazione-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-eiaculazione-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cos'è, e cosa non è",
          paragraphs: [
            "Il criterio clinico non è una durata: è la mancanza di controllo volontario, unita al disagio che ne deriva. Due persone con gli stessi tempi possono avere una situazione completamente diversa a seconda di quanto quella cosa pesi nella loro vita.",
            "Per questo la domanda \"quanto dovrebbe durare\" non ha una risposta utile. La domanda utile è un'altra: hai la sensazione di poter scegliere?",
          ],
        },
        {
          heading: "Primaria e acquisita",
          paragraphs: [
            "Le due situazioni sono diverse e vanno distinte. Quando la difficoltà è presente fin dai primi rapporti, il quadro è di un tipo. Quando compare dopo un periodo in cui non c'era, è di un altro — e in quel caso ha quasi sempre senso capire cosa è cambiato intorno: un periodo di stress, una relazione nuova, una terapia farmacologica iniziata.",
            "La forma acquisita è anche quella in cui la valutazione medica pesa di più.",
          ],
        },
        {
          heading: "Il ruolo dell'attenzione",
          paragraphs: [
            "Dopo alcuni episodi, l'attenzione cambia direzione: invece di stare su quello che sta accadendo, comincia a monitorare quanto tempo è passato e quanto manca.",
            "Il monitoraggio è la risposta più naturale possibile, ed è anche quella che riduce il margine. Le strategie di distrazione — pensare ad altro, contare — funzionano sullo stesso principio e hanno lo stesso limite: allontanano dall'esperienza invece di regolarla.",
          ],
        },
        {
          heading: "La valutazione medica",
          paragraphs: [
            "Va fatta, soprattutto nella forma acquisita. Prostatiti, alterazioni tiroidee e alcune terapie farmacologiche possono avere un ruolo, e sono cose che si escludono con un accertamento, non con un'interpretazione.",
            "Anche il contrario è vero: alcuni farmaci prescritti per altro modificano la risposta sessuale, e saperlo cambia completamente la lettura della situazione. Il riferimento è il medico curante o l'urologo.",
          ],
        },
        {
          heading: "Cosa succede nella coppia",
          paragraphs: [
            "A un certo punto la difficoltà smette di riguardare il singolo episodio e comincia a organizzare l'intimità: si rimanda, si trovano ragioni, si riduce la frequenza.",
            "Il partner spesso legge il ritiro come disinteresse, e quella lettura aggiunge un secondo problema al primo. È il momento in cui parlarne diventa difficile proprio mentre servirebbe di più.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Si parte da come è cominciata e da cosa è cambiato da allora — la storia della difficoltà, non solo la sua forma attuale.",
            "Il lavoro riguarda lo spostamento dell'attenzione, la riduzione dell'evitamento e, dove ha senso, il coinvolgimento del partner in uno o più incontri. Quest'ultimo si valuta insieme, non si dà per scontato.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Eiaculazione precoce — psicologo e sessuologo a Milano",
        metaDescription:
          "Eiaculazione precoce: perché il criterio non è la durata, la differenza fra forma primaria e acquisita, quando serve la valutazione medica e come si lavora.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-eiaculazione-en",
      _type: "subtopicPage",
      language: "en",
      title: "Premature ejaculation",
      titleEmphasisWord: "Premature",
      parentPillar: { _type: "reference", _ref: "pillarPage-sessuali-en" },
      slug: { _type: "slug", current: "premature-ejaculation" },
      heroKicker: "A sexual difficulty",
      standfirst: "The criterion is not the clock, but whether you have any room to choose.",
      epigraph: "It is always over too quickly, and now I think about it every time.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-eiaculazione-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-eiaculazione-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-eiaculazione-3-en" },
      ],
      body: buildBody([
        {
          heading: "What it is, and what it is not",
          paragraphs: [
            "The clinical criterion is not a duration: it is the absence of voluntary control, together with the distress that follows from it. Two people with identical timings can be in entirely different situations, depending on how much it weighs on their lives.",
            "Which is why \"how long should it last\" has no useful answer. The useful question is a different one: does it feel as though you have a choice?",
          ],
        },
        {
          heading: "Lifelong and acquired",
          paragraphs: [
            "These are two different pictures and worth separating. Where the difficulty has been present since the earliest experiences, it is one thing. Where it appears after a period in which it was absent, it is another — and in that case it almost always makes sense to look at what changed around it: a period of stress, a new relationship, a course of medication started.",
            "The acquired form is also the one where medical assessment carries most weight.",
          ],
        },
        {
          heading: "The role of attention",
          paragraphs: [
            "After a few occasions, attention changes direction: instead of staying on what is happening, it starts monitoring how much time has passed and how much is left.",
            "Monitoring is the most natural possible response, and it is also what reduces the room available. Distraction strategies — thinking about something else, counting — work on the same principle and share the same limit: they move you away from the experience rather than regulating it.",
          ],
        },
        {
          heading: "Medical assessment",
          paragraphs: [
            "It belongs here, particularly in the acquired form. Prostatitis, thyroid conditions and some medications can play a part, and those are ruled out by examination rather than by interpretation.",
            "The reverse is true too: some drugs prescribed for other reasons alter sexual response, and knowing that changes the whole reading of a situation. The reference point is your family doctor or a urologist.",
          ],
        },
        {
          heading: "What happens in the couple",
          paragraphs: [
            "At some point the difficulty stops being about the individual occasion and starts organising intimacy: things get postponed, reasons get found, frequency drops.",
            "The partner often reads the withdrawal as disinterest, and that reading adds a second problem to the first. It becomes hard to talk about at exactly the point where talking would help most.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "We start from how it began and what has changed since — the history of the difficulty, not only its present shape.",
            "The work concerns shifting attention, reducing avoidance and, where it makes sense, involving the partner in one or more sessions. That last part is assessed together rather than assumed.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Premature ejaculation — English-speaking psychotherapist in Milan",
        metaDescription:
          "Premature ejaculation: why duration is not the criterion, the difference between lifelong and acquired forms, when medical assessment matters, and how the work proceeds.",
        noIndex: true,
      },
    },
  },
  {
    it: {
      _id: "subtopicPage-desiderio-it",
      _type: "subtopicPage",
      language: "it",
      title: "Calo del desiderio",
      titleEmphasisWord: "desiderio",
      parentPillar: { _type: "reference", _ref: "pillarPage-sessuali-it" },
      slug: { _type: "slug", current: "calo-del-desiderio" },
      heroKicker: "Una difficoltà sessuale",
      standfirst: "Non è sempre un sintomo. Diventa un tema quando pesa, o quando distanzia due persone.",
      epigraph: "Non è che non gli voglia bene. È che proprio non mi viene in mente.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-desiderio-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-desiderio-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-desiderio-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cos'è il calo del desiderio",
          paragraphs: [
            "È la riduzione dell'interesse sessuale rispetto a un periodo precedente. Detta così sembra semplice, ma il punto delicato è un altro: non esiste un livello giusto di desiderio, e quindi il calo non si misura contro una norma.",
            "Si misura contro due cose. Quanto pesa a te, e quanta distanza crea con la persona con cui stai.",
          ],
        },
        {
          heading: "Quando è un problema e quando non lo è",
          paragraphs: [
            "Un periodo di minore interesse dopo un cambiamento importante — un trasloco, un lutto, la nascita di un figlio, un carico di lavoro fuori scala — è una risposta ordinaria, non una disfunzione.",
            "Nelle coppie, poi, quello che si presenta come \"calo\" è spesso una discrepanza: due persone con livelli diversi, dove chi ne ha meno viene definito il problema. Riformulare la cosa come differenza invece che come mancanza cambia già il modo in cui se ne parla.",
          ],
        },
        {
          heading: "Le cause possibili",
          paragraphs: [
            "Sono molte e vanno considerate insieme. Mediche: alterazioni ormonali, tiroide, condizioni croniche. Farmacologiche, e questa è la voce più sottovalutata — diversi antidepressivi e alcuni contraccettivi modificano il desiderio, e spesso nessuno lo ha detto a chi li assume.",
            "Poi il sonno, lo stress prolungato, il dolore durante i rapporti, e la storia della relazione. Raramente c'è una causa sola.",
          ],
        },
        {
          heading: "Desiderio spontaneo e desiderio responsivo",
          paragraphs: [
            "Molte persone si aspettano che il desiderio arrivi per primo, come una spinta che compare da sola. Per una parte consistente delle persone funziona diversamente: il desiderio compare in risposta a un contesto, dopo l'inizio dell'intimità e non prima.",
            "Non è un ripiego. È una modalità di funzionamento diffusa, e chi la ha spesso si è convinto per anni di avere qualcosa che non va, semplicemente perché aspettava un segnale che non arriva in quella forma.",
          ],
        },
        {
          heading: "Quando entra nella coppia",
          paragraphs: [
            "Il calo raramente resta un fatto individuale. Si organizza attorno all'iniziativa: chi la prende comincia a temere il rifiuto, chi la riceve comincia a temere la richiesta. E a quel punto anche i gesti non sessuali diventano ambigui, perché ognuno potrebbe essere un preludio.",
            "È una delle situazioni in cui un incontro con entrambi può servire a sbloccare qualcosa. Si valuta, non si dà per scontato.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Si parte dalla storia: da quando, in che circostanze, cosa era in corso in quel periodo. E dalla valutazione medica, se non è già stata fatta.",
            "Il lavoro psicologico riguarda il contesto in cui il desiderio può o non può comparire, le aspettative su come dovrebbe funzionare, e la pressione che l'attesa stessa produce.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Calo del desiderio sessuale — psicologo e sessuologo a Milano",
        metaDescription:
          "Calo del desiderio: quando è una risposta ordinaria e quando è un tema, il ruolo dei farmaci e della valutazione medica, e la differenza fra desiderio spontaneo e responsivo.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-desiderio-en",
      _type: "subtopicPage",
      language: "en",
      title: "Loss of desire",
      titleEmphasisWord: "desire",
      parentPillar: { _type: "reference", _ref: "pillarPage-sessuali-en" },
      slug: { _type: "slug", current: "loss-of-desire" },
      heroKicker: "A sexual difficulty",
      standfirst: "Not always a symptom. It becomes a subject when it weighs on you, or when it opens a distance.",
      epigraph: "It is not that I don't love him. It just doesn't cross my mind.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-desiderio-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-desiderio-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-desiderio-3-en" },
      ],
      body: buildBody([
        {
          heading: "What loss of desire is",
          paragraphs: [
            "It is a reduction in sexual interest relative to an earlier period. Put like that it sounds simple, but the delicate part is elsewhere: there is no correct level of desire, so a decline cannot be measured against a norm.",
            "It is measured against two things instead. How much it weighs on you, and how much distance it opens with the person you are with.",
          ],
        },
        {
          heading: "When it is a problem and when it is not",
          paragraphs: [
            "A period of reduced interest after a significant change — a move, a bereavement, the birth of a child, a workload beyond scale — is an ordinary response rather than a dysfunction.",
            "In couples, what presents as \"loss\" is often a discrepancy: two people at different levels, where the one with less gets defined as the problem. Reframing it as a difference rather than a deficit already changes how it can be discussed.",
          ],
        },
        {
          heading: "Possible causes",
          paragraphs: [
            "There are many, and they need considering together. Medical: hormonal changes, thyroid conditions, chronic illness. Pharmacological, and this is the most underestimated entry — several antidepressants and some contraceptives alter desire, and often nobody told the person taking them.",
            "Then sleep, prolonged stress, pain during sex, and the history of the relationship itself. There is rarely a single cause.",
          ],
        },
        {
          heading: "Spontaneous and responsive desire",
          paragraphs: [
            "Many people expect desire to arrive first, as an impulse that appears on its own. For a substantial proportion of people it works differently: desire appears in response to a context, after intimacy has begun rather than before.",
            "This is not a lesser version. It is a widespread way of functioning, and people who work this way have often spent years convinced something was wrong with them, simply because they were waiting for a signal that does not arrive in that form.",
          ],
        },
        {
          heading: "When it enters the couple",
          paragraphs: [
            "Loss of desire rarely stays an individual matter. It organises itself around initiative: the person who takes it starts fearing refusal, the person who receives it starts fearing the request. At that point even non-sexual gestures become ambiguous, because any of them might be a prelude.",
            "It is one of the situations where a session with both people can unlock something. It is assessed rather than assumed.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "We start from the history: since when, in what circumstances, what else was going on at the time. And from medical assessment, if that has not already happened.",
            "The psychological work concerns the context in which desire can or cannot appear, the expectations about how it ought to work, and the pressure that waiting itself produces.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Loss of sexual desire — English-speaking psychotherapist in Milan",
        metaDescription:
          "Loss of desire: when it is an ordinary response and when it is a subject, the role of medication and medical assessment, and the difference between spontaneous and responsive desire.",
        noIndex: true,
      },
    },
  },
  {
    it: {
      _id: "subtopicPage-dolore-rapporti-it",
      _type: "subtopicPage",
      language: "it",
      title: "Dolore durante i rapporti",
      titleEmphasisWord: "dolore",
      parentPillar: { _type: "reference", _ref: "pillarPage-sessuali-it" },
      slug: { _type: "slug", current: "dolore-durante-i-rapporti" },
      heroKicker: "Una difficoltà sessuale",
      standfirst: "Il dolore è reale. La valutazione medica viene prima, e il lavoro psicologico procede accanto.",
      epigraph: "Fa male, e a forza di aspettarmelo il corpo si irrigidisce da solo.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-dolore-rapporti-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-dolore-rapporti-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-dolore-rapporti-3-it" },
      ],
      body: buildBody([
        {
          heading: "La valutazione medica viene prima",
          paragraphs: [
            "Questo è il punto da cui partire, prima di qualsiasi altra considerazione. Il dolore durante i rapporti ha cause organiche frequenti e trattabili: infezioni, endometriosi, atrofia vulvo-vaginale, dermatiti, esiti di interventi o del parto. Negli uomini, prostatiti e problemi del frenulo.",
            "Nessuna di queste si esclude con un'interpretazione psicologica. Il riferimento è il ginecologo o l'urologo, e in molti casi il percorso comincia lì.",
          ],
        },
        {
          heading: "Il dolore non è \"nella testa\"",
          paragraphs: [
            "È importante dirlo esplicitamente, perché è quello che molte persone si sono sentite dire — a volte anche in ambito sanitario — e che le ha allontanate dal chiedere aiuto.",
            "Il dolore è un'esperienza reale, prodotta dal sistema nervoso, indipendentemente da dove si trovi la sua causa iniziale. Che una componente psicologica partecipi al mantenimento non lo rende immaginario, e non rende la persona responsabile di provarlo.",
          ],
        },
        {
          heading: "Le forme",
          paragraphs: [
            "La dispareunia indica dolore durante il rapporto, e può presentarsi all'ingresso o in profondità: due quadri con cause diverse. Il vaginismo è una contrazione involontaria della muscolatura che rende la penetrazione difficile o impossibile, e non è una scelta né una forma di rifiuto.",
            "La distinzione conta perché cambia sia la valutazione medica sia il lavoro successivo.",
          ],
        },
        {
          heading: "Il circolo dolore–attesa–tensione",
          paragraphs: [
            "Una volta che il dolore si è presentato più volte, il corpo comincia ad anticiparlo. La muscolatura si contrae in previsione, e la contrazione produce o aumenta il dolore che stava anticipando.",
            "A quel punto esiste un secondo problema oltre a quello iniziale. Ed è il motivo per cui, anche quando la causa organica viene risolta, il dolore può persistere: il circolo si è reso indipendente dalla sua origine.",
          ],
        },
        {
          heading: "Quando entra nella coppia",
          paragraphs: [
            "L'evitamento è la conseguenza naturale, e ragionevole: si rimanda, si riducono le occasioni, l'intimità si restringe. Il partner spesso non sa come comportarsi e teme di fare male, e questa preoccupazione può aggiungere tensione invece di toglierne.",
            "Parlarne diventa difficile proprio quando servirebbe. Un incontro insieme, in alcuni casi, serve a rimettere in circolo le informazioni.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Accanto al percorso medico, non al posto suo. Il lavoro psicologico riguarda il circolo dell'attesa, il rapporto con la tensione muscolare e la riduzione graduale dell'evitamento — per gradi concordati, mai forzando.",
            "Si parte da quello che succede adesso, e le domande le faccio io. È un ambito in cui il pudore è la regola e non è un ostacolo.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Dolore durante i rapporti — psicologo e sessuologo a Milano",
        metaDescription:
          "Dispareunia e vaginismo: perché la valutazione medica viene prima, come si forma il circolo fra dolore e attesa, e come il lavoro psicologico procede accanto a quello medico.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-dolore-rapporti-en",
      _type: "subtopicPage",
      language: "en",
      title: "Painful sex",
      titleEmphasisWord: "Painful",
      parentPillar: { _type: "reference", _ref: "pillarPage-sessuali-en" },
      slug: { _type: "slug", current: "painful-sex" },
      heroKicker: "A sexual difficulty",
      standfirst: "The pain is real. Medical assessment comes first, and psychological work proceeds alongside it.",
      epigraph: "It hurts, and from expecting it my body tightens on its own.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-dolore-rapporti-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-dolore-rapporti-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-dolore-rapporti-3-en" },
      ],
      body: buildBody([
        {
          heading: "Medical assessment comes first",
          paragraphs: [
            "This is the starting point, before any other consideration. Pain during sex has organic causes that are common and treatable: infections, endometriosis, vulvovaginal atrophy, dermatological conditions, the aftermath of surgery or childbirth. In men, prostatitis and frenulum problems.",
            "None of these is ruled out by psychological interpretation. The reference point is a gynaecologist or a urologist, and in many cases that is where the path begins.",
          ],
        },
        {
          heading: "The pain is not \"in your head\"",
          paragraphs: [
            "It is worth saying explicitly, because it is what many people have been told — sometimes within healthcare itself — and what has kept them from asking for help.",
            "Pain is a real experience produced by the nervous system, regardless of where its initial cause lies. That a psychological component participates in maintaining it does not make it imaginary, and does not make the person responsible for feeling it.",
          ],
        },
        {
          heading: "The forms it takes",
          paragraphs: [
            "Dyspareunia means pain during intercourse, and it can occur at the entrance or deeper: two pictures with different causes. Vaginismus is an involuntary contraction of the musculature that makes penetration difficult or impossible, and it is neither a choice nor a form of refusal.",
            "The distinction matters because it changes both the medical assessment and the work that follows.",
          ],
        },
        {
          heading: "The pain–anticipation–tension loop",
          paragraphs: [
            "Once pain has occurred several times, the body begins anticipating it. The musculature contracts in advance, and the contraction produces or increases the pain it was anticipating.",
            "At that point there is a second problem alongside the first. It is also why pain can persist even after an organic cause has been resolved: the loop has become independent of its origin.",
          ],
        },
        {
          heading: "When it enters the couple",
          paragraphs: [
            "Avoidance is the natural and reasonable consequence: things get postponed, occasions reduce, intimacy contracts. The partner often does not know how to behave and is afraid of causing pain, and that worry can add tension rather than remove it.",
            "Talking about it becomes difficult exactly when it would help. A session together, in some cases, is what gets the information moving again.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "Alongside the medical path, not instead of it. The psychological work concerns the anticipation loop, the relationship with muscular tension, and gradually reducing avoidance — in agreed steps, never by forcing.",
            "We start from what is happening now, and I ask the questions. Reticence is the norm in this area and it is not an obstacle.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Painful sex — English-speaking psychotherapist in Milan",
        metaDescription:
          "Dyspareunia and vaginismus: why medical assessment comes first, how the loop between pain and anticipation forms, and how psychological work proceeds alongside medical care.",
        noIndex: true,
      },
    },
  },
];

const recognitionItemsIt = [
  {
    _key: "recognition-it-6",
    _type: "recognitionItem",
    label: "Eiaculazione precoce",
    quote: "Finisce troppo presto, e ormai ci penso ogni volta.",
    subtopic: { _type: "reference", _ref: "subtopicPage-eiaculazione-it" },
    isDraft: true,
  },
  {
    _key: "recognition-it-7",
    _type: "recognitionItem",
    label: "Calo del desiderio",
    quote: "Non mi viene più in mente, e non so spiegarmelo.",
    subtopic: { _type: "reference", _ref: "subtopicPage-desiderio-it" },
    isDraft: true,
  },
  {
    _key: "recognition-it-8",
    _type: "recognitionItem",
    label: "Dolore durante i rapporti",
    quote: "Fa male, e ho smesso di cercarlo.",
    subtopic: { _type: "reference", _ref: "subtopicPage-dolore-rapporti-it" },
    isDraft: true,
  },
];

const recognitionItemsEn = [
  {
    _key: "recognition-en-6",
    _type: "recognitionItem",
    label: "Premature ejaculation",
    quote: "It is over too quickly, and now I think about it every time.",
    subtopic: { _type: "reference", _ref: "subtopicPage-eiaculazione-en" },
    isDraft: true,
  },
  {
    _key: "recognition-en-7",
    _type: "recognitionItem",
    label: "Loss of desire",
    quote: "It doesn't cross my mind any more, and I can't explain it.",
    subtopic: { _type: "reference", _ref: "subtopicPage-desiderio-en" },
    isDraft: true,
  },
  {
    _key: "recognition-en-8",
    _type: "recognitionItem",
    label: "Painful sex",
    quote: "It hurts, and I have stopped seeking it out.",
    subtopic: { _type: "reference", _ref: "subtopicPage-dolore-rapporti-en" },
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

  console.log("Appending 3 recognition items to pillarPage-sessuali-it...");
  await client.patch("pillarPage-sessuali-it").insert("after", "recognition.items[-1]", recognitionItemsIt).commit();
  console.log("  done");

  console.log("Appending 3 recognition items to pillarPage-sessuali-en...");
  await client.patch("pillarPage-sessuali-en").insert("after", "recognition.items[-1]", recognitionItemsEn).commit();
  console.log("  done");

  console.log("Pillar 2 (sessuali) complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
