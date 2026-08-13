import { createClient } from "@sanity/client";
import { buildBody, faqItemDoc } from "./lib/subtopicBuilders";

// Relational difficulties pillar batch — dipendenza-affettiva, difficolta-a-dire-di-no.
// Copy verbatim from contents/subtopic-relazioni-due.md, INCLUDING the 1522
// anti-violence line section in dipendenza-affettiva's body (section 4) and
// FAQ 2's answer — the task's own instruction says this decision was already
// made ("report how it renders... do not change it either way"), not mine to
// alter.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const faqItems = [
  faqItemDoc(
    "faqItem-dipendenza-1-it",
    "it",
    "Come distinguo l'amore dalla dipendenza?",
    "Non dall'intensità: tenere molto a qualcuno non è un sintomo. La differenza sta in cosa è successo ai tuoi criteri — se riesci ancora a sapere cosa preferisci, cosa ti stanca e cosa ti interessa quando l'altro non c'è, e se stare bene indipendentemente da lui produce colpa. Detto questo, \"dipendenza affettiva\" non è una diagnosi e nessuno può stabilirla leggendo: quello che si può fare in un primo incontro è guardare la tua situazione concreta.",
  ),
  faqItemDoc(
    "faqItem-dipendenza-1-en",
    "en",
    "How do I tell love from dependence?",
    "Not by intensity: caring a great deal about someone is not a symptom. The difference lies in what has happened to your own criteria — whether you can still tell what you prefer, what tires you and what interests you when the other person is not there, and whether being all right independently of them produces guilt. That said, \"emotional dependence\" is not a diagnosis and nobody can establish it by reading: what a first session can do is look at your actual situation.",
  ),
  faqItemDoc(
    "faqItem-dipendenza-2-it",
    "it",
    "Devo lasciare la relazione?",
    "Non è una domanda a cui rispondo io: è una decisione che riguarda la tua vita e dipende da vincoli che conosci solo tu. C'è anche un motivo pratico per non partire da lì — se il modo di stare in relazione resta invariato, la stessa dinamica tende a ricostruirsi altrove. Il lavoro riguarda prima come ci stai dentro. Fa eccezione la situazione in cui c'è violenza o controllo: là la sicurezza viene prima di tutto il resto.",
  ),
  faqItemDoc(
    "faqItem-dipendenza-2-en",
    "en",
    "Do I have to leave the relationship?",
    "That is not a question I answer: it is a decision about your life, and it depends on constraints only you know. There is also a practical reason not to start there — if the way of being in a relationship stays unchanged, the same dynamic tends to rebuild itself elsewhere. The work is first about how you are in it. The exception is where there is violence or control: there, safety comes before everything else.",
  ),
  faqItemDoc(
    "faqItem-dipendenza-3-it",
    "it",
    "Ha senso lavorarci se la relazione è già finita?",
    "Sì, e per alcune persone è il momento in cui diventa possibile. Quando il legame è ancora in corso, gran parte dell'attenzione è occupata da quello che sta accadendo giorno per giorno. Dopo, lo spazio per guardare la dinamica dall'esterno è maggiore — ed è la stessa dinamica che, se resta invariata, si ripresenta nella relazione successiva.",
  ),
  faqItemDoc(
    "faqItem-dipendenza-3-en",
    "en",
    "Is it worth working on if the relationship is already over?",
    "Yes, and for some people that is when it becomes possible. While the relationship is ongoing, most of the attention is taken up by what is happening day to day. Afterwards there is more room to look at the dynamic from outside — and it is the same dynamic that, left unchanged, reappears in the next relationship.",
  ),
  faqItemDoc(
    "faqItem-dire-no-1-it",
    "it",
    "Non è semplicemente essere una persona gentile?",
    "La gentilezza è una scelta, e una scelta implica che l'alternativa fosse disponibile. Qui la differenza è la reversibilità: dare per scelta lascia intatta la possibilità di non dare la volta dopo, dare perché non si può fare altrimenti la elimina. Il criterio pratico è cosa senti subito dopo aver accettato — se è regolarmente rimpianto, non era gentilezza.",
  ),
  faqItemDoc(
    "faqItem-dire-no-1-en",
    "en",
    "Isn't this just being a kind person?",
    "Kindness is a choice, and a choice implies the alternative was available. The difference here is reversibility: giving by choice leaves intact the possibility of not giving next time, giving because there was no alternative removes it. The practical test is what you feel immediately after accepting — if it is regularly regret, it was not kindness.",
  ),
  faqItemDoc(
    "faqItem-dire-no-2-it",
    "it",
    "Se comincio a dire di no, non rischio di perdere le persone?",
    "È il timore che tiene in piedi il meccanismo, ed è il motivo per cui il lavoro non parte dalle situazioni più cariche. Si comincia da rifiuti a bassa posta, concordati, e si annota cosa succede davvero: nella maggior parte dei casi la distanza fra il temuto e l'accaduto è il dato più utile. Dove qualcuno reagisce male, quella reazione è a sua volta un'informazione sulla relazione.",
  ),
  faqItemDoc(
    "faqItem-dire-no-2-en",
    "en",
    "If I start saying no, won't I lose people?",
    "That fear is what holds the mechanism in place, and it is why the work does not begin with the highest-stakes situations. We start with low-stakes refusals, agreed in advance, and note what actually happens: in most cases the gap between what was feared and what occurred is the most useful data. Where someone does react badly, that reaction is itself information about the relationship.",
  ),
  faqItemDoc(
    "faqItem-dire-no-3-it",
    "it",
    "Riguarda anche il lavoro?",
    "Spesso è lì che il costo si vede prima. Accettare compiti fuori dal proprio ruolo, anticipare richieste, non rendere visibile un carico già pieno: è uno dei contributi più diretti all'esaurimento delle risorse. E a differenza delle relazioni personali, sul lavoro il meccanismo viene di solito premiato nel breve periodo, il che lo rende più difficile da riconoscere.",
  ),
  faqItemDoc(
    "faqItem-dire-no-3-en",
    "en",
    "Does this apply to work as well?",
    "That is often where the cost shows first. Accepting tasks outside your role, pre-empting requests, not making an already full load visible: it is among the most direct contributors to resource depletion. And unlike in personal relationships, at work the mechanism usually gets rewarded in the short term, which makes it harder to recognise.",
  ),
];

const subtopics = [
  {
    it: {
      _id: "subtopicPage-dipendenza-it",
      _type: "subtopicPage",
      language: "it",
      title: "Dipendenza affettiva",
      titleEmphasisWord: "Dipendenza",
      parentPillar: { _type: "reference", _ref: "pillarPage-relazioni-it" },
      slug: { _type: "slug", current: "dipendenza-affettiva" },
      heroKicker: "Una difficoltà relazionale",
      standfirst:
        "Quando il baricentro si sposta fuori da te, e stare bene comincia a dipendere dallo stato di qualcun altro.",
      epigraph: "Se lui sta male io non riesco a fare niente, e se sto bene mi sento in colpa.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-dipendenza-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-dipendenza-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-dipendenza-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cos'è, e perché non è una diagnosi",
          paragraphs: [
            "\"Dipendenza affettiva\" non è una categoria diagnostica: non compare nei manuali, e nessuno può dirti che ce l'hai. È un'espressione descrittiva, usata per indicare un modo di stare in relazione in cui il proprio equilibrio diventa funzione di quello dell'altro.",
            "Il fatto che non sia una diagnosi non la rende meno reale. Rende solo importante descriverla in concreto invece di usarla come etichetta.",
          ],
        },
        {
          heading: "Come si riconosce",
          paragraphs: [
            "Non dal quanto tieni a qualcuno — tenere molto a una persona è ordinario. Si riconosce da cosa è successo ai tuoi criteri.",
            "Quando l'umore della giornata è deciso da un messaggio, quando le decisioni passano tutte da una verifica preventiva, quando le tue preferenze non sono più recuperabili nemmeno da sole, quando gli amici e le attività di prima si sono assottigliati senza che tu lo abbia scelto: sono questi i segnali, e riguardano il perimetro della tua vita più che l'intensità del sentimento.",
            "Il segnale più netto è la colpa quando stai bene indipendentemente dall'altro.",
          ],
        },
        {
          heading: "Non è la stessa cosa dell'ansia nelle relazioni",
          paragraphs: [
            "Sono vicine e si sovrappongono spesso, ma il centro è diverso. Nell'ansia nelle relazioni il tema è la tenuta del legame: l'allarme si accende su segnali minimi e chiede rassicurazione, che funziona per qualche ora.",
            "Qui il tema è il baricentro. Anche in una relazione stabile e non minacciata, il proprio funzionamento resta subordinato a quello dell'altro — e il problema non è la paura di perderlo, ma il fatto che senza di lui non si sappia più cosa si vuole.",
            "Molte persone hanno entrambe le cose. Distinguerle serve a capire da dove cominciare.",
          ],
        },
        {
          heading: "Quando il problema non è il legame ma il comportamento",
          paragraphs: [
            "C'è una situazione che va nominata, perché dall'interno si confonde con la dipendenza. Se qualcuno controlla i tuoi spostamenti o le tue spese, decide chi puoi vedere, ti umilia, minimizza sistematicamente quello che dici, o se c'è violenza fisica o sessuale — quello non è un modo di amare che ha preso una piega sbagliata, ed è un'altra cosa da quella descritta in questa pagina.",
            "In Italia esiste il numero 1522: gratuito, attivo 24 ore su 24, in più lingue, anche solo per parlare con qualcuno e capire. Non è un numero riservato a chi ha già deciso qualcosa.",
            "Il lavoro psicologico non sostituisce quel passaggio, e in queste situazioni la sicurezza viene prima di qualsiasi percorso.",
          ],
        },
        {
          heading: "Lasciare non è la risposta automatica",
          paragraphs: [
            "Una delle cose che le persone si sentono dire più spesso è che dovrebbero andarsene. A volte è così, a volte no, e in ogni caso non è una decisione che prendo io: riguarda la vita di chi la prende, e dipende da vincoli che conosce solo lei.",
            "C'è anche un motivo pratico. Se il modo di stare in relazione resta invariato, la stessa dinamica tende a ricostruirsi nella relazione successiva. Per questo il lavoro riguarda prima come ci stai dentro, e solo dopo — se emerge — cosa vuoi farne.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Si comincia dal recupero dei criteri: cosa preferisci, cosa ti stanca, cosa ti interessa, indipendentemente da chi hai accanto. Per molte persone è la parte più faticosa, perché quelle risposte si sono davvero perse per strada.",
            "Poi si lavora sulle situazioni concrete — il momento preciso in cui hai messo da parte una tua preferenza — e sulla ricostruzione graduale di quello che era stato ridotto: contatti, attività, tempo non condiviso. Il lavoro è individuale, e riguarda l'unica parte su cui hai davvero margine.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Dipendenza affettiva — psicologo a Milano e Monza",
        metaDescription:
          "Dipendenza affettiva: come si riconosce, perché non è una diagnosi, in cosa differisce dall'ansia nelle relazioni, e come si lavora sul recupero dei propri criteri.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-dipendenza-en",
      _type: "subtopicPage",
      language: "en",
      title: "Emotional dependence",
      titleEmphasisWord: "dependence",
      parentPillar: { _type: "reference", _ref: "pillarPage-relazioni-en" },
      slug: { _type: "slug", current: "emotional-dependence" },
      heroKicker: "A relational difficulty",
      standfirst:
        "When your centre of gravity moves outside you, and being all right starts to depend on how someone else is.",
      epigraph: "If he is unwell I can't do anything, and if I am fine I feel guilty.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-dipendenza-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-dipendenza-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-dipendenza-3-en" },
      ],
      body: buildBody([
        {
          heading: "What it is, and why it is not a diagnosis",
          paragraphs: [
            "\"Emotional dependence\" is not a diagnostic category: it does not appear in the manuals, and nobody can tell you that you have it. It is a descriptive phrase, used for a way of being in a relationship where your own balance becomes a function of the other person's.",
            "That it is not a diagnosis does not make it less real. It only makes it important to describe concretely rather than use as a label.",
          ],
        },
        {
          heading: "How it shows",
          paragraphs: [
            "Not by how much you care about someone — caring a great deal about a person is ordinary. It shows in what has happened to your own criteria.",
            "When the mood of a day is set by a message, when decisions all pass through a preliminary check, when your preferences are no longer retrievable even on your own, when the friends and activities of before have thinned without your having chosen it: these are the signals, and they concern the perimeter of your life rather than the intensity of the feeling.",
            "The clearest signal is guilt at being all right independently of the other person.",
          ],
        },
        {
          heading: "It is not the same as anxiety in relationships",
          paragraphs: [
            "They are close and often overlap, but the centre differs. In anxiety in relationships the subject is whether the bond will hold: the alarm goes off on minimal signals and asks for reassurance, which works for a few hours.",
            "Here the subject is the centre of gravity. Even in a stable and unthreatened relationship, your own functioning stays subordinate to the other person's — and the problem is not the fear of losing them, but that without them you no longer know what you want.",
            "Many people have both. Telling them apart is what shows where to start.",
          ],
        },
        {
          heading: "When the problem is not the bond but the behaviour",
          paragraphs: [
            "There is a situation that has to be named, because from the inside it gets confused with dependence. If someone monitors your movements or your spending, decides who you may see, humiliates you, systematically minimises what you say, or if there is physical or sexual violence — that is not a way of loving that has taken a wrong turn, and it is a different thing from what this page describes.",
            "In Italy there is the number 1522: free, available 24 hours a day, in several languages, including just to talk to someone and work out where you stand. It is not reserved for people who have already decided something.",
            "Psychological work does not replace that step, and in these situations safety comes before any course of therapy.",
          ],
        },
        {
          heading: "Leaving is not the automatic answer",
          paragraphs: [
            "One of the things people hear most often is that they should get out. Sometimes that is right, sometimes it is not, and in either case it is not my decision: it concerns the life of the person making it, and depends on constraints only they know.",
            "There is also a practical reason. If the way of being in a relationship stays unchanged, the same dynamic tends to rebuild itself in the next one. Which is why the work is first about how you are in it, and only afterwards — if it emerges — about what you want to do with it.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "We start by recovering your criteria: what you prefer, what tires you, what interests you, independently of who is beside you. For many people this is the hardest part, because those answers genuinely got lost along the way.",
            "Then we work on concrete situations — the precise moment you set aside a preference of your own — and on gradually rebuilding what had been reduced: contacts, activities, unshared time. The work is individual, and concerns the only part you have real leverage over.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Emotional dependence — English-speaking psychotherapist in Milan",
        metaDescription:
          "Emotional dependence: how it shows, why it is not a diagnosis, how it differs from anxiety in relationships, and how the work recovers your own criteria.",
        noIndex: true,
      },
    },
  },
  {
    it: {
      _id: "subtopicPage-dire-no-it",
      _type: "subtopicPage",
      language: "it",
      title: "Difficoltà a dire di no",
      titleEmphasisWord: "no",
      parentPillar: { _type: "reference", _ref: "pillarPage-relazioni-it" },
      slug: { _type: "slug", current: "difficolta-a-dire-di-no" },
      heroKicker: "Una difficoltà relazionale",
      standfirst: "Il sì immediato costa poco. È il conto che arriva dopo a non essere sostenibile.",
      epigraph: "Dico sempre sì, e poi passo la notte a chiedermi perché.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-dire-no-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-dire-no-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-dire-no-3-it" },
      ],
      body: buildBody([
        {
          heading: "Di cosa si tratta",
          paragraphs: [
            "Non della gentilezza, e non della disponibilità: quelle sono scelte, e una scelta si può fare o non fare. Qui il punto è che il no non è disponibile — la risposta parte prima di qualsiasi valutazione, e ci si accorge di aver accettato mentre lo si sta già dicendo.",
            "Il segnale che orienta è quello che succede subito dopo: se al sì segue regolarmente il rimpianto, l'oggetto della decisione non era la richiesta.",
          ],
        },
        {
          heading: "Le forme che prende",
          paragraphs: [
            "Accettare compiti che non rientrano nel proprio ruolo. Anticipare le richieste per non doverle rifiutare. Aggiungere scuse a un no che non ne aveva bisogno. Dire sì e poi risolverlo con un rinvio, o sparendo.",
            "Anche il contrario esiste: rifiutare in blocco e con durezza, perché una via di mezzo non è mai stata praticata. Rigidità e cedimento sono due esiti dello stesso meccanismo.",
          ],
        },
        {
          heading: "Il meccanismo: il sollievo del sì",
          paragraphs: [
            "Nel momento della richiesta si attivano due cose insieme: la valutazione di cosa comporta accettare, e il disagio all'idea di deludere. La seconda arriva prima e pesa più della prima.",
            "Il sì scioglie quel disagio immediatamente. E ogni volta insegna che il disagio si scioglie così, il che rende il no un po' meno accessibile la volta dopo.",
            "Per questo l'intenzione non basta. Le persone che arrivano avevano già deciso mille volte di essere più ferme.",
          ],
        },
        {
          heading: "Il costo che si accumula",
          paragraphs: [
            "Il conto non arriva subito e non arriva dove è stato fatto il debito. Arriva come stanchezza cronica, come irritabilità verso persone che non hanno chiesto niente, come rancore verso chi ha chiesto — e il rancore è la parte più difficile da ammettere, perché contraddice l'immagine di sé come persona disponibile.",
            "Sul lavoro questo circuito è uno dei contributi più diretti al carico che porta al burnout. Fuori dal lavoro erode le relazioni in cui più si è dato.",
          ],
        },
        {
          heading: "Non è generosità",
          paragraphs: [
            "La distinzione pratica è la reversibilità. Dare per scelta lascia intatta la possibilità di non dare la volta successiva; dare perché non si può fare altrimenti la elimina.",
            "E c'è una conseguenza che sorprende: chi riceve un sì che non poteva essere un no riceve meno di quello che sembra. Non ha ricevuto una scelta, e in genere lo percepisce.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Si comincia da episodi concreti e recenti: la richiesta esatta, il secondo in cui hai risposto, cosa hai sentito prima di rispondere. Il diario è utile qui più che altrove, perché a distanza di giorni resta il rimpianto e si perde la sequenza.",
            "Poi si sperimenta, in modo concordato e volutamente in piccolo: un rifiuto a bassa posta, e l'annotazione di cosa è successo davvero — non di cosa temevi. La distanza fra le due cose è quasi sempre l'informazione che sposta qualcosa.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Difficoltà a dire di no — psicologo a Milano e Monza",
        metaDescription:
          "Perché il no non è disponibile, il sollievo immediato del sì e il costo che si accumula: rancore, stanchezza, carico che porta al burnout. Come si lavora.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-dire-no-en",
      _type: "subtopicPage",
      language: "en",
      title: "Difficulty saying no",
      titleEmphasisWord: "no",
      parentPillar: { _type: "reference", _ref: "pillarPage-relazioni-en" },
      slug: { _type: "slug", current: "difficulty-saying-no" },
      heroKicker: "A relational difficulty",
      standfirst: "The immediate yes is cheap. It is the bill afterwards that does not add up.",
      epigraph: "I always say yes, and then I spend the night wondering why.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-dire-no-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-dire-no-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-dire-no-3-en" },
      ],
      body: buildBody([
        {
          heading: "What this is about",
          paragraphs: [
            "Not kindness, and not being helpful: those are choices, and a choice can be made or not made. The point here is that no is not available — the answer leaves before any assessment, and you notice you have accepted while you are still saying it.",
            "The signal that orients things is what happens immediately afterwards: if a yes is regularly followed by regret, the decision was never about the request.",
          ],
        },
        {
          heading: "The forms it takes",
          paragraphs: [
            "Accepting tasks outside your own role. Pre-empting requests so as not to have to refuse them. Adding excuses to a no that needed none. Saying yes and then resolving it by postponing, or by disappearing.",
            "The opposite exists too: refusing everything, bluntly, because a middle course was never practised. Rigidity and yielding are two outcomes of the same mechanism.",
          ],
        },
        {
          heading: "The mechanism: the relief of yes",
          paragraphs: [
            "At the moment of the request two things activate together: an assessment of what accepting involves, and the discomfort at the idea of disappointing. The second arrives first and weighs more than the first.",
            "Yes dissolves that discomfort immediately. And each time it teaches that the discomfort dissolves this way, which makes no slightly less accessible next time.",
            "Which is why intention is not enough. The people who come had already decided a thousand times to hold firmer.",
          ],
        },
        {
          heading: "The bill that accumulates",
          paragraphs: [
            "It does not arrive immediately, and it does not arrive where the debt was incurred. It arrives as chronic tiredness, as irritability towards people who asked for nothing, as resentment towards those who did — and resentment is the hardest part to admit, because it contradicts the picture of oneself as a helpful person.",
            "At work this loop is among the most direct contributors to the load that leads to burnout. Outside work it erodes precisely the relationships where most was given.",
          ],
        },
        {
          heading: "It is not generosity",
          paragraphs: [
            "The practical distinction is reversibility. Giving by choice leaves intact the possibility of not giving next time; giving because there was no alternative removes it.",
            "And there is a consequence that surprises people: someone receiving a yes that could not have been a no receives less than it appears. They did not receive a choice, and they usually sense it.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "We start from concrete, recent episodes: the exact request, the second in which you answered, what you felt just before answering. The diary helps here more than elsewhere, because days later the regret survives and the sequence is gone.",
            "Then we experiment, by agreement and deliberately small: a low-stakes refusal, and a note of what actually happened — not of what you feared. The gap between those two is almost always the information that shifts something.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Difficulty saying no — English-speaking psychotherapist in Milan",
        metaDescription:
          "Why no is not available, the immediate relief of yes, and the bill that accumulates: resentment, exhaustion, the load that leads to burnout. How the work proceeds.",
        noIndex: true,
      },
    },
  },
];

const recognitionItemsIt = [
  {
    _key: "recognition-it-6",
    _type: "recognitionItem",
    label: "Dipendenza affettiva",
    quote: "Se lui sta male, io non esisto più.",
    subtopic: { _type: "reference", _ref: "subtopicPage-dipendenza-it" },
    isDraft: true,
  },
  {
    _key: "recognition-it-7",
    _type: "recognitionItem",
    label: "Difficoltà a dire di no",
    quote: "Dico sì anche quando so che non dovrei.",
    subtopic: { _type: "reference", _ref: "subtopicPage-dire-no-it" },
    isDraft: true,
  },
];

const recognitionItemsEn = [
  {
    _key: "recognition-en-6",
    _type: "recognitionItem",
    label: "Emotional dependence",
    quote: "If he is unwell, I stop existing.",
    subtopic: { _type: "reference", _ref: "subtopicPage-dipendenza-en" },
    isDraft: true,
  },
  {
    _key: "recognition-en-7",
    _type: "recognitionItem",
    label: "Difficulty saying no",
    quote: "I say yes even when I know I shouldn't.",
    subtopic: { _type: "reference", _ref: "subtopicPage-dire-no-en" },
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

  console.log("Appending 2 recognition items to pillarPage-relazioni-it...");
  await client.patch("pillarPage-relazioni-it").insert("after", "recognition.items[-1]", recognitionItemsIt).commit();
  console.log("  done");

  console.log("Appending 2 recognition items to pillarPage-relazioni-en...");
  await client.patch("pillarPage-relazioni-en").insert("after", "recognition.items[-1]", recognitionItemsEn).commit();
  console.log("  done");

  console.log("Pillar 4 (relazioni difficili) complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
