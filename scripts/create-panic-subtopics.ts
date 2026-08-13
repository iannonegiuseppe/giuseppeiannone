import { createClient } from "@sanity/client";
import { buildBody, faqItemDoc } from "./lib/subtopicBuilders";

// Panic pillar batch — attacchi-di-panico-notturni + paura-di-perdere-il-controllo.
// Part of the fourteen-subtopic final rollout, done pillar by pillar per
// instruction. Copy verbatim from contents/subtopic-panico-due.md.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const faqItems = [
  faqItemDoc(
    "faqItem-panico-notturno-1-it",
    "it",
    "È un incubo?",
    "No. Gli incubi appartengono al sonno REM e hanno un contenuto: ci si sveglia sapendo cosa si stava sognando. Gli attacchi notturni compaiono più spesso nel sonno profondo e non hanno alcun racconto — è il corpo a svegliarsi per primo, e la mente arriva dopo, trovando un'attivazione già in corso.",
  ),
  faqItemDoc(
    "faqItem-panico-notturno-1-en",
    "en",
    "Is it a nightmare?",
    "No. Nightmares belong to REM sleep and have content: you wake knowing what you were dreaming. Nocturnal attacks appear more often in deep sleep and have no narrative at all — the body wakes first, and the mind arrives afterwards to find an activation already under way.",
  ),
  faqItemDoc(
    "faqItem-panico-notturno-2-it",
    "it",
    "Serve una valutazione medica?",
    "Sì, e in questo caso è particolarmente importante. Le apnee notturne danno risvegli bruschi con senso di soffocamento e sono frequenti e spesso non diagnosticate; anche il reflusso, alcune aritmie e i disturbi tiroidei producono quadri simili. Il primo passo è il medico di base, che valuta se serve una consulenza in un centro di medicina del sonno.",
  ),
  faqItemDoc(
    "faqItem-panico-notturno-2-en",
    "en",
    "Do I need a medical assessment?",
    "Yes, and here it particularly matters. Sleep apnoea produces abrupt awakenings with a sense of suffocation and is common and often undiagnosed; reflux, some arrhythmias and thyroid conditions produce similar pictures too. The first step is a family doctor, who can advise whether a sleep clinic assessment is needed.",
  ),
  faqItemDoc(
    "faqItem-panico-notturno-3-it",
    "it",
    "Perché di notte, se di giorno sto bene?",
    "Perché nel sonno viene meno il controllo volontario sull'attenzione, e le sensazioni corporee arrivano senza il contesto che di giorno le spiega. Non significa che di giorno non ci sia nulla: spesso una quota di attivazione resta sotto la soglia della consapevolezza e si manifesta quando le difese diurne si allentano.",
  ),
  faqItemDoc(
    "faqItem-panico-notturno-3-en",
    "en",
    "Why at night, if I am fine during the day?",
    "Because in sleep the voluntary control over attention drops away, and bodily sensations arrive without the context that explains them during the day. It does not mean there is nothing during the day: often a level of activation stays below the threshold of awareness and surfaces once the daytime defences relax.",
  ),
  faqItemDoc(
    "faqItem-perdere-controllo-1-it",
    "it",
    "Significa che sto impazzendo?",
    "La paura di impazzire è uno dei timori più frequenti durante gli attacchi di panico, e la sensazione di irrealtà che li accompagna la alimenta. Detto questo, capire cosa stia succedendo è una valutazione clinica e non qualcosa da stabilire leggendo una pagina: se il dubbio è presente, è una delle cose per cui serve un primo incontro.",
  ),
  faqItemDoc(
    "faqItem-perdere-controllo-1-en",
    "en",
    "Does this mean I am going mad?",
    "The fear of going mad is among the most common fears during panic attacks, and the sense of unreality that accompanies them feeds it. That said, working out what is actually happening is a clinical assessment rather than something to settle by reading a page: if the doubt is there, it is one of the things a first session is for.",
  ),
  faqItemDoc(
    "faqItem-perdere-controllo-2-it",
    "it",
    "Questi pensieri vogliono dire che potrei farlo davvero?",
    "I pensieri intrusivi sono contenuti che arrivano non voluti, e sono frequentemente opposti ai valori della persona che li ha. Quello che li rende insistenti non è il contenuto, ma la reazione: un pensiero interrogato e allontanato torna con più forza, perché la mente lo ha classificato come importante. È esattamente questa relazione a essere l'oggetto del lavoro.",
  ),
  faqItemDoc(
    "faqItem-perdere-controllo-2-en",
    "en",
    "Do these thoughts mean I might actually do it?",
    "Intrusive thoughts are content that arrives unbidden, and they are frequently the opposite of the values of the person having them. What makes them persistent is not the content but the response: a thought that is interrogated and pushed away returns harder, because the mind has classified it as important. That relationship is precisely what the work addresses.",
  ),
  faqItemDoc(
    "faqItem-perdere-controllo-3-it",
    "it",
    "Devo parlarne anche se mi vergogno?",
    "È l'ambito in cui il pudore è più forte, e per una ragione comprensibile: dire un pensiero fa temere di renderlo più reale. Nella pratica succede il contrario — un contenuto tenuto fuori dal discorso resta intatto. Non serve raccontare tutto subito, e le domande le faccio io: si procede al ritmo che è sostenibile.",
  ),
  faqItemDoc(
    "faqItem-perdere-controllo-3-en",
    "en",
    "Do I have to talk about it even if I am ashamed?",
    "This is the area where reticence runs strongest, and for an understandable reason: saying a thought aloud feels like making it more real. In practice the opposite happens — content kept out of the conversation stays intact. You do not need to say everything at once, and I ask the questions: the pace is whatever is sustainable.",
  ),
];

const subtopics = [
  {
    it: {
      _id: "subtopicPage-panico-notturno-it",
      _type: "subtopicPage",
      language: "it",
      title: "Attacchi di panico notturni",
      titleEmphasisWord: "notturni",
      parentPillar: { _type: "reference", _ref: "pillarPage-panic-it" },
      slug: { _type: "slug", current: "attacchi-di-panico-notturni" },
      heroKicker: "Un sottotipo del panico",
      standfirst: "Svegliarsi di colpo in allarme, senza un sogno da cui essersi svegliati.",
      epigraph: "Mi sveglio di colpo col cuore a mille e non capisco cosa mi ha svegliato.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-panico-notturno-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-panico-notturno-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-panico-notturno-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cosa sono gli attacchi di panico notturni",
          paragraphs: [
            "Sono attacchi di panico che si presentano durante il sonno: il risveglio è improvviso, il corpo è già in piena attivazione — cuore accelerato, respiro corto, sudorazione — e non c'è un contenuto mentale da cui essersi spaventati.",
            "È questa assenza a renderli particolarmente disorientanti. Di giorno un attacco arriva almeno dentro una situazione; di notte arriva dal sonno, e la mancanza di una causa visibile diventa essa stessa un motivo di allarme.",
          ],
        },
        {
          heading: "Perché succede nel sonno",
          paragraphs: [
            "Non è un incubo. Gli incubi appartengono al sonno REM e hanno un racconto: ci si sveglia sapendo cosa si stava sognando. Gli attacchi notturni compaiono più spesso nelle fasi di sonno profondo, senza alcun contenuto onirico.",
            "Quello che si sveglia prima è il corpo. La mente arriva dopo, trova un'attivazione già in corso e prova a spiegarla — e la spiegazione peggiore, di notte, è sempre a portata di mano.",
          ],
        },
        {
          heading: "Il risveglio e la paura di riaddormentarsi",
          paragraphs: [
            "Dopo il primo episodio cambia qualcosa che non riguarda la notte in cui è avvenuto, ma tutte le successive: andare a dormire smette di essere neutro.",
            "Molte persone raccontano di rimandare il momento di coricarsi, di tenere una luce accesa, di controllare il battito prima di chiudere gli occhi. Sono comportamenti che danno sollievo immediato e che mantengono il livello di allerta esattamente dove non serve.",
          ],
        },
        {
          heading: "Cosa va escluso prima",
          paragraphs: [
            "La valutazione medica viene prima, e in questo caso più che in altri. Le apnee notturne producono risvegli bruschi con senso di soffocamento e sono frequenti e spesso non diagnosticate. Anche il reflusso, alcune aritmie e disturbi tiroidei danno quadri sovrapponibili.",
            "Il pavor nocturnus è un'altra cosa ancora: chi lo vive di solito non ricorda l'episodio al mattino, mentre di un attacco di panico notturno si ricorda tutto.",
            "Distinguere non è un'operazione psicologica. Il primo passo è il medico di base, che valuta se serve una consulenza in un centro di medicina del sonno.",
          ],
        },
        {
          heading: "Il circolo con l'insonnia",
          paragraphs: [
            "Quando gli accertamenti sono stati fatti e gli episodi restano, si instaura spesso un secondo problema: la difficoltà ad addormentarsi. La stanchezza che ne deriva abbassa la soglia, e una soglia più bassa rende gli episodi più probabili.",
            "A quel punto ci sono due cose da affrontare, e conviene sapere quale delle due si sta trattando in un dato momento.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Si comincia da cosa succede nella mezz'ora prima di dormire e nei minuti immediatamente successivi a un risveglio — non dall'episodio in sé, che è breve, ma da quello che lo circonda.",
            "Poi si lavora sulla riduzione graduale dei comportamenti di controllo e sulla lettura delle sensazioni corporee, che è il punto in cui un risveglio smette di trasformarsi in un attacco.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Attacchi di panico notturni — psicologo a Milano e Monza",
        metaDescription:
          "Attacchi di panico nel sonno: perché non sono incubi, cosa va escluso con una valutazione medica, e come si lavora sul risveglio e sulla paura di riaddormentarsi.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-panico-notturno-en",
      _type: "subtopicPage",
      language: "en",
      title: "Nocturnal panic attacks",
      titleEmphasisWord: "Nocturnal",
      parentPillar: { _type: "reference", _ref: "pillarPage-panic-en" },
      slug: { _type: "slug", current: "nocturnal-panic-attacks" },
      heroKicker: "A form of panic",
      standfirst: "Waking abruptly in full alarm, with no dream to have woken from.",
      epigraph: "I wake up suddenly with my heart racing and I have no idea what woke me.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-panico-notturno-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-panico-notturno-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-panico-notturno-3-en" },
      ],
      body: buildBody([
        {
          heading: "What nocturnal panic attacks are",
          paragraphs: [
            "They are panic attacks that occur during sleep: the waking is abrupt, the body is already fully activated — racing heart, short breath, sweating — and there is no mental content to have been frightened by.",
            "That absence is what makes them so disorienting. During the day an attack at least arrives inside a situation; at night it arrives out of sleep, and the missing cause becomes a reason for alarm in itself.",
          ],
        },
        {
          heading: "Why it happens in sleep",
          paragraphs: [
            "It is not a nightmare. Nightmares belong to REM sleep and have a narrative: you wake knowing what you were dreaming. Nocturnal attacks appear more often in deep sleep, with no dream content at all.",
            "What wakes first is the body. The mind arrives afterwards, finds an activation already under way, and tries to explain it — and at night the worst available explanation is never far off.",
          ],
        },
        {
          heading: "The waking, and the fear of going back to sleep",
          paragraphs: [
            "After the first episode something changes that has nothing to do with the night it happened and everything to do with all the ones after: going to bed stops being neutral.",
            "People describe putting off bedtime, leaving a light on, checking their pulse before closing their eyes. These bring immediate relief and hold the level of alertness exactly where it is least useful.",
          ],
        },
        {
          heading: "What has to be ruled out first",
          paragraphs: [
            "Medical assessment comes first, and in this case more than in others. Sleep apnoea produces abrupt awakenings with a sense of suffocation, and it is common and often undiagnosed. Reflux, some arrhythmias and thyroid conditions also produce overlapping pictures.",
            "Night terrors are a different thing again: people who have them usually do not remember the episode in the morning, whereas a nocturnal panic attack is remembered in full.",
            "Telling these apart is not a psychological task. The first step is a family doctor, who can advise whether a sleep clinic assessment is needed.",
          ],
        },
        {
          heading: "The loop with insomnia",
          paragraphs: [
            "Once the investigations are done and the episodes remain, a second problem often sets in: difficulty falling asleep. The tiredness that follows lowers the threshold, and a lower threshold makes episodes more likely.",
            "At that point there are two things to address, and it helps to know which one is being treated at any given moment.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "We start from what happens in the half hour before sleep and in the minutes immediately after waking — not from the episode itself, which is brief, but from what surrounds it.",
            "Then we work on gradually reducing the checking behaviours, and on how bodily sensations get read, which is the point at which a waking stops turning into an attack.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Nocturnal panic attacks — English-speaking psychotherapist in Milan",
        metaDescription:
          "Panic attacks in sleep: why they are not nightmares, what a medical assessment needs to rule out, and how the work addresses waking and the fear of falling asleep again.",
        noIndex: true,
      },
    },
  },
  {
    it: {
      _id: "subtopicPage-perdere-controllo-it",
      _type: "subtopicPage",
      language: "it",
      title: "Paura di perdere il controllo",
      titleEmphasisWord: "controllo",
      parentPillar: { _type: "reference", _ref: "pillarPage-panic-it" },
      slug: { _type: "slug", current: "paura-di-perdere-il-controllo" },
      heroKicker: "Un sottotipo del panico",
      standfirst: "Il timore non riguarda quello che sta accadendo, ma quello che potresti fare o diventare.",
      epigraph: "Ho paura di impazzire, e più ci penso più mi sembra vicino.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-perdere-controllo-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-perdere-controllo-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-perdere-controllo-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cos'è la paura di perdere il controllo",
          paragraphs: [
            "Negli attacchi di panico la paura ha spesso un oggetto preciso, e non è sempre il malore fisico. Per molte persone è un'altra cosa: impazzire, svenire in pubblico, fare qualcosa di irreparabile, non riconoscersi più.",
            "Il tratto comune è che il timore non riguarda il presente. Riguarda un momento immediatamente successivo — quello in cui qualcosa cederebbe.",
          ],
        },
        {
          heading: "Le forme che prende",
          paragraphs: [
            "Il timore di impazzire, spesso legato alla sensazione di irrealtà che accompagna il panico. La paura di svenire, che nasce dall'iperventilazione e dalle vertigini che produce. Il timore di morire, con l'attenzione fissa sul battito. E la forma più difficile da raccontare: il pensiero di poter fare del male a sé o a qualcun altro.",
            "Quest'ultima è quella di cui si parla meno, e quasi sempre per lo stesso motivo: chi la vive teme che dirla la renda più vera.",
          ],
        },
        {
          heading: "Perché la mente produce quei pensieri",
          paragraphs: [
            "I pensieri intrusivi sono un fenomeno diffuso: contenuti che arrivano non voluti, spesso opposti ai propri valori. Non riflettono un'intenzione, e non predicono un comportamento.",
            "Quello che li rende insistenti è la reazione. Un pensiero a cui non si dà peso passa; un pensiero che viene interrogato, controllato e allontanato torna con più forza, perché la mente lo ha classificato come importante.",
          ],
        },
        {
          heading: "Il controllo che aumenta il problema",
          paragraphs: [
            "Le strategie sono comprensibili e tutte hanno lo stesso effetto: controllare le sensazioni per accorgersi in tempo, evitare le situazioni in cui cedere sarebbe più grave, cercare rassicurazione su di essere una persona normale.",
            "Ognuna dà sollievo per qualche ora. Ognuna insegna al sistema che la minaccia era reale e che senza quel controllo non si può stare tranquilli. È il meccanismo, non un difetto di volontà.",
          ],
        },
        {
          heading: "Cosa va escluso prima",
          paragraphs: [
            "La valutazione medica viene prima, come per qualsiasi quadro con sintomi corporei intensi.",
            "E c'è un secondo punto che merita chiarezza: distinguere la paura di perdere il controllo da un disturbo di altro tipo è una valutazione clinica, non un'autodiagnosi da fare leggendo. Se il dubbio è forte, va portato a un professionista — che è anche una delle cose per cui serve il primo incontro.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Si comincia dal contenuto specifico del tuo timore, perché la forma cambia il lavoro: la paura di svenire e quella di fare del male non si affrontano nello stesso modo.",
            "Poi si lavora sulla relazione con quei pensieri — sul cosa fai quando arrivano — più che sul loro contenuto. E gradualmente sulla riduzione del controllo, che è la parte che restituisce margine.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Paura di perdere il controllo — psicologo a Milano e Monza",
        metaDescription:
          "Paura di impazzire, di svenire o di fare qualcosa di irreparabile durante un attacco di panico: perché la mente produce quei pensieri e come si lavora.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-perdere-controllo-en",
      _type: "subtopicPage",
      language: "en",
      title: "Fear of losing control",
      titleEmphasisWord: "control",
      parentPillar: { _type: "reference", _ref: "pillarPage-panic-en" },
      slug: { _type: "slug", current: "fear-of-losing-control" },
      heroKicker: "A form of panic",
      standfirst: "The fear is not about what is happening, but about what you might do or become.",
      epigraph: "I am afraid of going mad, and the more I think about it the closer it seems.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-perdere-controllo-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-perdere-controllo-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-perdere-controllo-3-en" },
      ],
      body: buildBody([
        {
          heading: "What the fear of losing control is",
          paragraphs: [
            "In panic attacks the fear often has a specific object, and it is not always physical collapse. For many people it is something else: going mad, fainting in public, doing something irreparable, no longer recognising themselves.",
            "What these share is that the fear is not about the present. It is about the moment immediately after — the one in which something would give way.",
          ],
        },
        {
          heading: "The forms it takes",
          paragraphs: [
            "The fear of going mad, often tied to the sense of unreality that accompanies panic. The fear of fainting, which comes from hyperventilation and the dizziness it produces. The fear of dying, with attention fixed on the heartbeat. And the form hardest to say out loud: the thought of being able to harm yourself or someone else.",
            "That last one is the least talked about, and almost always for the same reason: people who have it fear that saying it makes it truer.",
          ],
        },
        {
          heading: "Why the mind produces those thoughts",
          paragraphs: [
            "Intrusive thoughts are a widespread phenomenon: content that arrives unbidden, often directly opposed to a person's own values. They do not reflect intention, and they do not predict behaviour.",
            "What makes them persistent is the response to them. A thought given no weight passes; a thought that gets interrogated, monitored and pushed away comes back harder, because the mind has now classified it as important.",
          ],
        },
        {
          heading: "The control that enlarges the problem",
          paragraphs: [
            "The strategies are understandable and they all have the same effect: monitoring sensations in order to notice in time, avoiding situations where giving way would be worse, seeking reassurance about being a normal person.",
            "Each brings relief for a few hours. Each teaches the system that the threat was real and that without the monitoring you cannot be at ease. That is the mechanism, not a failure of will.",
          ],
        },
        {
          heading: "What has to be ruled out first",
          paragraphs: [
            "Medical assessment comes first, as with any picture involving intense bodily symptoms.",
            "And there is a second point worth stating plainly: distinguishing a fear of losing control from a condition of another kind is a clinical assessment, not a self-diagnosis to be made by reading. If the doubt is strong, it belongs with a professional — which is among the things a first session is for.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "We start from the specific content of your fear, because the form changes the work: fear of fainting and fear of causing harm are not approached the same way.",
            "Then the work is on your relationship with those thoughts — on what you do when they arrive — rather than on their content. And gradually on reducing the monitoring, which is the part that gives room back.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Fear of losing control — English-speaking psychotherapist in Milan",
        metaDescription:
          "Fear of going mad, fainting or doing something irreparable during a panic attack: why the mind produces those thoughts, and how the work proceeds.",
        noIndex: true,
      },
    },
  },
];

const recognitionItemsIt = [
  {
    _key: "recognition-it-6",
    _type: "recognitionItem",
    label: "Attacchi di panico notturni",
    quote: "Mi sveglio di colpo col cuore a mille, senza sapere perché.",
    subtopic: { _type: "reference", _ref: "subtopicPage-panico-notturno-it" },
    isDraft: true,
  },
  {
    _key: "recognition-it-7",
    _type: "recognitionItem",
    label: "Paura di perdere il controllo",
    quote: "Ho paura di impazzire da un momento all'altro.",
    subtopic: { _type: "reference", _ref: "subtopicPage-perdere-controllo-it" },
    isDraft: true,
  },
];

const recognitionItemsEn = [
  {
    _key: "recognition-en-6",
    _type: "recognitionItem",
    label: "Nocturnal panic attacks",
    quote: "I wake up suddenly with my heart racing, and I don't know why.",
    subtopic: { _type: "reference", _ref: "subtopicPage-panico-notturno-en" },
    isDraft: true,
  },
  {
    _key: "recognition-en-7",
    _type: "recognitionItem",
    label: "Fear of losing control",
    quote: "I am afraid of losing my mind at any moment.",
    subtopic: { _type: "reference", _ref: "subtopicPage-perdere-controllo-en" },
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

  console.log("Appending 2 recognition items to pillarPage-panic-it...");
  await client.patch("pillarPage-panic-it").insert("after", "recognition.items[-1]", recognitionItemsIt).commit();
  console.log("  done");

  console.log("Appending 2 recognition items to pillarPage-panic-en...");
  await client.patch("pillarPage-panic-en").insert("after", "recognition.items[-1]", recognitionItemsEn).commit();
  console.log("  done");

  console.log("Pillar 1 (panic) complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
