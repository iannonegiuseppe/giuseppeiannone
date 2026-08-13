import { createClient } from "@sanity/client";
import { buildBody, faqItemDoc } from "./lib/subtopicBuilders";

// Stress pillar batch — burnout-lavorativo, stress-e-sintomi-fisici.
// Copy verbatim from contents/subtopic-stress-due.md.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const faqItems = [
  faqItemDoc(
    "faqItem-burnout-1-it",
    "it",
    "Il burnout è riconosciuto ufficialmente?",
    "È incluso nella classificazione internazionale dell'OMS come fenomeno occupazionale, specificamente riferito al contesto lavorativo, e non come malattia. La distinzione ha conseguenze pratiche: non è una diagnosi medica, e per questioni di certificazione o di idoneità il riferimento resta il medico.",
  ),
  faqItemDoc(
    "faqItem-burnout-1-en",
    "en",
    "Is burnout officially recognised?",
    "It appears in the WHO's international classification as an occupational phenomenon, specifically tied to the work context, rather than as a medical condition. The distinction has practical consequences: it is not a medical diagnosis, and for anything involving certification or fitness for work the reference point remains a doctor.",
  ),
  faqItemDoc(
    "faqItem-burnout-2-it",
    "it",
    "Perché dopo le ferie torna tutto come prima?",
    "Perché le ferie sospendono l'esposizione senza modificare le condizioni che l'hanno prodotta. Il recupero funziona quando c'è un margine da ricostituire; quando la richiesta supera stabilmente le risorse, due settimane restituiscono energia che si consuma nei primi giorni di rientro. È uno dei segnali che orientano più chiaramente verso il burnout.",
  ),
  faqItemDoc(
    "faqItem-burnout-2-en",
    "en",
    "Why does everything go back to how it was after a holiday?",
    "Because a holiday suspends the exposure without changing the conditions that produced it. Recovery works when there is a margin to rebuild; when demand consistently exceeds resources, two weeks return energy that is spent in the first days back. It is among the clearest signals pointing towards burnout.",
  ),
  faqItemDoc(
    "faqItem-burnout-3-it",
    "it",
    "Il mio datore di lavoro può venirlo a sapere?",
    "No. Tutto quello che viene detto in seduta è coperto dal segreto professionale, che per lo psicologo è un obbligo di legge, e riguarda anche il fatto stesso che tu sia in terapia. Se una comunicazione a terzi diventasse utile per una qualsiasi ragione, potrebbe partire solo con il tuo consenso scritto.",
  ),
  faqItemDoc(
    "faqItem-burnout-3-en",
    "en",
    "Could my employer find out?",
    "No. Everything said in session is covered by professional secrecy, which for a psychologist in Italy is a legal obligation, and it covers the fact of your being in therapy at all. If a communication to a third party ever became useful for any reason, it could only happen with your written consent.",
  ),
  faqItemDoc(
    "faqItem-sintomi-stress-1-it",
    "it",
    "Gli esami sono tutti a posto. Vuol dire che non ho niente?",
    "No, vuol dire che le cause cercate con quegli esami sono state escluse — che è un'informazione, non un verdetto sul fatto che tu stia bene. I sintomi che senti sono reali, e la loro origine può essere un carico prolungato che il corpo ha smesso di smaltire. Detto questo, se compaiono sintomi nuovi o il quadro cambia, si torna dal medico: escludere non è escludere per sempre.",
  ),
  faqItemDoc(
    "faqItem-sintomi-stress-1-en",
    "en",
    "All my tests are clear. Does that mean there is nothing wrong?",
    "No — it means the causes those tests looked for have been ruled out, which is information rather than a verdict on how you are. The symptoms you feel are real, and their origin can be a prolonged load the body has stopped clearing. That said, if new symptoms appear or the picture changes, you go back to the doctor: ruling out is not ruling out forever.",
  ),
  faqItemDoc(
    "faqItem-sintomi-stress-2-it",
    "it",
    "Devo continuare a fare accertamenti?",
    "Non è una decisione che prendo io: gli accertamenti li stabilisce il medico, in base al quadro. Quello che riguarda il lavoro psicologico è un'altra cosa — le verifiche fatte per abbassare l'inquietudine, che sono un comportamento diverso da un esame prescritto e che si affrontano con criteri diversi.",
  ),
  faqItemDoc(
    "faqItem-sintomi-stress-2-en",
    "en",
    "Should I keep having tests?",
    "That is not my decision to make: which investigations are needed is determined by a doctor, based on the picture. What does concern the psychological work is something else — checks carried out to lower unease, which are a different behaviour from a prescribed test and are approached on different terms.",
  ),
  faqItemDoc(
    "faqItem-sintomi-stress-3-it",
    "it",
    "Lo stress prolungato può far ammalare?",
    "L'attivazione prolungata è riconosciuta come fattore che incide su diversi sistemi dell'organismo, dal sonno alla regolazione gastrointestinale alle difese immunitarie. Da qui a dire che una singola malattia sia stata causata dallo stress c'è una distanza che né io né nessun altro può colmare nel caso specifico: quella valutazione è medica, e riguarda la storia clinica di quella persona.",
  ),
  faqItemDoc(
    "faqItem-sintomi-stress-3-en",
    "en",
    "Can prolonged stress make you ill?",
    "Prolonged activation is recognised as affecting several systems in the body, from sleep to gastrointestinal regulation to immune defences. Between that and saying a particular illness was caused by stress there is a distance neither I nor anyone else can close in an individual case: that assessment is medical, and it concerns that person's clinical history.",
  ),
];

const subtopics = [
  {
    it: {
      _id: "subtopicPage-burnout-it",
      _type: "subtopicPage",
      language: "it",
      title: "Burnout lavorativo",
      titleEmphasisWord: "Burnout",
      parentPillar: { _type: "reference", _ref: "pillarPage-stress-it" },
      slug: { _type: "slug", current: "burnout-lavorativo" },
      heroKicker: "Un sottotipo dello stress",
      standfirst:
        "Non è stanchezza accumulata. È il punto in cui il riposo smette di restituire quello che il lavoro consuma.",
      epigraph: "Alla domenica sera comincio già a sentire il peso del lunedì.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-burnout-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-burnout-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-burnout-3-it" },
      ],
      body: buildBody([
        {
          heading: "Cos'è il burnout",
          paragraphs: [
            "L'Organizzazione Mondiale della Sanità lo classifica come fenomeno occupazionale — non come una malattia — e lo definisce attraverso tre dimensioni: esaurimento delle energie, distanza mentale dal proprio lavoro con senso di cinismo, e riduzione dell'efficacia percepita.",
            "Il dettaglio che conta è nel nome della categoria: è legato al contesto lavorativo. Non descrive una fragilità della persona, ma un rapporto fra una persona e le condizioni in cui lavora.",
          ],
        },
        {
          heading: "Non è solo essere stanchi",
          paragraphs: [
            "La stanchezza ordinaria risponde al riposo: dopo una settimana di ferie qualcosa si allenta. Il segnale che orienta verso il burnout è che questo smetta di succedere — si torna, e nel giro di due giorni si è al punto di prima.",
            "Molte persone arrivano dicendo esattamente questo. È spesso l'informazione clinica più utile della prima seduta.",
          ],
        },
        {
          heading: "Le tre dimensioni, in concreto",
          paragraphs: [
            "L'esaurimento è quello che si nota per primo: energia che non si ricostituisce, difficoltà a iniziare cose che prima erano automatiche.",
            "Il cinismo è quello che spaventa di più chi lo prova, soprattutto in chi lavora con le persone: una distanza che compare da sola, un fastidio verso richieste che prima non lo producevano. Non è un cambiamento di carattere — è una forma di protezione che il sistema mette in atto quando la richiesta supera stabilmente le risorse.",
            "La terza dimensione è la percezione di non essere più efficace. Spesso non corrisponde ai risultati reali, e proprio per questo alimenta un secondo circuito: si lavora di più per compensare qualcosa che non stava calando.",
          ],
        },
        {
          heading: "Chi ne è più esposto",
          paragraphs: [
            "Il burnout è stato descritto per la prima volta nelle professioni di cura, e in quei contesti resta particolarmente frequente. Ma non è una questione di settore.",
            "Quello che pesa è il disallineamento: carico di lavoro non sostenibile, scarso controllo su come e quando si lavora, riconoscimento assente, richieste in conflitto fra loro, o un lavoro che chiede di comportarsi contro i propri valori. Più fattori insieme aumentano il peso di ciascuno.",
          ],
        },
        {
          heading: "Quello che fa fuori dal lavoro",
          paragraphs: [
            "Il burnout raramente resta in ufficio. Si porta a casa la ridotta disponibilità relazionale, l'irritabilità, il ritiro dalle cose che prima davano ristoro — e quel ritiro toglie proprio le risorse che servirebbero.",
            "È il punto in cui una difficoltà lavorativa comincia a somigliare a una difficoltà generale, e in cui distinguere le due cose diventa parte della valutazione.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Si comincia dalla mappa concreta: cosa esattamente consuma, in quali momenti della giornata, e quanto margine reale c'è su ciascuna voce. Non tutte le condizioni sono modificabili, e sapere quali non lo sono è già informazione.",
            "Poi si lavora sui confini — dove finisce il tuo compito e comincia quello di qualcun altro, e cosa succede davvero quando declini una richiesta. Se dal lavoro emerge una decisione più grande, quella resta tua: quello che il percorso può fare è metterti in condizione di prenderla con chiarezza invece che per esaurimento.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Burnout lavorativo — psicologo a Milano e Monza",
        metaDescription:
          "Burnout: le tre dimensioni con cui viene definito, perché il riposo smette di bastare, i fattori di contesto che pesano di più e come si lavora.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-burnout-en",
      _type: "subtopicPage",
      language: "en",
      title: "Work burnout",
      titleEmphasisWord: "Burnout",
      parentPillar: { _type: "reference", _ref: "pillarPage-stress-en" },
      slug: { _type: "slug", current: "work-burnout" },
      heroKicker: "A form of stress",
      standfirst: "Not accumulated tiredness. The point where rest stops returning what work consumes.",
      epigraph: "By Sunday evening I can already feel the weight of Monday.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-burnout-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-burnout-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-burnout-3-en" },
      ],
      body: buildBody([
        {
          heading: "What burnout is",
          paragraphs: [
            "The World Health Organization classifies it as an occupational phenomenon — not a medical condition — and defines it through three dimensions: exhaustion of energy, mental distance from one's job accompanied by cynicism, and a reduced sense of effectiveness.",
            "The detail that matters is in the category itself: it is tied to the work context. It does not describe a fragility in the person, but a relationship between a person and the conditions they work in.",
          ],
        },
        {
          heading: "It is not just being tired",
          paragraphs: [
            "Ordinary tiredness responds to rest: after a week off, something loosens. The signal that points towards burnout is when that stops happening — you go back, and within two days you are where you were.",
            "Many people arrive saying exactly this. It is often the most useful clinical information in a first session.",
          ],
        },
        {
          heading: "The three dimensions, concretely",
          paragraphs: [
            "Exhaustion is what gets noticed first: energy that does not rebuild, difficulty starting things that used to be automatic.",
            "Cynicism is what frightens people most, particularly those who work with others: a distance that appears on its own, an irritation at requests that never used to produce it. It is not a change of character — it is a form of protection the system deploys when demand consistently exceeds resources.",
            "The third dimension is the sense of no longer being effective. It often does not match the actual results, and precisely for that reason it feeds a second loop: working harder to compensate for something that was not in fact declining.",
          ],
        },
        {
          heading: "Who is more exposed",
          paragraphs: [
            "Burnout was first described in the caring professions, and it remains particularly frequent there. But it is not a matter of sector.",
            "What weighs is misalignment: an unsustainable workload, little control over how and when you work, absent recognition, demands that conflict with each other, or work that requires acting against your own values. Several factors together increase the weight of each.",
          ],
        },
        {
          heading: "What it does outside work",
          paragraphs: [
            "Burnout rarely stays at the office. It carries home the reduced availability for relationships, the irritability, the withdrawal from things that used to restore — and that withdrawal removes precisely the resources that would help.",
            "It is the point at which a work difficulty starts to resemble a general one, and telling the two apart becomes part of the assessment.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "We start with a concrete map: what exactly is consuming, at which points in the day, and how much real room there is on each item. Not every condition is changeable, and knowing which ones are not is itself information.",
            "Then the work is on boundaries — where your task ends and someone else's begins, and what actually happens when you decline a request. If a larger decision emerges, it stays yours: what the work can do is put you in a position to make it with clarity rather than through exhaustion.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Work burnout — English-speaking psychotherapist in Milan",
        metaDescription:
          "Burnout: the three dimensions used to define it, why rest stops being enough, the context factors that weigh most, and how the work proceeds.",
        noIndex: true,
      },
    },
  },
  {
    it: {
      _id: "subtopicPage-sintomi-stress-it",
      _type: "subtopicPage",
      language: "it",
      title: "Stress e sintomi fisici",
      titleEmphasisWord: "fisici",
      parentPillar: { _type: "reference", _ref: "pillarPage-stress-it" },
      slug: { _type: "slug", current: "stress-e-sintomi-fisici" },
      heroKicker: "Un sottotipo dello stress",
      standfirst: "Quando il carico non si esprime come pensiero ma come sintomo, e gli esami non trovano niente.",
      epigraph: "Mi fa male lo stomaco tutte le mattine prima di entrare in ufficio.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-sintomi-stress-1-it" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-sintomi-stress-2-it" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-sintomi-stress-3-it" },
      ],
      body: buildBody([
        {
          heading: "Quando lo stress si presenta nel corpo",
          paragraphs: [
            "Non tutte le persone sotto carico prolungato lo riconoscono come tale. Per molte il primo segnale non è un pensiero né un'emozione: è un sintomo corporeo che compare, resta, e non trova spiegazione.",
            "È una delle ragioni per cui il percorso comincia quasi sempre dal medico, e non da uno psicologo. Il che è corretto: quello è il posto giusto da cui cominciare.",
          ],
        },
        {
          heading: "Le forme più frequenti",
          paragraphs: [
            "Disturbi gastrointestinali — dolore, gonfiore, alterazioni dell'alvo. Cefalea tensiva, con la caratteristica sensazione di cerchio alla testa. Tensione muscolare cronica su collo, spalle e mandibola, spesso con bruxismo notturno.",
            "Poi la stanchezza che non risponde al riposo, le alterazioni del sonno, e a volte manifestazioni cutanee o un aumento della frequenza di infezioni banali.",
            "Quello che accomuna questi quadri è la loro genericità: sono compatibili con moltissime cose, ed è esattamente per questo che vanno prima esclusi con accertamenti.",
          ],
        },
        {
          heading: "Perché il corpo reagisce così",
          paragraphs: [
            "La risposta allo stress è utile e progettata per essere breve: il sistema si attiva, affronta la richiesta, e torna alla linea di base. Il problema non è l'attivazione — è la sua durata.",
            "Quando la richiesta non finisce, il ritorno alla linea di base non avviene mai del tutto. L'attivazione diventa il nuovo normale, e i sistemi che ne pagano il prezzo sono quelli che dipendono da una regolazione fine: la digestione, il sonno, la tensione muscolare, le difese immunitarie.",
          ],
        },
        {
          heading: "La valutazione medica viene prima",
          paragraphs: [
            "Sempre, e senza eccezioni. Alterazioni tiroidee, anemie, carenze, celiachia e diverse condizioni infiammatorie producono quadri di stanchezza e sintomi somatici sovrapponibili a quelli da stress.",
            "Attribuire un sintomo allo stress prima che gli accertamenti indicati siano stati fatti è un errore che costa tempo, e a volte più di quello. Il primo riferimento è il medico curante, che decide quali esami servono.",
          ],
        },
        {
          heading: "Non è la stessa cosa dell'ansia per la salute",
          paragraphs: [
            "Sono due quadri diversi e vengono confusi spesso. Nell'ansia per la salute il centro è la paura di avere una malattia grave, e i sintomi — che possono essere lievi o assenti — vengono letti come prova; il comportamento tipico è il controllo e la ricerca di rassicurazione.",
            "Qui invece i sintomi ci sono, sono continuativi e disturbano la vita quotidiana, e la preoccupazione principale non è una diagnosi temuta ma il fatto di stare male senza capire perché.",
            "Distinguerle conta, perché il lavoro è diverso: là si interviene sul circuito di controllo, qui sul carico e sulla sua regolazione.",
          ],
        },
        {
          heading: "Come si lavora",
          paragraphs: [
            "Accanto al percorso medico, mai al posto suo. Si comincia mappando la relazione fra sintomi e contesto: in quali momenti compaiono, cosa li precede, cosa li attenua — informazioni che di solito emergono solo annotandole, perché a memoria si perdono.",
            "Poi si lavora sulla riduzione del carico dove è modificabile, sul recupero — che è una condizione fisiologica, non un premio da meritare — e sul circolo fra sintomo e preoccupazione, che una volta avviato aggiunge attivazione a un sistema già attivo.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Stress e sintomi fisici — psicologo a Milano e Monza",
        metaDescription:
          "Quando lo stress si manifesta nel corpo: disturbi gastrointestinali, cefalea tensiva, tensione muscolare. Perché la valutazione medica viene prima e come si lavora.",
        noIndex: true,
      },
    },
    en: {
      _id: "subtopicPage-sintomi-stress-en",
      _type: "subtopicPage",
      language: "en",
      title: "Stress and physical symptoms",
      titleEmphasisWord: "physical",
      parentPillar: { _type: "reference", _ref: "pillarPage-stress-en" },
      slug: { _type: "slug", current: "stress-and-physical-symptoms" },
      heroKicker: "A form of stress",
      standfirst: "When the load shows up as a symptom rather than a thought, and the tests find nothing.",
      epigraph: "My stomach hurts every morning before I go into the office.",
      faqItems: [
        { _key: "faq-ref-0", _type: "reference", _ref: "faqItem-sintomi-stress-1-en" },
        { _key: "faq-ref-1", _type: "reference", _ref: "faqItem-sintomi-stress-2-en" },
        { _key: "faq-ref-2", _type: "reference", _ref: "faqItem-sintomi-stress-3-en" },
      ],
      body: buildBody([
        {
          heading: "When stress shows up in the body",
          paragraphs: [
            "Not everyone under prolonged load recognises it as such. For many the first signal is neither a thought nor an emotion: it is a bodily symptom that appears, stays, and finds no explanation.",
            "It is one of the reasons the path almost always begins with a doctor rather than a psychologist. Which is correct: that is the right place to start.",
          ],
        },
        {
          heading: "The most frequent forms",
          paragraphs: [
            "Gastrointestinal difficulties — pain, bloating, changes in bowel habit. Tension headache, with its characteristic band around the head. Chronic muscular tension in the neck, shoulders and jaw, often with night-time bruxism.",
            "Then tiredness that does not respond to rest, disrupted sleep, and sometimes skin manifestations or an increased frequency of minor infections.",
            "What these pictures share is their generic quality: they are compatible with a great many things, which is exactly why they need ruling out by examination first.",
          ],
        },
        {
          heading: "Why the body responds this way",
          paragraphs: [
            "The stress response is useful and designed to be brief: the system activates, meets the demand, and returns to baseline. The problem is not the activation — it is its duration.",
            "When the demand does not end, the return to baseline never fully happens. Activation becomes the new normal, and the systems that pay for it are the ones depending on fine regulation: digestion, sleep, muscular tension, immune defences.",
          ],
        },
        {
          heading: "Medical assessment comes first",
          paragraphs: [
            "Always, without exception. Thyroid conditions, anaemia, deficiencies, coeliac disease and various inflammatory conditions produce pictures of fatigue and somatic symptoms that overlap closely with stress-related ones.",
            "Attributing a symptom to stress before the indicated investigations have been done is a mistake that costs time, and sometimes more than that. The first reference point is a family doctor, who decides which tests are needed.",
          ],
        },
        {
          heading: "It is not the same as health anxiety",
          paragraphs: [
            "These are two different pictures and they are often confused. In health anxiety the centre is the fear of having a serious illness, and symptoms — which may be mild or absent — get read as evidence; the typical behaviour is checking and seeking reassurance.",
            "Here the symptoms are present, continuous and disruptive to daily life, and the main worry is not a feared diagnosis but the fact of feeling unwell without understanding why.",
            "The distinction matters, because the work differs: there the intervention is on the checking loop, here on the load and its regulation.",
          ],
        },
        {
          heading: "How the work goes",
          paragraphs: [
            "Alongside the medical path, never instead of it. We start by mapping the relationship between symptoms and context: when they appear, what precedes them, what eases them — information that usually only emerges by writing it down, because memory loses it.",
            "Then the work is on reducing the load where it can be reduced, on recovery — which is a physiological condition, not a reward to be earned — and on the loop between symptom and worry, which once running adds activation to an already activated system.",
          ],
        },
      ]),
      seo: {
        metaTitle: "Stress and physical symptoms — English-speaking psychotherapist in Milan",
        metaDescription:
          "When stress shows up in the body: gastrointestinal symptoms, tension headache, muscular tension. Why medical assessment comes first, and how the work proceeds.",
        noIndex: true,
      },
    },
  },
];

const recognitionItemsIt = [
  {
    _key: "recognition-it-6",
    _type: "recognitionItem",
    label: "Burnout lavorativo",
    quote: "Alla domenica sera sento già il peso del lunedì.",
    subtopic: { _type: "reference", _ref: "subtopicPage-burnout-it" },
    isDraft: true,
  },
  {
    _key: "recognition-it-7",
    _type: "recognitionItem",
    label: "Stress e sintomi fisici",
    quote: "Il corpo mi presenta il conto ogni mattina.",
    subtopic: { _type: "reference", _ref: "subtopicPage-sintomi-stress-it" },
    isDraft: true,
  },
];

const recognitionItemsEn = [
  {
    _key: "recognition-en-6",
    _type: "recognitionItem",
    label: "Work burnout",
    quote: "By Sunday evening I already feel the weight of Monday.",
    subtopic: { _type: "reference", _ref: "subtopicPage-burnout-en" },
    isDraft: true,
  },
  {
    _key: "recognition-en-7",
    _type: "recognitionItem",
    label: "Stress and physical symptoms",
    quote: "My body hands me the bill every morning.",
    subtopic: { _type: "reference", _ref: "subtopicPage-sintomi-stress-en" },
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

  console.log("Appending 2 recognition items to pillarPage-stress-it...");
  await client.patch("pillarPage-stress-it").insert("after", "recognition.items[-1]", recognitionItemsIt).commit();
  console.log("  done");

  console.log("Appending 2 recognition items to pillarPage-stress-en...");
  await client.patch("pillarPage-stress-en").insert("after", "recognition.items[-1]", recognitionItemsEn).commit();
  console.log("  done");

  console.log("Pillar 3 (stress) complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
