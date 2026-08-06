import { createClient } from "@sanity/client";
import { h2, p, pBoldStart, pMidBold } from "./lib/portableText";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Pillar rollout — trauma. Source: contents/pillar-trauma-bozza.md (IT+EN combined).
// Copy transcribed verbatim, no edits. Same as stress: Recognition quotes are
// author-drafted, not Giuseppe's own ("Giuseppe non ha fornito frasi per quest'area"),
// so isDraft: true on every item and recognition.leadInOverride replaces the
// standard disclaimer (owner-approved addition, see populate-pillar-stress.ts).
// The "Fai EMDR?" / "Do you do EMDR?" FAQ has a bracketed placeholder answer in
// both locales ("[DA CONFERMARE CON GIUSEPPE...]" / "[TO CONFIRM WITH GIUSEPPE...]")
// — per the standing instruction to leave bracketed fields empty rather than invent
// an answer, and because faqItem.answer is a required field that can't be saved
// genuinely blank, this question is OMITTED entirely from both locales' faqItems
// (5 of the draft's 6 FAQ questions are written, not 6). Recognition labels are
// derived from this page's own H2 titles/body vocabulary where a clean lift
// existed; flagged lower-confidence in the population report along with the
// quotes themselves. noIndex: true throughout.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_ASSET = "image-a161ad972bc58b45fd5120d6609193f3b7afaca4-2000x1333-jpg";

// EMDR question deliberately excluded — see file header comment.
const faqIt = [
  { q: "Devo raccontare cosa è successo?", a: "Non al primo incontro, e non necessariamente nel dettaglio. Si comincia da come stai adesso. Il racconto arriva quando c'è la base per sostenerlo." },
  { q: "È passato molto tempo. Ha ancora senso?", a: "Il tempo trascorso non determina se qualcosa è stato elaborato. Molte persone arrivano anni dopo, spesso perché qualcosa di recente ha riattivato quello che era rimasto fermo." },
  { q: "Non è successo niente di grave. Posso comunque chiedere aiuto?", a: "Sì. La gravità dell'evento non è il criterio, e le forme cumulative — quelle senza un episodio da raccontare — sono fra le più difficili da riconoscere dall'interno." },
  { q: "Si può lavorare online?", a: "Sì. Gli incontri online hanno la stessa durata e lo stesso costo di quelli in studio. Per il lavoro sul trauma la valutazione della modalità si fa insieme al primo incontro." },
  { q: "Dove ricevi?", a: "In due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online." },
];

const faqEn = [
  { q: "Do I have to describe what happened?", a: "Not in the first session, and not necessarily in detail. We start from how you are now. The account comes when there's a foundation to support it." },
  { q: "It was a long time ago. Is it still worth it?", a: "Elapsed time doesn't determine whether something was processed. Many people come years later, often because something recent reactivated what had been sitting still." },
  { q: "Nothing serious happened to me. Can I still ask for help?", a: "Yes. The severity of the event isn't the criterion, and the cumulative forms — the ones with no episode to recount — are among the hardest to recognise from the inside." },
  { q: "Can this be done online?", a: "Yes. Online sessions run the same length and cost the same as those in person. For trauma work, whether online is the right format is assessed together in the first session." },
  { q: "Where do you practise?", a: "Two practices in Milan, one in Monza and one in Cernusco sul Naviglio, plus online." },
];

const recognitionIt = [
  { quote: "È passato molto tempo. Non capisco perché mi condiziona ancora.", label: "Perché il corpo continua a reagire" },
  { quote: "Certe cose mi fanno reagire prima ancora che io capisca perché.", label: "Reazioni automatiche" },
  { quote: "Evito tutto quello che me lo ricorda, e l'elenco si allunga.", label: "Evitamento" },
  { quote: "Non riesco a raccontarlo. E quando ci provo, mi sembra di essere altrove.", label: "Distacco dissociativo" },
  { quote: "Sto sempre all'erta, anche quando non c'è motivo.", label: "Ipervigilanza" },
  { quote: "Non era niente di grave. Perché allora sto così?", label: "Trauma cumulativo" },
];

const recognitionEn = [
  { quote: "It was a long time ago. I don't understand why it still affects me.", label: "Why the body keeps responding" },
  { quote: "Certain things make me react before I even understand why.", label: "Automatic reactions" },
  { quote: "I avoid everything that reminds me of it, and the list keeps growing.", label: "Avoidance" },
  { quote: "I can't talk about it. And when I try, I feel like I'm somewhere else.", label: "Dissociative detachment" },
  { quote: "I'm always on alert, even when there's no reason.", label: "Hypervigilance" },
  { quote: "It wasn't anything serious. So why am I like this?", label: "Cumulative trauma" },
];

const bodyIt = [
  h2("Cos'è un trauma psicologico"),
  p("Un trauma non si definisce dalla gravità dell'evento. Si definisce da cosa è successo al sistema che doveva farvi fronte."),
  p("Un evento diventa traumatico quando supera la capacità di elaborarlo nel momento in cui accade. Quello che non è stato elaborato non viene archiviato come gli altri ricordi: resta in una forma che il corpo continua a trattare come presente."),
  p("È per questo che la domanda \"ma è stato abbastanza grave?\" porta fuori strada. Due persone possono attraversare la stessa cosa e uscirne diversamente, senza che questo dica nulla sulla loro forza."),
  h2("Trauma singolo e trauma relazionale"),
  p("Si distinguono due forme, e la seconda è quella che più spesso non viene riconosciuta."),
  pMidBold("Il ", "trauma singolo", " ha un prima e un dopo identificabili: un incidente, un'aggressione, una perdita improvvisa, un'emergenza medica. C'è una data."),
  pMidBold("Il ", "trauma relazionale", " o cumulativo non ha una data. Si costruisce nel tempo, dentro relazioni in cui si è stati esposti in modo ripetuto a qualcosa da cui non si poteva uscire — in famiglia, in una relazione, in un contesto prolungato. Non c'è un episodio da raccontare, e questo rende difficile persino considerarlo un trauma."),
  p("Chi ha vissuto la seconda forma spesso arriva dicendo che non è successo niente di particolare."),
  h2("Perché il corpo continua a reagire"),
  p("Il sistema di allarme impara. Dopo un'esperienza che ha superato le capacità di risposta, abbassa la soglia: reagisce prima, a segnali più deboli, a somiglianze anche remote."),
  p("Un tono di voce, un odore, una posizione del corpo, un'ora del giorno. La reazione arriva prima del pensiero, ed è per questo che sembra irrazionale a chi la vive: il ragionamento arriva dopo, e non riesce a spegnerla."),
  p("Da qui nascono le due direzioni opposte in cui il trauma si manifesta. Da un lato l'attivazione: allerta continua, sonno leggero, reattività. Dall'altro lo spegnimento: distanza, senso di irrealtà, sensazione di guardare la propria vita da fuori."),
  p("Molte persone oscillano fra le due, e questa oscillazione è di per sé faticosa."),
  h2("L'evitamento, e perché l'elenco si allunga"),
  p("Evitare quello che riattiva è la risposta più naturale. Funziona, nell'immediato."),
  p("Il costo si vede nel tempo. L'elenco delle cose da evitare non resta fermo: si estende per somiglianza, un elemento alla volta, finché lo spazio disponibile si è ristretto senza che ci sia stata una decisione."),
  p("E c'è un evitamento meno visibile: non pensarci, non parlarne, tenersi occupati. Anche questo funziona, e anche questo ha un prezzo — quello che non viene elaborato resta nella forma in cui è rimasto."),
  h2("Trauma e ansia: cosa li tiene insieme"),
  p("Molte difficoltà che si presentano come ansia hanno una storia dietro."),
  p("Attacchi di panico che iniziano mesi dopo un evento. Ipervigilanza scambiata per carattere. Insonnia che nessuna igiene del sonno risolve. Reazioni sproporzionate che chi le ha non sa spiegare."),
  p("Non tutto ciò che è ansia viene da un trauma, e non ogni trauma produce ansia. Ma quando c'è un legame, lavorare solo sui sintomi attuali lascia intatto quello che li alimenta."),
  h2("Psicoterapia per il trauma a Milano, Monza e Cernusco"),
  p("Ricevo in due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Lavoro in italiano e in inglese."),
  p("Il primo incontro non richiede di raccontare quello che è successo. Serve a capire come stai adesso, cosa si è attivato, cosa è cambiato. Il racconto, se e quando serve, viene dopo — e non sempre serve nel dettaglio."),
  p("Il lavoro sul trauma procede per gradi, e il primo grado non è affrontare il ricordo: è ricostruire una condizione in cui affrontarlo sia sostenibile. Stabilità prima, elaborazione poi. Un percorso che parte dall'esposizione al ricordo senza quella base fa danni, e questo vale indipendentemente dal metodo usato."),
  p("Il ritmo lo stabilisce chi ha vissuto la cosa, non io."),
  h2("Quando ha senso chiedere aiuto"),
  p("— C'è qualcosa che continua a condizionarmi anche se è passato?"),
  p("— Reagisco in modi che non riesco a spiegarmi?"),
  p("— L'elenco delle cose che evito si sta allungando?"),
  p("— Ci sono momenti in cui mi sento distante da me stesso?"),
  p("Non serve sapere se quello che è successo \"conta abbastanza\". Quella valutazione non spetta a chi la sta facendo da solo."),
];

const bodyEn = [
  h2("What psychological trauma is"),
  p("Trauma isn't defined by how serious the event was. It's defined by what happened to the system that had to meet it."),
  p("An event becomes traumatic when it exceeds the capacity to process it at the moment it happens. What wasn't processed doesn't get filed like other memories: it stays in a form the body continues to treat as present."),
  p("That's why the question \"but was it bad enough?\" leads nowhere useful. Two people can go through the same thing and come out differently, and that says nothing about their strength."),
  h2("Single-event and relational trauma"),
  p("Two forms are worth distinguishing, and the second is the one that more often goes unrecognised."),
  pBoldStart("Single-event trauma", " has an identifiable before and after: an accident, an assault, a sudden loss, a medical emergency. There's a date."),
  pBoldStart("Relational or cumulative trauma", " has no date. It builds over time, inside relationships where someone was repeatedly exposed to something they couldn't leave — in a family, in a relationship, in a prolonged situation. There's no episode to recount, which makes it hard even to consider it trauma."),
  p("People who lived the second form often arrive saying nothing in particular happened."),
  h2("Why the body keeps responding"),
  p("The alarm system learns. After an experience that exceeded the capacity to respond, it lowers its threshold: reacting sooner, to weaker signals, to even remote resemblances."),
  p("A tone of voice, a smell, a body position, a time of day. The reaction arrives before the thought, which is why it feels irrational from the inside: the reasoning comes afterwards, and can't switch it off."),
  p("From this come the two opposite directions trauma takes. On one side activation: constant alertness, light sleep, reactivity. On the other, shutdown: distance, a sense of unreality, the feeling of watching your own life from outside."),
  p("Many people move between the two, and that movement is itself exhausting."),
  h2("Avoidance, and why the list keeps growing"),
  p("Avoiding what reactivates is the most natural response. It works, in the moment."),
  p("The cost shows over time. The list of things to avoid doesn't stay still: it extends by resemblance, one item at a time, until the available space has narrowed without any decision being made."),
  p("There's a less visible avoidance too: not thinking about it, not speaking about it, staying busy. That works as well, and it also has a price — what isn't processed stays in the form it was left in."),
  h2("Trauma and anxiety"),
  p("Many difficulties that present as anxiety have a history behind them."),
  p("Panic attacks that begin months after an event. Hypervigilance mistaken for personality. Insomnia that no amount of sleep hygiene resolves. Disproportionate reactions the person can't explain."),
  p("Not everything that is anxiety comes from trauma, and not every trauma produces anxiety. But where there's a link, working only on the current symptoms leaves what feeds them intact."),
  h2("Trauma therapy in English in Milan, Monza and Cernusco"),
  p("I'm an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy. I see people in two practices in Milan, in Monza and in Cernusco sul Naviglio, and online, in English and in Italian."),
  p("Working in the language something happened in matters here more than anywhere else. Memory doesn't translate cleanly: people often find that what they can describe in their first language is different from what they can describe in a second one. If that's your situation, it's worth saying so at the start."),
  p("The first session doesn't require recounting what happened. It's about how you are now, what's been activated, what has changed. The account, if and when it's needed, comes later — and often not in detail."),
  p("Trauma work proceeds in stages, and the first stage isn't facing the memory: it's building a state in which facing it is sustainable. Stability first, processing after. Work that starts from exposure without that foundation does harm, and that holds regardless of the method used."),
  p("The pace is set by the person who lived it, not by me."),
  h2("When it makes sense to ask for help"),
  p("— Is something still affecting me even though it's over?"),
  p("— Do I react in ways I can't explain to myself?"),
  p("— Is the list of things I avoid getting longer?"),
  p("— Are there moments when I feel distant from myself?"),
  p("You don't need to know whether what happened \"counts enough\". That assessment isn't one to make alone."),
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
    const itId = `faqItem-trauma-${n}-it`;
    const enId = `faqItem-trauma-${n}-en`;
    await upsertDoc(client, itId, "faqItem", { question: itItem.q, answer: faqAnswer(itItem.a), language: "it" });
    await upsertDoc(client, enId, "faqItem", { question: enItem.q, answer: faqAnswer(enItem.a), language: "en" });
    await upsertTranslationMetadata(client, `faqItem-trauma-${n}`, "faqItem", itId, enId);
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

  await upsertDoc(client, "pillarPage-trauma-it", "pillarPage", {
    title: "Trauma e memoria del corpo",
    slug: { _type: "slug", current: "trauma" },
    titleEmphasisWord: "Trauma",
    heroKicker: "AREA DI INTERVENTO",
    standfirst: "Quando qualcosa è finito da tempo, ma il corpo continua a comportarsi come se non lo fosse.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Persona con le braccia incrociate sul petto, vista attraverso una superficie di vetro incrinato." },
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
      metaTitle: "Trauma — Psicoterapeuta a Milano, Monza e Cernusco",
      metaDescription: "Trauma singolo e relazionale, ipervigilanza, evitamento, dissociazione. Psicoterapia a Milano, Monza, Cernusco sul Naviglio e online.",
      noIndex: true,
    },
    language: "it",
  });

  await upsertDoc(client, "pillarPage-trauma-en", "pillarPage", {
    title: "Trauma and the body's memory",
    slug: { _type: "slug", current: "trauma" },
    titleEmphasisWord: "Trauma",
    heroKicker: "AREA OF WORK",
    standfirst: "When something ended long ago, but the body carries on as though it hadn't.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Person with arms crossed over their chest, seen through a cracked glass surface." },
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
      metaTitle: "Trauma Therapy in English — Milan, Monza, Online",
      metaDescription: "Single-event and relational trauma, hypervigilance, avoidance, dissociation. Italian psychotherapist working in English in Milan and online.",
      noIndex: true,
    },
    language: "en",
  });

  await upsertTranslationMetadata(client, "pillarPage-trauma", "pillarPage", "pillarPage-trauma-it", "pillarPage-trauma-en");

  console.log("\n=== trauma pillar: done ===");
  console.log("NOTE: 'Fai EMDR?' / 'Do you do EMDR?' FAQ omitted from both locales (bracketed placeholder answer, faqItem.answer is required).");
}

main();
