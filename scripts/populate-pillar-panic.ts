import { createClient } from "@sanity/client";
import { h2, p } from "./lib/portableText";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Pillar rollout — panic attacks / agoraphobia. Source: contents/pillar-panico-bozza-it.md,
// contents/pillar-panic-draft-en.md. Copy transcribed verbatim, no edits. Recognition
// quotes/labels are exact reuses of pillarPage-anxiety's own precedented {quote,label}
// pairs (all 6 panic quotes are verbatim matches to 6 of anxiety's 13) — zero invention,
// so isDraft stays false (the default) on every item. No bracketed placeholders existed
// in this draft, so nothing was left empty. noIndex: true throughout, no exceptions.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_ASSET = "image-81809025529940ba330633b2a9967b51d315ddde-2000x1388-jpg";

const faqIt = [
  { q: "Un attacco di panico è pericoloso?", a: "I sintomi sono intensi, ma la risposta che il corpo mette in atto è la stessa che userebbe di fronte a un pericolo reale, non un danno. Detto questo, la valutazione medica viene prima: distinguere il panico da altre cause richiede un accertamento, non un'interpretazione psicologica." },
  { q: "Quanto dura un attacco di panico?", a: "Il picco arriva in genere entro dieci minuti, poi la reazione si ritira. Quello che spesso dura più a lungo è la stanchezza dopo, e la tensione nell'attesa del prossimo." },
  { q: "Si può svenire durante un attacco di panico?", a: "È molto improbabile. Nel panico la pressione sanguigna sale, mentre lo svenimento avviene quando scende. La sensazione di essere sul punto di svenire, però, è tra le più comuni." },
  { q: "Devo prendere farmaci?", a: "Non sono un medico e non prescrivo farmaci. La psicoterapia può essere svolta con o senza terapia farmacologica; quando è già in corso, o quando emerge che potrebbe essere utile valutarla, lavoro in raccordo con il medico curante o lo psichiatra." },
  { q: "Si può lavorare sul panico online?", a: "Sì. Gli incontri online hanno la stessa durata e lo stesso costo di quelli in studio. Per alcune persone è la modalità che rende possibile iniziare, per esempio quando l'agorafobia rende difficile spostarsi." },
  { q: "Come funziona il primo colloquio?", a: "È un incontro di 45 minuti in cui mi racconti cosa succede. Serve a capire la richiesta e a valutare insieme se e come proseguire. Non comporta impegno a continuare." },
];

const faqEn = [
  { q: "Is a panic attack dangerous?", a: "The symptoms are intense, but what the body is doing is the same response it would mount in the face of real danger — not damage. That said, medical assessment comes first: telling panic apart from other causes takes an examination, not a psychological interpretation." },
  { q: "How long does a panic attack last?", a: "The peak usually comes within ten minutes, then the reaction recedes. What often lasts longer is the tiredness afterwards, and the tension of waiting for the next one." },
  { q: "Can you faint during a panic attack?", a: "It's very unlikely. In panic, blood pressure rises, while fainting happens when it drops. The sense of being about to faint, however, is one of the most common symptoms." },
  { q: "Do I need medication?", a: "I'm not a medical doctor and I don't prescribe. Psychotherapy can be done with or without medication; where medication is already in place, or where it emerges that it might be worth considering, I work alongside your GP or psychiatrist." },
  { q: "Can this be done online?", a: "Yes. Online sessions run the same length and cost the same as those in person. For some people it's what makes starting possible at all — for instance when agoraphobia makes travelling difficult." },
  { q: "How does the first session work?", a: "It's a 45-minute meeting where you tell me what's going on. It's there to understand what you're asking for and to work out together whether and how to continue. It doesn't commit you to carrying on." },
];

const recognitionIt = [
  { quote: "Ho sentito il cuore battere forte, mi mancava il fiato e ho avuto paura di stare per morire.", label: "Attacco di panico" },
  { quote: "Non ho paura solo dell'attacco di panico. Ho paura del prossimo.", label: "Disturbo di panico" },
  { quote: "Ho paura di sentirmi male lontano da casa.", label: "Agorafobia" },
  { quote: "Appena la porta in metro o in aereo si chiude sento di non avere più aria. Non è il posto chiuso. È l'idea di sentirmi male e non poter uscire.", label: "Claustrofobia" },
  { quote: "Prima di qualsiasi evento mi preoccupo di quello che di negativo potrebbe succedere.", label: "Ansia anticipatoria" },
  { quote: "Ho il terrore di vomitare o di strozzarmi ed evito cibi, luoghi e persone.", label: "Emetofobia" },
];

const recognitionEn = [
  { quote: "My heart was pounding, I couldn't breathe, and I was afraid I was about to die.", label: "Panic attack" },
  { quote: "It's not the panic attack I'm afraid of. It's the next one.", label: "Panic disorder" },
  { quote: "I'm afraid of feeling unwell far from home.", label: "Agoraphobia" },
  { quote: "The moment the metro doors or the aircraft doors close, I feel like there's no air. It isn't the enclosed space. It's the idea of feeling unwell and not being able to leave.", label: "Claustrophobia" },
  { quote: "Before anything happens, I'm already worrying about what could go wrong.", label: "Anticipatory anxiety" },
  { quote: "I'm terrified of vomiting or choking, and I avoid foods, places and people because of it.", label: "Emetophobia" },
];

const bodyIt = [
  h2("Cos'è un attacco di panico"),
  p("Un attacco di panico è un'ondata improvvisa di paura intensa che raggiunge il picco in pochi minuti — di solito meno di dieci — e poi si ritira."),
  p("Non arriva quasi mai in un momento di pericolo. Arriva in coda alla posta, in metropolitana, al supermercato, alla guida, a volte mentre si sta guardando la televisione. È una delle cose che lo rende più spaventoso: non c'è niente intorno che spieghi quello che sta succedendo."),
  p("Nel corpo succede molto, e tutto insieme: il cuore accelera, il respiro si fa corto o affannoso, arriva la sensazione di non prendere abbastanza aria. Vertigini, testa leggera, formicolii alle mani o intorno alla bocca. Sudorazione, tremore, brividi o vampate. Nausea o stretta allo stomaco. A volte dolore o oppressione al petto."),
  p("E succede molto anche nella testa: la sensazione che stia per accadere qualcosa di irreparabile. Paura di morire, di avere un infarto, di svenire, di perdere il controllo, di impazzire. Oppure una sensazione più difficile da descrivere: che le cose intorno non siano del tutto reali, o che non lo si sia noi stessi."),
  p("Chi lo attraversa la prima volta spesso chiama i soccorsi o va al pronto soccorso. È una reazione ragionevole: quello che il corpo sta facendo assomiglia molto a un'emergenza medica."),
  h2("Perché il corpo fa questo"),
  p("Quello che accade in un attacco di panico non è un guasto. È un sistema di allarme che si attiva in pieno, solo nel momento sbagliato."),
  p("Il corpo si sta preparando a una minaccia: manda sangue ai muscoli grandi, aumenta la frequenza cardiaca, accelera il respiro per portare più ossigeno. È la stessa risposta che sarebbe utile se ci fosse davvero qualcosa da cui scappare."),
  p("Il respiro accelerato spiega da solo diversi sintomi. Respirando più in fretta del necessario si abbassa l'anidride carbonica nel sangue, e questo produce formicolii, vertigini, sensazione di testa leggera, a volte la sensazione paradossale di non avere abbastanza aria proprio mentre si sta respirando troppo."),
  p("Una cosa che dico spesso, perché toglie un peso a molte persone: durante un attacco di panico la pressione sanguigna sale, non scende. Lo svenimento avviene per il motivo opposto. È per questo che, nel panico, svenire è molto improbabile — anche se la sensazione di essere sul punto di farlo è tra le più frequenti."),
  h2("Perché torna: il circolo"),
  p("Un singolo attacco di panico è un evento. Quello che lo trasforma in un disturbo è ciò che succede dopo."),
  p("Dopo il primo, l'attenzione cambia direzione: si comincia a monitorare il corpo. Il battito, il respiro, un capogiro, una stretta allo stomaco. Segnali che c'erano anche prima e che non venivano notati diventano ora oggetto di verifica continua."),
  p("E qui si chiude il circolo. Una sensazione viene letta come l'inizio di un attacco. Quella lettura attiva l'allarme. L'allarme produce esattamente le sensazioni che si temevano. Le sensazioni confermano la lettura iniziale."),
  p("A questo punto la paura non è più dell'attacco. È del prossimo attacco. È una paura che non ha bisogno di un attacco in corso per funzionare: lavora nell'attesa."),
  h2("L'evitamento, e come nasce l'agorafobia"),
  p("Il passo successivo è ragionevole, ed è quello che restringe la vita."),
  p("Si comincia a evitare i posti dove è già successo. Poi i posti che assomigliano a quelli. Poi le situazioni da cui sarebbe difficile uscire in fretta: la metropolitana, l'autostrada, l'aereo, la fila alla cassa, il cinema, l'ascensore. Poi si esce solo accompagnati. Poi si esce meno."),
  p("L'agorafobia non è paura degli spazi aperti, come si dice spesso. È la paura di trovarsi in una situazione da cui non si potrebbe andare via, o dove non si potrebbe essere soccorsi, se stessimo male."),
  p("Lo stesso vale per la claustrofobia legata al panico: non è il posto chiuso in sé, è l'idea di sentirsi male e non poter uscire."),
  p("E come ogni evitamento, funziona. Nell'immediato l'ansia scende, e questo insegna al cervello che evitare è stato giusto. Il campo si restringe una decisione sensata alla volta."),
  p("Accanto all'evitamento compaiono spesso i comportamenti protettivi: uscire solo con l'ansiolitico in tasca, sedersi vicino all'uscita, avere sempre la bottiglietta d'acqua, controllare dov'è il pronto soccorso più vicino. Anche questi danno sollievo. Anche questi mantengono la paura in vita, perché confermano che senza quella precauzione sarebbe successo qualcosa."),
  h2("Come lavoro con il panico"),
  p("Il primo incontro serve a ricostruire cosa succede: quando è iniziato, com'è il primo minuto di un attacco, cosa si evita adesso che prima non si evitava, cosa si porta in tasca uscendo di casa."),
  p("Da lì il lavoro procede su tre fronti."),
  p("Capire il meccanismo. Non il panico in generale, ma il proprio: quali sensazioni fanno partire l'allarme, quali interpretazioni lo alimentano, quali strategie lo stanno mantenendo. Molte persone scoprono qui che quello che facevano per proteggersi era parte del problema."),
  p("Lavorare sul corpo. Nel panico il corpo arriva prima del pensiero. Il respiro, l'attenzione ai segnali corporei, il modo in cui si reagisce a un battito accelerato: sono cose su cui si può lavorare direttamente, e sono spesso il punto da cui si comincia."),
  p("Recuperare il campo. Gradualmente e d'accordo, ricostruire l'accesso alle situazioni che si sono ristrette. Non affrontando tutto insieme, e non da soli."),
  p("Ho studiato Neuroscienze Cognitive e Cliniche all'Università di Maastricht e ho lavorato come ricercatore proprio sui meccanismi dell'ansia e del panico, prima della specializzazione in psicoterapia. È il motivo per cui il corpo è al centro di come lavoro."),
  p("E c'è un'altra ragione. Il mio primo attacco di panico è arrivato nel 2001, durante una lezione all'università. Non sapevo cosa fosse e non sapevo dargli un nome. Sapere dall'interno com'è quel minuto non sostituisce la formazione clinica, ma cambia il modo in cui si ascolta chi lo sta raccontando."),
  h2("Quando ha senso chiedere aiuto"),
  p("Un attacco di panico isolato non è di per sé un disturbo. Capita, e a molte persone capita una volta sola."),
  p("Le domande più utili riguardano quello che è successo dopo:"),
  p("— È tornato, o ho paura che torni?"),
  p("— Ho cominciato a evitare posti o situazioni?"),
  p("— Esco portandomi dietro qualcosa che prima non mi serviva?"),
  p("— Quanto tempo passo a controllare come sto?"),
  p("Se una di queste risposte è sì, è il caso di parlarne. Non serve aspettare che il campo si restringa ancora."),
  p("Un'ultima cosa, se non è ancora stata fatta: la valutazione medica viene prima. I sintomi del panico sono corporei, e distinguerli da altre cause richiede un accertamento medico, non un'interpretazione psicologica."),
];

const bodyEn = [
  h2("What a panic attack is"),
  p("A panic attack is a sudden surge of intense fear that peaks within a few minutes — usually under ten — and then recedes."),
  p("It almost never arrives at a moment of danger. It arrives in a queue, on the metro, in a supermarket, while driving, sometimes while watching television. That's part of what makes it frightening: there's nothing around you that explains what's happening."),
  p("A great deal happens in the body, all at once: the heart races, breathing becomes short or laboured, and with it the sense of not getting enough air. Dizziness, light-headedness, tingling in the hands or around the mouth. Sweating, trembling, chills or flushes. Nausea or a tightness in the stomach. Sometimes chest pain or pressure."),
  p("And a great deal happens in the mind: the sense that something irreversible is about to occur. Fear of dying, of having a heart attack, of fainting, of losing control, of going mad. Or something harder to put into words — that the surroundings aren't quite real, or that you aren't quite yourself."),
  p("People going through it for the first time often call an ambulance or go to A&E. That's a reasonable response: what the body is doing looks a great deal like a medical emergency."),
  h2("Why the body does this"),
  p("What happens in a panic attack isn't a malfunction. It's an alarm system firing at full strength, at the wrong moment."),
  p("The body is preparing for a threat: sending blood to the large muscles, raising the heart rate, speeding up breathing to take in more oxygen. It's the same response that would be useful if there were genuinely something to run from."),
  p("Rapid breathing alone accounts for several of the symptoms. Breathing faster than needed lowers carbon dioxide in the blood, which produces tingling, dizziness, light-headedness, and sometimes the paradoxical sense of not getting enough air precisely while breathing too much."),
  p("One thing I say often, because it lifts a weight for many people: during a panic attack blood pressure rises, it doesn't fall. Fainting happens for the opposite reason. That's why fainting during panic is very unlikely — even though the sense of being about to is among the most common symptoms of all."),
  h2("Why it comes back: the cycle"),
  p("A single panic attack is an event. What turns it into a disorder is what happens afterwards."),
  p("After the first one, attention changes direction: you start monitoring the body. The heartbeat, the breath, a moment of dizziness, a tightness in the stomach. Signals that were always there and went unnoticed become objects of constant checking."),
  p("And that's where the cycle closes. A sensation gets read as the beginning of an attack. That reading triggers the alarm. The alarm produces exactly the sensations that were feared. The sensations confirm the original reading."),
  p("At that point the fear is no longer of the attack. It's of the next one. And that fear doesn't need an attack in progress to work: it works in the waiting."),
  h2("Avoidance, and how agoraphobia begins"),
  p("The next step is reasonable, and it's the one that narrows a life."),
  p("You start avoiding the places where it happened. Then places that resemble them. Then situations that would be hard to leave quickly: the metro, the motorway, a flight, a queue at the till, the cinema, a lift. Then you only go out accompanied. Then you go out less."),
  p("Agoraphobia isn't a fear of open spaces, as it's often described. It's the fear of being somewhere you couldn't leave, or couldn't be helped, if you felt unwell."),
  p("The same applies to panic-related claustrophobia: it isn't the enclosed space itself, it's the idea of feeling unwell and not being able to get out."),
  p("And like every avoidance, it works. In the moment the anxiety drops, and that teaches the brain that avoiding was the right call. The field narrows one sensible decision at a time."),
  p("Alongside avoidance come the safety behaviours: only going out with medication in your pocket, sitting near the exit, always carrying a bottle of water, checking where the nearest hospital is. These bring relief too. And they keep the fear alive too, because they confirm that without the precaution something would have happened."),
  h2("Panic and living abroad"),
  p("A large part of the people I see in English didn't grow up in Italy."),
  p("Panic tends to arrive when things are already stretched, and a move stretches most of them: the support network is in another time zone, the health system is unfamiliar, and a first attack means explaining chest pain in a second language, to a doctor you've never met, in a hospital you've never been to."),
  p("Several things follow from that. A first attack that got investigated medically and never named. Avoidance that reads as ordinary adjustment — not going out much, in a new city, seems normal. A shrinking world that nobody at home can see well enough to notice."),
  p("None of this makes panic different in kind. But it changes what maintains it, and that's worth naming rather than working around."),
  h2("How I work with panic"),
  p("The first session is about reconstructing what happens: when it started, what the first minute of an attack is like, what you avoid now that you didn't before, what you take with you when you leave the house."),
  p("From there the work runs on three fronts."),
  p("Understanding the mechanism. Not panic in general, but yours: which sensations set off the alarm, which interpretations feed it, which strategies are maintaining it. Many people discover here that what they were doing to protect themselves was part of the problem."),
  p("Working with the body. In panic the body arrives before the thought. Breathing, attention to bodily signals, how you respond to a racing heart — these can be worked on directly, and they're often where we start."),
  p("Recovering the field. Gradually and by agreement, rebuilding access to the situations that have narrowed. Not all at once, and not alone."),
  p("I studied Cognitive and Clinical Neuroscience at Maastricht University and worked as a researcher on the mechanisms of anxiety and panic before training as a psychotherapist. That's why the body is central to how I work."),
  p("There's another reason. My own first panic attack came in 2001, during a university lecture. I didn't know what it was and had no name for it. Knowing that minute from the inside doesn't replace clinical training, but it changes how you listen to someone describing it."),
  h2("When it makes sense to ask for help"),
  p("A single panic attack isn't in itself a disorder. It happens, and for many people it happens once."),
  p("The more useful questions are about what came afterwards:"),
  p("— Has it come back, or am I afraid it will?"),
  p("— Have I started avoiding places or situations?"),
  p("— Do I leave the house carrying something I didn't used to need?"),
  p("— How much time do I spend checking how I am?"),
  p("If any of those is a yes, it's worth talking about. There's no need to wait for the field to narrow further."),
  p("One last thing, if it hasn't been done: medical assessment comes first. Panic symptoms are physical, and telling them apart from other causes takes a medical examination, not a psychological interpretation."),
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
    const itId = `faqItem-panic-${n}-it`;
    const enId = `faqItem-panic-${n}-en`;
    await upsertDoc(client, itId, "faqItem", { question: itItem.q, answer: faqAnswer(itItem.a), language: "it" });
    await upsertDoc(client, enId, "faqItem", { question: enItem.q, answer: faqAnswer(enItem.a), language: "en" });
    await upsertTranslationMetadata(client, `faqItem-panic-${n}`, "faqItem", itId, enId);
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

  await upsertDoc(client, "pillarPage-panic-it", "pillarPage", {
    title: "Attacchi di panico e agorafobia",
    slug: { _type: "slug", current: "attacchi-di-panico" },
    titleEmphasisWord: "agorafobia",
    heroKicker: "AREA DI INTERVENTO",
    standfirst: "Il primo attacco dura pochi minuti. La paura del secondo può durare anni.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Banchina di una stazione della metropolitana vuota, dalle pareti e dal soffitto blu metallizzato, con le porte scorrevoli dei treni chiuse su entrambi i lati." },
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
      metaTitle: "Attacchi di panico e agorafobia — Psicoterapeuta a Milano",
      metaDescription: "Cos'è un attacco di panico, perché torna e come si lavora in psicoterapia. Studi a Milano, Monza, Cernusco sul Naviglio e online.",
      noIndex: true,
    },
    language: "it",
  });

  await upsertDoc(client, "pillarPage-panic-en", "pillarPage", {
    title: "Panic attacks and agoraphobia",
    slug: { _type: "slug", current: "panic-attacks" },
    titleEmphasisWord: "agoraphobia",
    heroKicker: "AREA OF WORK",
    standfirst: "The first attack lasts a few minutes. The fear of the second one can last years.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Empty metro station platform with blue-toned metallic walls and ceiling, train doors closed on both sides." },
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
      metaTitle: "Panic Attacks & Agoraphobia — Therapist in English, Milan",
      metaDescription: "What a panic attack is, why it returns, and how the work is done. Italian psychotherapist working in English in Milan, Monza and online.",
      noIndex: true,
    },
    language: "en",
  });

  await upsertTranslationMetadata(client, "pillarPage-panic", "pillarPage", "pillarPage-panic-it", "pillarPage-panic-en");

  console.log("\n=== panic pillar: done ===");
}

main();
