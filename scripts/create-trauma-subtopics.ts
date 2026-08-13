import { createClient } from "@sanity/client";
import { buildBody, faqItemDoc } from "./lib/subtopicBuilders";

// Trauma pillar batch (final pillar) — trauma-infantile, lutto-e-perdita,
// trauma-relazionale. Copy verbatim from contents/subtopic-coppia-trauma.md
// (trauma section), including the "four published works" sentence in
// trauma-infantile's closing section — the source's own note asks the site
// owner to verify that claim against the CV before publish; not something
// to alter here (task says insert verbatim, flag only).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const faqItems = [
  faqItemDoc(
    "faqItem-trauma-infantile-1-it",
    "it",
    "Non ricordo bene quel periodo. Si può lavorare comunque?",
    "Sì. I ricordi frammentari o le lacune sono coerenti con il modo in cui la memoria funziona sotto attivazione prolungata, e non sono un ostacolo: il lavoro non parte dalla ricostruzione dei fatti ma da come stai adesso. Quello che riguarda il passato arriva nella misura in cui serve a spiegare il presente.",
  ),
  faqItemDoc(
    "faqItem-trauma-infantile-1-en",
    "en",
    "I don't remember that period well. Can we still work on it?",
    "Yes. Fragmentary memories or gaps are consistent with how memory works under prolonged activation, and they are not an obstacle: the work does not begin with reconstructing facts but with how you are now. What concerns the past arrives to the extent that it explains the present.",
  ),
  faqItemDoc(
    "faqItem-trauma-infantile-2-it",
    "it",
    "Riguarda solo gli abusi?",
    "No. Rientrano anche le forme senza un episodio da raccontare: un ambiente imprevedibile, un genitore emotivamente non disponibile, la svalutazione ripetuta, il dover gestire gli stati d'animo degli adulti. Sono spesso le più difficili da riconoscere dall'interno, perché se quell'ambiente era l'unico che conoscevi non hai un termine di paragone.",
  ),
  faqItemDoc(
    "faqItem-trauma-infantile-2-en",
    "en",
    "Is this only about abuse?",
    "No. It also includes the forms with no episode to recount: an unpredictable environment, an emotionally unavailable parent, repeated dismissal, having to manage adults' moods. These are often the hardest to recognise from the inside, because if that environment was the only one you knew, you have nothing to compare it against.",
  ),
  faqItemDoc(
    "faqItem-trauma-infantile-3-it",
    "it",
    "Devo affrontare i miei genitori?",
    "Non è una condizione del lavoro, e non è una decisione che prendo io. Alcune persone arrivano a volerlo fare, altre no, e in entrambi i casi il percorso funziona: l'oggetto è come quel funzionamento agisce nella tua vita adesso, non un chiarimento con qualcuno. Se la questione emerge, si guarda cosa ti aspetti che produca.",
  ),
  faqItemDoc(
    "faqItem-trauma-infantile-3-en",
    "en",
    "Do I have to confront my parents?",
    "It is not a condition of the work, and it is not my decision. Some people come to want it, others do not, and the work functions either way: the object is how that pattern operates in your life now, not a reckoning with someone. If the question comes up, we look at what you expect it to produce.",
  ),
  faqItemDoc(
    "faqItem-lutto-1-it",
    "it",
    "Esistono le fasi del lutto?",
    "Il modello delle cinque fasi era stato descritto osservando persone di fronte alla propria morte, non persone in lutto, e non è mai stato un percorso da attraversare in ordine. La ricerca successiva descrive oscillazioni: giorni in cui il dolore è pieno e giorni in cui è assente, senza una sequenza prevista. Aspettarsi le fasi porta spesso a giudicarsi per non provarle nell'ordine giusto.",
  ),
  faqItemDoc(
    "faqItem-lutto-1-en",
    "en",
    "Are there stages of grief?",
    "The five-stages model was described by observing people facing their own death, not people in grief, and it was never a sequence to be worked through in order. Later research describes oscillation: days when the pain is full and days when it is absent, with no prescribed order. Expecting stages often leads people to judge themselves for not feeling them in the right sequence.",
  ),
  faqItemDoc(
    "faqItem-lutto-2-it",
    "it",
    "Dopo quanto tempo dovrei sentirmi meglio?",
    "Non c'è una risposta, e chiunque ne dia una precisa sta dicendo qualcosa che non può sapere. Il criterio non è temporale ma funzionale: la domanda utile non è quanto tempo è passato, ma se qualcosa si sta muovendo. Un lutto può occupare anni senza essere bloccato, e bloccarsi dopo pochi mesi.",
  ),
  faqItemDoc(
    "faqItem-lutto-2-en",
    "en",
    "How long before I should feel better?",
    "There is no answer, and anyone giving a precise one is saying something they cannot know. The criterion is functional rather than temporal: the useful question is not how much time has passed but whether anything is moving. Grief can occupy years without being stuck, and can get stuck within months.",
  ),
  faqItemDoc(
    "faqItem-lutto-3-it",
    "it",
    "Serve un percorso, o passa da sé?",
    "Nella maggior parte dei casi le persone attraversano un lutto con le proprie risorse e con quelle di chi hanno intorno, e non serve un intervento clinico. Quello che rende utile un percorso non è l'intensità del dolore: è la sensazione che qualcosa si sia fermato — un evitamento, una colpa, una vita organizzata per non toccare un punto.",
  ),
  faqItemDoc(
    "faqItem-lutto-3-en",
    "en",
    "Do I need therapy, or will it pass on its own?",
    "In most cases people get through grief with their own resources and those of the people around them, and no clinical intervention is needed. What makes a course of work useful is not the intensity of the pain: it is the sense that something has stopped — an avoidance, a guilt, a life organised around not touching a particular point.",
  ),
  faqItemDoc(
    "faqItem-trauma-relazionale-1-it",
    "it",
    "In cosa è diverso da un trauma singolo?",
    "Non nella gravità, ma nel terreno. In un evento esterno le relazioni restano la risorsa a cui appoggiarsi; quando la fonte del danno è stata una relazione, quel terreno è lo stesso che serve per riprendersi. È il motivo per cui il lavoro dedica tempo alla base prima di arrivare al racconto.",
  ),
  faqItemDoc(
    "faqItem-trauma-relazionale-1-en",
    "en",
    "How is this different from a single traumatic event?",
    "Not in severity, but in the ground. With an external event, relationships remain the resource to lean on; when the source of the harm was a relationship, that ground is the same one recovery depends on. It is why the work spends time on the base before arriving at the account.",
  ),
  faqItemDoc(
    "faqItem-trauma-relazionale-2-it",
    "it",
    "Perché fatico a fidarmi di chi non ha fatto niente?",
    "Perché la reazione precede la valutazione: si arriva già in allarme, e la spiegazione si cerca dopo. Non è un giudizio sulla persona che hai davanti, ed è coerente con un ambiente in cui accorgersi in tempo era necessario. Il lavoro riguarda la distinzione fra i segnali di allora e quelli di adesso.",
  ),
  faqItemDoc(
    "faqItem-trauma-relazionale-2-en",
    "en",
    "Why do I struggle to trust people who have done nothing?",
    "Because the reaction precedes the assessment: you arrive already in alarm, and the explanation gets looked for afterwards. It is not a judgement about the person in front of you, and it is consistent with an environment where noticing in time was necessary. The work is about distinguishing the signals of then from those of now.",
  ),
  faqItemDoc(
    "faqItem-trauma-relazionale-3-it",
    "it",
    "Si può lavorare senza rivivere tutto?",
    "Il lavoro non parte dal racconto e non lo richiede come prerequisito. Si comincia da come funziona adesso — dove si attiva, cosa fai quando si attiva — e quello che riguarda il passato arriva quando c'è una base per sostenerlo. Il ritmo lo stabiliamo insieme, ed è una delle cose su cui il primo incontro serve a mettersi d'accordo.",
  ),
  faqItemDoc(
    "faqItem-trauma-relazionale-3-en",
    "en",
    "Can we work on it without reliving everything?",
    "The work does not start from the account and does not require it as a prerequisite. We begin from how it functions now — where it activates, what you do when it does — and what concerns the past arrives when there is a base to hold it. The pace is set together, and it is one of the things a first session is for agreeing on.",
  ),
];

const subtopics = [
  {
    it: {
      _id: "subtopicPage-trauma-infantile-it",
      _type: "subtopicPage",
      language: "it",
      title: "Trauma infantile",
      titleEmphasisWord: "infantile",
      parentPillar: { _type: "reference", _ref: "pillarPage-trauma-it" },
      slug: { _type: "slug", current: "trauma-infantile" },
      heroKicker: "Un tema del trauma",
      standfirst: "Quello che accade quando si è piccoli non lascia sempre un ricordo. Spesso lascia un modo di funzionare.",
      epigraph: "Da bambino ho imparato a non chiedere niente, e adesso non so più come si fa.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-trauma-infantile-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-trauma-infantile-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-trauma-infantile-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cosa si intende",
          paragraphs: [
            "Non solo gli eventi che hanno un nome. Rientrano qui le esperienze che nessuno ha registrato come accadimenti: un ambiente imprevedibile, un genitore emotivamente non disponibile, la responsabilità di gestire gli stati d'animo degli adulti, la svalutazione ripetuta, il dover essere invisibili per non creare problemi.",
            "La differenza rispetto a un evento singolo è che qui il contesto è il fatto. Non c'è un giorno da raccontare, e proprio per questo molte persone arrivano convinte di non averne diritto.",
          ],
        },
        {
          heading: "Le forme cumulative",
          paragraphs: [
            "Sono quelle più difficili da riconoscere dall'interno, per un motivo semplice: se un ambiente è stato l'unico che conoscevi, non hai un termine di paragone.",
            "Il segnale arriva spesso dall'esterno e in età adulta — la sorpresa nel vedere come funziona un'altra famiglia, la reazione di qualcuno a un racconto che tu avevi sempre considerato normale.",
          ],
        },
        {
          heading: "Perché emerge da adulti",
          paragraphs: [
            "Un modo di funzionare costruito da bambini è stato una soluzione, non un difetto: anticipare gli stati d'animo, non chiedere, occuparsi degli altri prima di sé sono strategie che in quel contesto funzionavano.",
            "Diventano un problema quando il contesto cambia e la strategia resta. Molte persone arrivano dopo un evento recente — una relazione stabile, la nascita di un figlio, una posizione di responsabilità — che ha richiesto qualcosa che quella strategia non sa fare.",
          ],
        },
        {
          heading: "Cosa resta nel corpo e nella memoria",
          paragraphs: [
            "I ricordi di quel periodo sono spesso frammentari: immagini isolate, sensazioni senza racconto, o buchi che sorprendono. Non è un difetto di attenzione, ed è coerente con il modo in cui la memoria funziona sotto attivazione prolungata.",
            "Quello che si conserva meglio non è il contenuto ma la risposta: l'allarme che si accende su un tono di voce, la tensione che compare in situazioni che oggi non lo giustificano.",
          ],
        },
        {
          heading: "Non serve un ricordo nitido",
          paragraphs: [
            "È il timore più frequente in chi valuta se cominciare: pensare di non avere abbastanza materiale.",
            "Il lavoro non parte dalla ricostruzione dei fatti. Parte da come stai adesso — cosa succede nella vita quotidiana, cosa eviti, cosa si attiva e quando. Quello che riguarda il passato arriva nella misura in cui serve a spiegare il presente, e non oltre.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Prima si costruisce una base: capire il funzionamento attuale e stabilizzare quello che va stabilizzato. Il racconto arriva quando c'è di che sostenerlo, ed è una delle ragioni per cui il ritmo lo si stabilisce insieme.",
            "Il trauma infantile è anche l'ambito in cui ho svolto attività di ricerca: quattro dei lavori che ho pubblicato riguardano questo tema. Non è una garanzia di risultato — è il motivo per cui è un terreno che conosco da più di un lato.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Trauma infantile — psicologo e psicoterapeuta a Milano",
        metaDescription:
          "Trauma infantile e forme cumulative: perché emerge in età adulta, cosa resta nella memoria e nel corpo, e perché non serve un ricordo nitido per cominciare.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-trauma-infantile-en",
      _type: "subtopicPage",
      language: "en",
      title: "Childhood trauma",
      titleEmphasisWord: "Childhood",
      parentPillar: { _type: "reference", _ref: "pillarPage-trauma-en" },
      slug: { _type: "slug", current: "childhood-trauma" },
      heroKicker: "A subject within trauma",
      standfirst: "What happens when you are small does not always leave a memory. Often it leaves a way of functioning.",
      epigraph: "As a child I learned not to ask for anything, and now I no longer know how.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-trauma-infantile-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-trauma-infantile-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-trauma-infantile-3-en" },
      ],
      body: buildBody([
        {
          heading: "What is meant by it",
          paragraphs: [
            "Not only the events that have a name. It includes experiences nobody registered as happenings: an unpredictable environment, a parent who was emotionally unavailable, responsibility for managing adults' moods, repeated dismissal, having to be invisible so as not to cause trouble.",
            "What separates this from a single event is that here the context is the fact. There is no day to recount, and precisely for that reason many people arrive convinced they have no claim on the subject.",
          ],
        },
        {
          heading: "Cumulative forms",
          paragraphs: [
            "These are the hardest to recognise from the inside, for a simple reason: if an environment was the only one you knew, you have nothing to compare it against.",
            "The signal often arrives from outside and in adulthood — the surprise of seeing how another family works, or someone's reaction to a story you had always considered ordinary.",
          ],
        },
        {
          heading: "Why it surfaces in adulthood",
          paragraphs: [
            "A way of functioning built in childhood was a solution rather than a defect: anticipating moods, not asking, attending to others before yourself are strategies that worked in that context.",
            "They become a problem when the context changes and the strategy stays. Many people arrive after a recent event — a stable relationship, the birth of a child, a position of responsibility — that required something the strategy does not know how to do.",
          ],
        },
        {
          heading: "What remains in the body and in memory",
          paragraphs: [
            "Memories from that period are often fragmentary: isolated images, sensations with no narrative, or gaps that come as a surprise. This is not a failure of attention, and it is consistent with how memory works under prolonged activation.",
            "What is preserved better is not the content but the response: the alarm that goes off at a tone of voice, the tension that appears in situations that do not warrant it today.",
          ],
        },
        {
          heading: "You do not need a clear memory",
          paragraphs: [
            "It is the most frequent worry among people weighing up whether to start: thinking they do not have enough material.",
            "The work does not begin with reconstructing the facts. It begins with how you are now — what happens day to day, what you avoid, what activates and when. What concerns the past arrives to the extent that it explains the present, and no further.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "First a base gets built: understanding how things function now, and stabilising what needs stabilising. The account arrives when there is something to hold it, which is among the reasons the pace is set together.",
            "Childhood trauma is also the field in which I have carried out research: four of my published works concern this subject. That is not a guarantee of anything — it is why this is ground I know from more than one side.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Childhood trauma — English-speaking psychotherapist in Milan",
        metaDescription:
          "Childhood trauma and its cumulative forms: why it surfaces in adulthood, what remains in memory and in the body, and why a clear memory is not needed to begin.",
        noIndex: true,
      },
    },
  },
  {
    it: {
      _id: "subtopicPage-lutto-it",
      _type: "subtopicPage",
      language: "it",
      title: "Lutto e perdita",
      titleEmphasisWord: "Lutto",
      parentPillar: { _type: "reference", _ref: "pillarPage-trauma-it" },
      slug: { _type: "slug", current: "lutto-e-perdita" },
      heroKicker: "Un tema del trauma",
      standfirst: "Il lutto non è un disturbo, e non ha un calendario. Ci sono però situazioni in cui si blocca.",
      epigraph: "Sono passati due anni e tutti si aspettano che io sia andata avanti.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-lutto-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-lutto-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-lutto-3-it" },
      ],
      body: buildBody([
        {
          heading: "Il lutto non è un disturbo",
          paragraphs: [
            "È una risposta ordinaria a una perdita, e nella maggior parte dei casi non richiede un intervento clinico. Le persone attraversano un lutto con le proprie risorse e con quelle di chi hanno intorno, e questo va detto prima di qualsiasi altra cosa.",
            "Quello che rende utile un percorso non è l'intensità del dolore. È il blocco: quando qualcosa si è fermato e non si muove più, in una direzione o nell'altra.",
          ],
        },
        {
          heading: "Non ci sono fasi",
          paragraphs: [
            "Il modello delle cinque fasi è la cosa più citata e la più fraintesa: era stato descritto osservando persone di fronte alla propria morte, non persone in lutto, e non è mai stato un percorso da attraversare in ordine.",
            "La ricerca successiva descrive qualcosa di diverso: oscillazioni. Giorni in cui il dolore è pieno e giorni in cui è assente, e l'alternanza non è un tradimento — è il funzionamento.",
            "Chi si aspetta le fasi finisce per giudicarsi due volte: per il dolore, e per il fatto di non provarlo nell'ordine previsto.",
          ],
        },
        {
          heading: "Quando si complica",
          paragraphs: [
            "Ci sono situazioni in cui la traiettoria non si muove: la vita rimane organizzata intorno all'assenza a distanza di anni, con stanze intatte e routine congelate. Oppure il contrario — l'assenza di qualsiasi reazione, non come forza, ma come qualcosa che non è ancora arrivato.",
            "Anche l'evitamento di tutto ciò che ricorda, o un senso di colpa che non trova un fondo, sono segnali che vale la pena guardare.",
            "Non c'è una data oltre la quale un lutto è troppo lungo. Il criterio è funzionale, non temporale.",
          ],
        },
        {
          heading: "I lutti che nessuno riconosce",
          paragraphs: [
            "Alcune perdite non ricevono un rito né un permesso: un aborto spontaneo, un animale, un rapporto interrotto con qualcuno che è ancora vivo, la fine di una possibilità — una diagnosi, un progetto, un paese lasciato.",
            "Poi ci sono le perdite ambigue, dove non c'è un momento in cui è finito: una persona con una demenza, una relazione che si dissolve senza dichiarazioni.",
            "Quando intorno non c'è un riconoscimento, il dolore resta senza posto, e senza posto è più difficile che si muova.",
          ],
        },
        {
          heading: "Quello che gli altri dicono",
          paragraphs: [
            "\"Era anziano\", \"adesso non soffre più\", \"devi essere forte\", \"il tempo aggiusta tutto\". Chi le dice vuole aiutare, e quasi sempre sta gestendo il proprio disagio davanti a un dolore che non può risolvere.",
            "L'effetto è che si smette di parlarne, e il silenzio arriva proprio nel periodo in cui la rete intorno si assottiglia — dopo le prime settimane, quando tutti tornano alla propria vita.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Non per superare, e non per chiudere. Si parte da dove il movimento si è fermato e da cosa lo tiene fermo: un evitamento, una colpa, qualcosa che non è stato detto, o una vita che si è organizzata per non toccare il punto.",
            "Non c'è nulla da liquidare. Il lavoro riguarda il fare posto — a quello che è stato e a quello che continua ad esserci.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Lutto e perdita — psicologo a Milano e Monza",
        metaDescription:
          "Perché il lutto non è un disturbo e non ha fasi, quando la traiettoria si blocca, e i lutti che non ricevono riconoscimento. Come si lavora.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-lutto-en",
      _type: "subtopicPage",
      language: "en",
      title: "Grief and loss",
      titleEmphasisWord: "Grief",
      parentPillar: { _type: "reference", _ref: "pillarPage-trauma-en" },
      slug: { _type: "slug", current: "grief-and-loss" },
      heroKicker: "A subject within trauma",
      standfirst: "Grief is not a disorder, and it has no calendar. There are, though, situations where it gets stuck.",
      epigraph: "It has been two years and everyone expects me to have moved on.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-lutto-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-lutto-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-lutto-3-en" },
      ],
      body: buildBody([
        {
          heading: "Grief is not a disorder",
          paragraphs: [
            "It is an ordinary response to a loss, and in most cases it does not call for clinical intervention. People get through grief with their own resources and those of the people around them, and that belongs before anything else.",
            "What makes a course of work useful is not the intensity of the pain. It is being stuck: when something has stopped and no longer moves, in either direction.",
          ],
        },
        {
          heading: "There are no stages",
          paragraphs: [
            "The five-stages model is the most quoted and the most misunderstood: it was described by observing people facing their own death, not people in grief, and it was never a sequence to be worked through in order.",
            "Later research describes something different: oscillation. Days when the pain is full and days when it is absent, and the alternation is not a betrayal — it is how it works.",
            "People expecting stages end up judging themselves twice: for the pain, and for not feeling it in the prescribed order.",
          ],
        },
        {
          heading: "When it gets complicated",
          paragraphs: [
            "There are situations where the trajectory does not move: life stays organised around the absence years later, with rooms left intact and routines frozen. Or the reverse — the absence of any reaction, not as strength, but as something that has not yet arrived.",
            "Avoiding everything that reminds you, or guilt that finds no floor, are also signals worth looking at.",
            "There is no date beyond which grief is too long. The criterion is functional, not temporal.",
          ],
        },
        {
          heading: "The losses nobody recognises",
          paragraphs: [
            "Some losses receive neither a ritual nor permission: a miscarriage, an animal, a relationship broken off with someone still living, the end of a possibility — a diagnosis, a project, a country left behind.",
            "Then there are ambiguous losses, where there is no moment at which it ended: a person with dementia, a relationship dissolving without declarations.",
            "Where there is no recognition around it, the pain has nowhere to sit, and with nowhere to sit it moves less easily.",
          ],
        },
        {
          heading: "What other people say",
          paragraphs: [
            "\"He was old\", \"at least she isn't suffering now\", \"you have to be strong\", \"time heals\". The people saying these things want to help, and are almost always managing their own discomfort in the face of a pain they cannot resolve.",
            "The effect is that you stop talking about it, and the silence arrives exactly when the network around you thins — after the first weeks, when everyone returns to their own life.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "Not to get over it, and not to close it. We start from where the movement stopped and what is holding it there: an avoidance, a guilt, something unsaid, or a life that has organised itself around not touching the point.",
            "There is nothing to be settled. The work is about making room — for what was, and for what is still there.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Grief and loss — English-speaking psychotherapist in Milan",
        metaDescription:
          "Why grief is not a disorder and has no stages, when the trajectory gets stuck, and the losses that receive no recognition. How the work proceeds.",
        noIndex: true,
      },
    },
  },
  {
    it: {
      _id: "subtopicPage-trauma-relazionale-it",
      _type: "subtopicPage",
      language: "it",
      title: "Trauma relazionale",
      titleEmphasisWord: "relazionale",
      parentPillar: { _type: "reference", _ref: "pillarPage-trauma-it" },
      slug: { _type: "slug", current: "trauma-relazionale" },
      heroKicker: "Un tema del trauma",
      standfirst: "Quando il danno è arrivato da una relazione, sono le relazioni a diventare il terreno difficile.",
      epigraph: "Capisco quando qualcuno cambia umore prima che lo capisca lui.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-trauma-relazionale-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-trauma-relazionale-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-trauma-relazionale-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cos'è il trauma relazionale",
          paragraphs: [
            "È il trauma la cui fonte è stata una relazione: un partner, un genitore, una figura di riferimento, a volte un contesto lavorativo. Non un evento esterno, ma un legame che ha prodotto danno mentre continuava a essere un legame.",
            "La differenza rispetto a un evento isolato non è la gravità. È che qui il terreno colpito è lo stesso che serve per riprendersi.",
          ],
        },
        {
          heading: "Quando la fonte era anche il rifugio",
          paragraphs: [
            "Questa è la parte che rende il quadro particolare. In un evento traumatico esterno le relazioni sono la risorsa: qualcuno da chiamare, un posto dove tornare.",
            "Quando invece la fonte del danno è la persona da cui si dipendeva, le due funzioni collidono. Avvicinarsi era necessario e pericoloso insieme, e il sistema ha dovuto imparare a fare entrambe le cose contemporaneamente.",
            "Quello che ne risulta non è paura delle relazioni. È una relazione con le relazioni che resta ambivalente, anche dove non ci sarebbe ragione.",
          ],
        },
        {
          heading: "Cosa produce nelle relazioni adulte",
          paragraphs: [
            "Difficoltà a fidarsi di chi non ha fatto niente. Attesa che qualcosa succeda, anche quando va bene. Prontezza a leggere un segnale di distacco dove non c'è. A volte il contrario: legarsi molto rapidamente, e con persone che confermano lo schema.",
            "Nessuno di questi comportamenti è irrazionale. Sono coerenti con l'ambiente in cui sono stati costruiti — e sono diventati un problema quando l'ambiente è cambiato e la lettura è rimasta.",
          ],
        },
        {
          heading: "L'ipervigilanza verso l'altro",
          paragraphs: [
            "È una delle competenze più sviluppate in chi viene da un ambiente imprevedibile: accorgersi di un cambiamento di umore prima che diventi visibile, dal ritmo dei passi, da una parola scelta diversamente.",
            "Era una capacità utile e a volte necessaria. Il costo si vede adesso: l'attenzione è costantemente rivolta all'altro, e questo consuma, riduce lo spazio per accorgersi di sé, e produce reazioni a segnali che non c'erano.",
            "Riconoscerla come competenza — e non come difetto — cambia il modo in cui se ne può parlare.",
          ],
        },
        {
          heading: "Non è diffidenza",
          paragraphs: [
            "Chi vive questo quadro spesso si descrive come diffidente e si giudica per questo. La diffidenza è una valutazione: si può discutere, correggere, sospendere.",
            "Qui invece la reazione precede la valutazione. Si arriva già in allarme e poi si cerca la ragione, e non è un problema di carattere né di volontà.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Prima la base: capire come funziona adesso, dove si attiva, e cosa fai quando si attiva. Non si parte dal racconto — quello arriva quando c'è di che sostenerlo.",
            "Poi si lavora sulla distinzione fra i segnali di allora e quelli di ora, che è il punto in cui l'ipervigilanza comincia a poter essere messa da parte in situazioni sicure. E la relazione clinica stessa fa parte del lavoro: è un legame con regole dichiarate, una distanza precisa e una durata concordata, e per molte persone è il primo terreno in cui verificare qualcosa senza rischiare troppo.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Trauma relazionale — psicologo e psicoterapeuta a Milano",
        metaDescription:
          "Trauma relazionale: quando la fonte del danno era anche il rifugio, l'ipervigilanza verso l'altro, e perché non si tratta di diffidenza. Come si lavora.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-trauma-relazionale-en",
      _type: "subtopicPage",
      language: "en",
      title: "Relational trauma",
      titleEmphasisWord: "Relational",
      parentPillar: { _type: "reference", _ref: "pillarPage-trauma-en" },
      slug: { _type: "slug", current: "relational-trauma" },
      heroKicker: "A subject within trauma",
      standfirst: "When the harm came from a relationship, relationships become the difficult ground.",
      epigraph: "I can tell when someone's mood changes before they can.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-trauma-relazionale-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-trauma-relazionale-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-trauma-relazionale-3-en" },
      ],
      body: buildBody([
        {
          heading: "What relational trauma is",
          paragraphs: [
            "It is trauma whose source was a relationship: a partner, a parent, a figure of authority, sometimes a workplace. Not an external event, but a bond that produced harm while continuing to be a bond.",
            "What separates it from an isolated event is not severity. It is that here the ground that was damaged is the same ground recovery depends on.",
          ],
        },
        {
          heading: "When the source was also the refuge",
          paragraphs: [
            "This is what makes the picture particular. In an external traumatic event, relationships are the resource: someone to call, somewhere to return to.",
            "When the source of harm is the person you depended on, those two functions collide. Getting closer was necessary and dangerous at once, and the system had to learn to do both simultaneously.",
            "What results is not a fear of relationships. It is a relationship with relationships that stays ambivalent, even where there would be no reason.",
          ],
        },
        {
          heading: "What it produces in adult relationships",
          paragraphs: [
            "Difficulty trusting people who have done nothing. Waiting for something to happen, even when things are fine. A readiness to read a signal of withdrawal where there is none. Sometimes the reverse: attaching very quickly, and to people who confirm the pattern.",
            "None of these behaviours is irrational. They are consistent with the environment they were built in — and they became a problem when the environment changed and the reading stayed.",
          ],
        },
        {
          heading: "Hypervigilance towards the other person",
          paragraphs: [
            "It is among the most developed skills in people from an unpredictable environment: noticing a change of mood before it becomes visible, from the rhythm of footsteps, from a word chosen differently.",
            "It was a useful and sometimes necessary capacity. The cost shows now: attention is permanently turned towards the other person, which consumes, reduces the room for noticing yourself, and produces reactions to signals that were not there.",
            "Recognising it as a skill — rather than as a defect — changes how it can be discussed.",
          ],
        },
        {
          heading: "It is not distrust",
          paragraphs: [
            "People living this often describe themselves as distrustful and judge themselves for it. Distrust is an assessment: it can be argued with, corrected, suspended.",
            "Here the reaction precedes the assessment. You arrive already in alarm and then look for the reason, and that is neither a matter of character nor of will.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "The base first: understanding how it functions now, where it activates, and what you do when it does. We do not start from the account — that arrives when there is something to hold it.",
            "Then the work is on distinguishing the signals of then from those of now, which is where hypervigilance begins to be something that can be set aside in safe situations. And the clinical relationship is itself part of the work: it is a bond with declared rules, a defined distance and an agreed duration, and for many people it is the first ground on which to test something without risking too much.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Relational trauma — English-speaking psychotherapist in Milan",
        metaDescription:
          "Relational trauma: when the source of harm was also the refuge, hypervigilance towards others, and why this is not distrust. How the work proceeds.",
        noIndex: true,
      },
    },
  },
];

const recognitionItemsIt = [
  {
    _key: "recognition-it-6",
    _type: "recognitionItem",
    label: "Trauma infantile",
    quote: "Da bambino ho imparato a non chiedere niente.",
    subtopic: { _type: "reference", _ref: "subtopicPage-trauma-infantile-it" },
    isDraft: true,
  },
  {
    _key: "recognition-it-7",
    _type: "recognitionItem",
    label: "Lutto e perdita",
    quote: "Sono passati due anni e tutti si aspettano che sia andata avanti.",
    subtopic: { _type: "reference", _ref: "subtopicPage-lutto-it" },
    isDraft: true,
  },
  {
    _key: "recognition-it-8",
    _type: "recognitionItem",
    label: "Trauma relazionale",
    quote: "Capisco quando qualcuno cambia umore prima che lo capisca lui.",
    subtopic: { _type: "reference", _ref: "subtopicPage-trauma-relazionale-it" },
    isDraft: true,
  },
];

const recognitionItemsEn = [
  {
    _key: "recognition-en-6",
    _type: "recognitionItem",
    label: "Childhood trauma",
    quote: "As a child I learned not to ask for anything.",
    subtopic: { _type: "reference", _ref: "subtopicPage-trauma-infantile-en" },
    isDraft: true,
  },
  {
    _key: "recognition-en-7",
    _type: "recognitionItem",
    label: "Grief and loss",
    quote: "It has been two years and everyone expects me to have moved on.",
    subtopic: { _type: "reference", _ref: "subtopicPage-lutto-en" },
    isDraft: true,
  },
  {
    _key: "recognition-en-8",
    _type: "recognitionItem",
    label: "Relational trauma",
    quote: "I can tell when someone's mood changes before they can.",
    subtopic: { _type: "reference", _ref: "subtopicPage-trauma-relazionale-en" },
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

  console.log("Appending 3 recognition items to pillarPage-trauma-it...");
  await client.patch("pillarPage-trauma-it").insert("after", "recognition.items[-1]", recognitionItemsIt).commit();
  console.log("  done");

  console.log("Appending 3 recognition items to pillarPage-trauma-en...");
  await client.patch("pillarPage-trauma-en").insert("after", "recognition.items[-1]", recognitionItemsEn).commit();
  console.log("  done");

  console.log("Pillar 6 (trauma) complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
