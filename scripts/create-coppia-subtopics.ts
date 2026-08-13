import { createClient } from "@sanity/client";
import { buildBody, faqItemDoc } from "./lib/subtopicBuilders";

// Couples pillar batch — dopo-un-tradimento, comunicazione-nella-coppia.
// Copy verbatim from contents/subtopic-coppia-trauma.md (couples section).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const faqItems = [
  faqItemDoc(
    "faqItem-tradimento-1-it",
    "it",
    "Ho bisogno di sapere tutti i dettagli?",
    "Alcune informazioni servono davvero: la portata, la durata, se ci sono conseguenze pratiche o sanitarie da affrontare. I dettagli sensoriali funzionano diversamente — tendono a diventare materiale per le immagini che tornano da sole, e ogni risposta genera una domanda nuova. Distinguere le due categorie è una delle prime cose concrete su cui si lavora.",
  ),
  faqItemDoc(
    "faqItem-tradimento-1-en",
    "en",
    "Do I need to know every detail?",
    "Some information genuinely matters: the extent, the duration, whether there are practical or health consequences to deal with. Sensory detail works differently — it tends to become material for the images that return on their own, and every answer generates a new question. Separating those two categories is one of the first concrete things the work addresses.",
  ),
  faqItemDoc(
    "faqItem-tradimento-2-it",
    "it",
    "Si può ricostruire la fiducia?",
    "Non è una domanda con una risposta generale, e chiunque ne dia una uguale per tutti sta dicendo qualcosa che non può sapere. Quello che si può dire è che dipende da cose osservabili — cosa è accaduto, cosa è accaduto prima, e cosa entrambi sono disposti a portare in una stanza. Alcune coppie proseguono, altre si separano con più chiarezza di quanta ne avrebbero avuta.",
  ),
  faqItemDoc(
    "faqItem-tradimento-2-en",
    "en",
    "Can trust be rebuilt?",
    "That is not a question with a general answer, and anyone giving one that fits everybody is saying something they cannot know. What can be said is that it depends on observable things — what happened, what was happening before, and what both people are willing to bring into a room. Some couples continue, others separate with more clarity than they would otherwise have had.",
  ),
  faqItemDoc(
    "faqItem-tradimento-3-it",
    "it",
    "Posso venire da solo, almeno all'inizio?",
    "Sì, e capita spesso: uno dei due arriva prima, a volte perché l'altro non è pronto, a volte per capire cosa vuole prima di proporre un percorso a due. Il lavoro individuale in quella fase riguarda come stai attraversando questo periodo, non la ricostruzione della relazione — che è un percorso a sé e richiede entrambi in seduta.",
  ),
  faqItemDoc(
    "faqItem-tradimento-3-en",
    "en",
    "Can I come on my own, at least to begin with?",
    "Yes, and it happens often: one person arrives first, sometimes because the other is not ready, sometimes to work out what they want before proposing anything as a pair. Individual work at that stage is about how you are getting through this period, not about rebuilding the relationship — which is a separate course of work and needs both people in the room.",
  ),
  faqItemDoc(
    "faqItem-comunicazione-1-it",
    "it",
    "Basta imparare qualche tecnica di comunicazione?",
    "Le tecniche funzionano quando il problema è la forma. Se la stessa discussione arriva ogni volta allo stesso punto, il problema è la sequenza, e una tecnica applicata dentro una sequenza invariata diventa un altro modo di arrivarci — a volte anche più rapido, perché entrambi riconoscono la formula e la leggono come artificio. Prima si guarda il processo, poi eventualmente la forma.",
  ),
  faqItemDoc(
    "faqItem-comunicazione-1-en",
    "en",
    "Isn't it enough to learn some communication techniques?",
    "Techniques work when the problem is the form. If the same argument arrives at the same place every time, the problem is the sequence, and a technique applied inside an unchanged sequence becomes another way of getting there — sometimes a faster one, because both people recognise the formula and read it as artifice. The process comes first; the form afterwards, if at all.",
  ),
  faqItemDoc(
    "faqItem-comunicazione-2-it",
    "it",
    "Uno dei due parla molto meno dell'altro. È un problema?",
    "Non in sé: le persone hanno soglie diverse su quanto parlare, e una differenza non è una disfunzione. Diventa un tema quando la differenza si irrigidisce in un ruolo — uno che porta sempre gli argomenti e uno che sempre risponde — perché a quel punto entrambi stanno recitando una posizione invece di dire cosa pensano.",
  ),
  faqItemDoc(
    "faqItem-comunicazione-2-en",
    "en",
    "One of us talks far less than the other. Is that a problem?",
    "Not in itself: people have different thresholds for how much they talk, and a difference is not a dysfunction. It becomes a subject when the difference hardens into a role — one who always brings the topics and one who always responds — because at that point both are performing a position rather than saying what they think.",
  ),
  faqItemDoc(
    "faqItem-comunicazione-3-it",
    "it",
    "Non litighiamo mai. Ha senso venire?",
    "Sì, e a volte è la situazione in cui è più utile. Il silenzio protettivo — non nominare le cose per non aprire una discussione — abbassa il conflitto e insieme riduce lo spazio comune, e lo fa gradualmente, senza un momento in cui sia evidente. Due persone che non litigano ma non hanno più niente da dirsi hanno un tema, anche se non ha la forma di un litigio.",
  ),
  faqItemDoc(
    "faqItem-comunicazione-3-en",
    "en",
    "We never argue. Is there any point coming?",
    "Yes, and sometimes it is the situation where it helps most. Protective silence — not naming things so as not to open a discussion — lowers the conflict and shrinks the shared ground with it, gradually, with no moment where it becomes obvious. Two people who do not argue but have nothing left to say to each other have a subject, even if it does not take the shape of a fight.",
  ),
];

const subtopics = [
  {
    it: {
      _id: "subtopicPage-tradimento-it",
      _type: "subtopicPage",
      language: "it",
      title: "Dopo un tradimento",
      titleEmphasisWord: "tradimento",
      parentPillar: { _type: "reference", _ref: "pillarPage-coppia-it" },
      slug: { _type: "slug", current: "dopo-un-tradimento" },
      heroKicker: "Un tema della coppia",
      standfirst:
        "La fase acuta ha un funzionamento riconoscibile, e non coincide con il momento in cui si prendono le decisioni.",
      epigraph: "Mi ripasso le date in testa tutta la notte, come se servisse a qualcosa.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-tradimento-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-tradimento-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-tradimento-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cosa succede dopo la scoperta",
          paragraphs: [
            "Le prime settimane hanno un quadro abbastanza riconoscibile, e chi lo attraversa quasi sempre pensa di essere l'unico a reagire così: immagini che tornano senza essere chiamate, bisogno di ricostruire la cronologia, controllo di telefono e spostamenti, sonno frammentato, appetito alterato.",
            "È una reazione a un evento che ha rimesso in discussione una premessa su cui era costruita la vita quotidiana. Sapere che ha una forma tipica non la rende meno faticosa, ma toglie la sensazione di stare impazzendo.",
          ],
        },
        {
          heading: "Due esperienze in parallelo",
          paragraphs: [
            "Chi ha scoperto e chi ha tradito attraversano cose diverse, e nessuna delle due è la versione facile.",
            "Da un lato c'è la perdita di una premessa, e la fatica di stare in una casa dove tutto sembra doppio. Dall'altro spesso una richiesta di essere assolto rapidamente che non trova risposta, e la difficoltà di sostenere un dolore di cui si è la causa senza trasformarlo in difesa.",
            "Quando le due esperienze non trovano un posto dove essere dette, la conversazione si riduce a un interrogatorio e a una difesa. È il punto in cui una stanza terza serve concretamente.",
          ],
        },
        {
          heading: "Le domande sui dettagli",
          paragraphs: [
            "Il bisogno di sapere tutto è quasi universale, e ha una logica: ricostruire i fatti sembra il modo di riprendere il controllo su qualcosa che è accaduto senza di te.",
            "Nella pratica funziona a metà. Alcune informazioni servono davvero — la portata, la durata, se ci sono conseguenze pratiche o sanitarie da affrontare. I dettagli sensoriali, invece, tendono a diventare materiale per le immagini intrusive, e ogni risposta ne genera una domanda nuova.",
            "Distinguere fra le due categorie è una delle cose concrete su cui si lavora nelle prime sedute.",
          ],
        },
        {
          heading: "Non decidere subito",
          paragraphs: [
            "Nella fase acuta la capacità di valutare è ridotta, per ragioni fisiologiche prima che emotive: il sonno è compromesso e l'attivazione è alta. Le decisioni prese lì sono spesso decisioni prese dalla reazione.",
            "Questo non significa restare: significa separare il momento in cui si sopravvive dal momento in cui si scegle. Chi decide di andarsene dopo, decide meglio di chi lo fa il primo giorno — e vale anche per chi decide di restare.",
          ],
        },
        {
          heading: "Cosa può fare la terapia di coppia, e cosa no",
          paragraphs: [
            "Può creare la stanza in cui le due esperienze diventano dicibili senza che una cancelli l'altra, e mettere in chiaro cosa è accaduto nella relazione prima dell'episodio — che raramente è irrilevante, e non è la stessa cosa che cercare una giustificazione.",
            "Non può stabilire chi ha ragione, e non può garantire un esito. Alcune coppie proseguono, altre si separano con più chiarezza di quanta ne avrebbero avuta altrimenti. Nessuno dei due esiti è il fallimento del percorso.",
          ],
        },
        {
          heading: "Se la coppia non continua",
          paragraphs: [
            "Il lavoro non diventa inutile. Separarsi capendo cosa è successo è diverso da separarsi nel mezzo di una reazione, e la differenza si vede negli anni successivi — nelle relazioni che seguono, e in come si racconta la propria storia.",
            "Quando è coinvolta una famiglia con figli, quella differenza riguarda anche loro.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Dopo un tradimento — terapia di coppia a Milano e Monza",
        metaDescription:
          "Cosa succede nelle settimane dopo la scoperta di un tradimento, perché non è il momento delle decisioni, e cosa può e non può fare la terapia di coppia.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-tradimento-en",
      _type: "subtopicPage",
      language: "en",
      title: "After infidelity",
      titleEmphasisWord: "infidelity",
      parentPillar: { _type: "reference", _ref: "pillarPage-coppia-en" },
      slug: { _type: "slug", current: "after-infidelity" },
      heroKicker: "A subject for couples",
      standfirst: "The acute phase has a recognisable shape, and it is not the moment when decisions get made.",
      epigraph: "I go over the dates in my head all night, as though it helped.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-tradimento-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-tradimento-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-tradimento-3-en" },
      ],
      body: buildBody([
        {
          heading: "What happens after the discovery",
          paragraphs: [
            "The first weeks have a fairly recognisable picture, and almost everyone going through it believes they are the only one reacting this way: images that return unbidden, a need to reconstruct the chronology, checking phones and movements, fragmented sleep, altered appetite.",
            "It is a reaction to an event that has called into question a premise daily life was built on. Knowing it has a typical shape does not make it lighter, but it removes the sense of losing your mind.",
          ],
        },
        {
          heading: "Two experiences in parallel",
          paragraphs: [
            "The person who discovered and the person who was unfaithful go through different things, and neither is the easy version.",
            "On one side there is the loss of a premise, and the effort of living in a house where everything looks double. On the other there is often a request to be absolved quickly that finds no answer, and the difficulty of holding a pain you caused without turning it into defence.",
            "When neither experience finds a place to be said, the conversation reduces to an interrogation and a defence. That is the point where a third room helps concretely.",
          ],
        },
        {
          heading: "The questions about details",
          paragraphs: [
            "The need to know everything is close to universal, and it has a logic: reconstructing the facts feels like the way to regain control over something that happened without you.",
            "In practice it works halfway. Some information genuinely matters — the extent, the duration, whether there are practical or health consequences to address. Sensory detail, by contrast, tends to become material for the intrusive images, and every answer generates a new question.",
            "Telling those two categories apart is one of the concrete things worked on in the early sessions.",
          ],
        },
        {
          heading: "Not deciding straight away",
          paragraphs: [
            "In the acute phase the capacity to assess is reduced, for physiological reasons before emotional ones: sleep is compromised and activation is high. Decisions made there are often decisions made by the reaction.",
            "This does not mean staying: it means separating the period in which you are surviving from the period in which you choose. People who leave later decide better than people who leave on the first day — and the same is true of those who stay.",
          ],
        },
        {
          heading: "What couples therapy can and cannot do",
          paragraphs: [
            "It can create the room where both experiences become sayable without one cancelling the other, and clarify what was happening in the relationship before the episode — which is rarely irrelevant, and is not the same thing as looking for a justification.",
            "It cannot establish who is right, and it cannot guarantee an outcome. Some couples continue, others separate with more clarity than they would otherwise have had. Neither outcome is the failure of the work.",
          ],
        },
        {
          heading: "If the couple does not continue",
          paragraphs: [
            "The work does not become pointless. Separating having understood what happened is different from separating in the middle of a reaction, and the difference shows in the years that follow — in the relationships that come next, and in how you tell your own story.",
            "Where a family with children is involved, that difference concerns them too.",
          ],
        },
      ]),
      seo: {
        metaTitle: "After infidelity — couples therapy in Milan and Monza",
        metaDescription:
          "What happens in the weeks after infidelity is discovered, why it is not the moment for decisions, and what couples therapy can and cannot do.",
        noIndex: true,
      },
    },
  },
  {
    it: {
      _id: "subtopicPage-comunicazione-it",
      _type: "subtopicPage",
      language: "it",
      title: "Comunicazione nella coppia",
      titleEmphasisWord: "Comunicazione",
      parentPillar: { _type: "reference", _ref: "pillarPage-coppia-it" },
      slug: { _type: "slug", current: "comunicazione-nella-coppia" },
      heroKicker: "Un tema della coppia",
      standfirst: "Le discussioni che si ripetono identiche non riguardano quasi mai l'argomento di cui sembrano parlare.",
      epigraph: "Litighiamo sempre per la stessa cosa, e non ricordo nemmeno come inizia.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-comunicazione-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-comunicazione-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-comunicazione-3-it" },
      ],
      body: buildBody([
        {
          heading: "Non è un problema di parole",
          paragraphs: [
            "Molte coppie arrivano dicendo che non riescono a comunicare, e quasi sempre comunicano moltissimo: si parla, si discute, si spiega di nuovo. Quello che non funziona non è la quantità.",
            "È la struttura. Un dialogo che si ripete con lo stesso esito non è un dialogo che ha bisogno di più parole — è una sequenza che ha imparato dove andare, e ci arriva ogni volta più rapidamente.",
          ],
        },
        {
          heading: "Le discussioni che si ripetono identiche",
          paragraphs: [
            "Il primo dato utile è quasi sempre questo: la coppia sa già come finirà, e a volte sa anche a che punto la conversazione girerà.",
            "Quando una discussione è prevedibile, l'argomento non la sta guidando. Si può litigare sui piatti, sui suoceri, sulle vacanze e sui soldi con la stessa curva esatta — e il fatto che la curva sia la stessa è l'informazione, non il tema.",
          ],
        },
        {
          heading: "Chi parte e chi si ritira",
          paragraphs: [
            "Uno degli schemi più documentati è asimmetrico: una persona insiste per avvicinarsi, l'altra si allontana per abbassare la tensione. Più la prima insiste, più la seconda si chiude; più la seconda si chiude, più la prima insiste.",
            "Nessuna delle due posizioni è quella sbagliata, ed è importante perché entrambe di solito arrivano convinte che lo sia l'altra. Chi insiste sta cercando contatto, chi si ritira sta cercando di non peggiorare. Il circolo non è stato costruito da nessuno dei due da solo.",
          ],
        },
        {
          heading: "Il contenuto non è l'oggetto",
          paragraphs: [
            "Sotto la discussione ci sono in genere due domande, e sono più semplici del litigio: conto per te, e posso fidarmi che resti.",
            "Quando queste domande non trovano risposta direttamente, si travestono da questioni pratiche — perché una questione pratica si può discutere, mentre chiedere se conti è esposto.",
            "Per questo risolvere il contenuto non chiude niente: la volta dopo si ripresenta con un altro argomento.",
          ],
        },
        {
          heading: "Quello che non si dice",
          paragraphs: [
            "Ci sono coppie che non litigano affatto, e non è un segno migliore. Il silenzio protettivo — non nominare le cose per non aprire una discussione — riduce il conflitto e riduce insieme lo spazio comune, e lo fa senza che nessuno se ne accorga in tempo.",
            "Quando due persone arrivano dicendo che non litigano mai ma non hanno più niente da dirsi, quello che si è ridotto non è l'affetto: è la conversazione.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Si parte da una discussione recente e concreta, ricostruita passo per passo: chi ha detto cosa, in quale momento la conversazione ha cambiato direzione, cosa ognuno stava provando in quel punto.",
            "Il lavoro sposta l'attenzione dal contenuto al processo: non chi ha ragione, ma come si arriva ogni volta allo stesso posto. È in quel passaggio che le stesse discussioni cominciano a poter finire diversamente.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Comunicazione nella coppia — terapia di coppia a Milano e Monza",
        metaDescription:
          "Perché le discussioni si ripetono identiche, lo schema fra chi insiste e chi si ritira, e cosa c'è sotto il contenuto del litigio. Come si lavora in terapia di coppia.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-comunicazione-en",
      _type: "subtopicPage",
      language: "en",
      title: "Communication in couples",
      titleEmphasisWord: "Communication",
      parentPillar: { _type: "reference", _ref: "pillarPage-coppia-en" },
      slug: { _type: "slug", current: "communication-in-couples" },
      heroKicker: "A subject for couples",
      standfirst: "Arguments that repeat identically are almost never about the subject they appear to be about.",
      epigraph: "We always argue about the same thing, and I can't even remember how it starts.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-comunicazione-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-comunicazione-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-comunicazione-3-en" },
      ],
      body: buildBody([
        {
          heading: "It is not a problem of words",
          paragraphs: [
            "Many couples arrive saying they cannot communicate, and almost always they communicate a great deal: there is talking, arguing, explaining again. What is not working is not the quantity.",
            "It is the structure. A dialogue that repeats with the same outcome does not need more words — it is a sequence that has learned where to go, and gets there faster each time.",
          ],
        },
        {
          heading: "Arguments that repeat identically",
          paragraphs: [
            "The first useful piece of information is almost always this: the couple already knows how it will end, and sometimes knows at what point the conversation will turn.",
            "When an argument is predictable, the subject is not steering it. You can argue about the dishes, the in-laws, holidays and money along exactly the same curve — and the fact that the curve is the same is the information, not the topic.",
          ],
        },
        {
          heading: "One pursues, one withdraws",
          paragraphs: [
            "One of the most documented patterns is asymmetrical: one person presses to get closer, the other moves away to lower the tension. The more the first presses, the more the second closes; the more the second closes, the more the first presses.",
            "Neither position is the wrong one, and that matters because both usually arrive convinced the other's is. The one pressing is looking for contact; the one withdrawing is trying not to make it worse. Neither built the loop alone.",
          ],
        },
        {
          heading: "The content is not the object",
          paragraphs: [
            "Underneath the argument there are usually two questions, and they are simpler than the fight: do I matter to you, and can I trust that you will stay.",
            "When those questions find no direct answer, they disguise themselves as practical matters — because a practical matter can be argued, whereas asking whether you matter is exposed.",
            "Which is why settling the content closes nothing: next time it returns wearing a different topic.",
          ],
        },
        {
          heading: "What does not get said",
          paragraphs: [
            "Some couples do not argue at all, and that is not a better sign. Protective silence — not naming things so as not to open a discussion — reduces the conflict and reduces the shared ground with it, and it does so without anyone noticing in time.",
            "When two people arrive saying they never argue but have nothing left to say to each other, what has contracted is not the affection. It is the conversation.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "We start from a recent, concrete argument, reconstructed step by step: who said what, at which point the conversation changed direction, what each of you was feeling at that moment.",
            "The work moves attention from content to process: not who is right, but how you arrive at the same place every time. It is in that shift that the same arguments start being able to end differently.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Communication in couples — couples therapy in Milan and Monza",
        metaDescription:
          "Why arguments repeat identically, the pursue-withdraw pattern, and what sits underneath the content of a fight. How couples therapy works on it.",
        noIndex: true,
      },
    },
  },
];

const recognitionItemsIt = [
  {
    _key: "recognition-it-6",
    _type: "recognitionItem",
    label: "Dopo un tradimento",
    quote: "Mi ripasso le date in testa tutta la notte.",
    subtopic: { _type: "reference", _ref: "subtopicPage-tradimento-it" },
    isDraft: true,
  },
  {
    _key: "recognition-it-7",
    _type: "recognitionItem",
    label: "Comunicazione nella coppia",
    quote: "Litighiamo sempre per la stessa cosa.",
    subtopic: { _type: "reference", _ref: "subtopicPage-comunicazione-it" },
    isDraft: true,
  },
];

const recognitionItemsEn = [
  {
    _key: "recognition-en-6",
    _type: "recognitionItem",
    label: "After infidelity",
    quote: "I go over the dates in my head all night.",
    subtopic: { _type: "reference", _ref: "subtopicPage-tradimento-en" },
    isDraft: true,
  },
  {
    _key: "recognition-en-7",
    _type: "recognitionItem",
    label: "Communication in couples",
    quote: "We always argue about the same thing.",
    subtopic: { _type: "reference", _ref: "subtopicPage-comunicazione-en" },
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

  console.log("Appending 2 recognition items to pillarPage-coppia-it...");
  await client.patch("pillarPage-coppia-it").insert("after", "recognition.items[-1]", recognitionItemsIt).commit();
  console.log("  done");

  console.log("Appending 2 recognition items to pillarPage-coppia-en...");
  await client.patch("pillarPage-coppia-en").insert("after", "recognition.items[-1]", recognitionItemsEn).commit();
  console.log("  done");

  console.log("Pillar 5 (coppia) complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
