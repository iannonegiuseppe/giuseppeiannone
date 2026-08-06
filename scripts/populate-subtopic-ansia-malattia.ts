import { createClient } from "@sanity/client";
import { h2, p } from "./lib/portableText";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Subtopic rollout — health anxiety / hypochondria, parented under the
// anxiety pillar. Source: contents/sub-ansia-malattia-bozza.md (IT+EN
// combined). Built as ONE page, as drafted — the draft's own open
// question ("da confermare: se le considera due cose diverse, servono
// due pagine") was flagged in the Stage 1 report and not overridden here;
// "all accepted" carries the draft's own default (one page) forward. If
// Giuseppe later wants "ipocondria" split into its own page, the second
// recognition quote the draft held in reserve («Vivo controllando
// continuamente il mio corpo per paura delle malattie») is documented in
// that draft's own NOTE section, not imported into this document. Copy
// transcribed verbatim otherwise. noIndex: true throughout.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_ASSET = "image-058e0f416405106959d70fa29dfc94bb0a7529f0-2000x1333-jpg";
const PARENT_IT = "pillarPage-anxiety-it";
const PARENT_EN = "pillarPage-anxiety-en";

const faqIt = [
  { q: "Ho fatto tutti gli esami e sono negativi. Perché non mi tranquillizzo?", a: "Perché la rassicurazione risponde a una domanda diversa da quella che si sta facendo. Un esame dice cosa non c'era in quel momento; non può dare la certezza assoluta che si sta cercando, e quella ricerca è il meccanismo su cui si lavora." },
  { q: "Ipocondria e ansia da malattia sono la stessa cosa?", a: "Nell'uso corrente sì. \"Ipocondria\" è il termine più antico; le classificazioni attuali usano nomi diversi ma descrivono lo stesso funzionamento." },
  { q: "Devo smettere di fare controlli?", a: "Non è una decisione che prendo io, e non riguarda i controlli prescritti da un medico. Riguarda le verifiche fatte per abbassare l'ansia, che sono un'altra cosa e si affrontano gradualmente." },
];

const faqEn = [
  { q: "I've had every test and they're clear. Why am I not reassured?", a: "Because reassurance answers a different question from the one being asked. A test says what wasn't there at that moment; it can't give the absolute certainty being sought, and that search is the mechanism the work addresses." },
  { q: "Are hypochondria and health anxiety the same thing?", a: "In everyday use, yes. \"Hypochondria\" is the older term; current classifications use different names but describe the same pattern." },
  { q: "Do I have to stop having check-ups?", a: "That isn't my decision to make, and it doesn't concern check-ups your doctor has prescribed. It concerns checks done to lower anxiety, which are a different thing and are addressed gradually." },
];

const bodyIt = [
  h2("Ansia da malattia: quando il corpo diventa un sorvegliato"),
  p("Tutti notano i propri sintomi. La differenza sta in cosa succede dopo averli notati."),
  p("Nell'ansia da malattia una sensazione corporea non resta una sensazione: diventa immediatamente un'ipotesi diagnostica, e l'ipotesi tende sempre verso la spiegazione peggiore."),
  p("Un mal di testa non è un mal di testa. Un battito irregolare non è un battito irregolare. Ogni segnale viene interpretato come possibile inizio di qualcosa di grave, e da lì parte la verifica."),
  p("Il punto centrale è questo: il corpo produce sensazioni continuamente. Chi le sorveglia ne troverà sempre. Non perché stia peggio degli altri, ma perché sta guardando."),
  h2("Perché la rassicurazione non dura"),
  p("Un esame negativo dovrebbe chiudere la questione. Non la chiude, e questo confonde sia chi lo vive sia chi gli sta intorno."),
  p("Il sollievo arriva davvero, ed è reale. Ma dura poco: qualche ora, qualche giorno. Poi ricompare un dubbio — e se avessero guardato la cosa sbagliata, e se fosse troppo presto per vedersi, e se quel valore al limite significasse qualcosa."),
  p("Il motivo è che la rassicurazione risponde alla domanda sbagliata. La domanda non è \"sono malato?\". È \"posso essere certo di non esserlo?\". E a quella domanda nessun esame può rispondere, perché la certezza assoluta non esiste in medicina."),
  p("Ogni rassicurazione, quindi, insegna una cosa sola: che per stare tranquilli serve un controllo. E la volta dopo ne servirà un altro."),
  h2("Il controllo: cercare online, palpare, misurare"),
  p("Le verifiche prendono forme diverse e tutte hanno la stessa struttura."),
  p("Cercare i sintomi online. Palpare ripetutamente la stessa zona. Misurare la pressione o il battito più volte al giorno. Chiedere ai familiari se si è pallidi. Confrontare una foto di oggi con una di sei mesi fa. Fissare visite, o rimandarle per paura di cosa potrebbero dire."),
  p("Ognuna di queste azioni abbassa l'ansia per pochi minuti e la rialza subito dopo, perché nessuna può produrre la certezza che si sta cercando."),
  p("La ricerca online merita una nota a parte: è progettata per mostrare le corrispondenze, non per pesarle. Cercare un sintomo restituisce sempre anche la diagnosi peggiore che lo comprende."),
  h2("Ipocondria e ansia: qual è il legame"),
  p("\"Ipocondria\" è il termine tradizionale, ed è ancora quello che usano molte persone per descriversi. Nei manuali diagnostici attuali la categoria è cambiata nome, ma il quadro è lo stesso: preoccupazione persistente per la salute, sproporzionata rispetto ai riscontri medici, con comportamenti di controllo o, all'opposto, di evitamento totale della medicina."),
  p("È un disturbo d'ansia, e si comporta come tale: c'è un allarme che si attiva, un'interpretazione che lo alimenta, e strategie che lo mantengono credendo di ridurlo."),
  h2("Quando è meglio parlarne con un medico"),
  p("Va detto chiaramente, ed è la ragione per cui questa pagina non prende posizione sui sintomi di chi la legge: la valutazione medica viene prima."),
  p("Il lavoro psicologico non serve a stabilire se un sintomo abbia una causa organica — non è di mia competenza e non lo sarà mai. Serve quando gli accertamenti sono stati fatti, la valutazione clinica c'è, e la preoccupazione continua comunque."),
  p("Se gli accertamenti non sono stati fatti, il primo passo è quello."),
  h2("Psicoterapia per l'ansia da malattia a Milano, Monza e Cernusco"),
  p("Ricevo in due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Lavoro in italiano e in inglese."),
  p("Il primo incontro serve a ricostruire il quadro: da quanto tempo, quali sintomi, quali accertamenti sono già stati fatti, e cosa si fa quando la preoccupazione arriva."),
  p("Il lavoro poi riguarda tre cose: ridurre il ruolo delle verifiche, cambiare il modo in cui le sensazioni corporee vengono interpretate, e lavorare sulla tolleranza dell'incertezza — che è il vero nodo, perché la certezza cercata non è ottenibile."),
  h2("Quando ha senso chiedere aiuto"),
  p("— Quanto tempo al giorno passo a controllare come sto?"),
  p("— Il sollievo dopo un esame quanto dura?"),
  p("— Ho cercato online sintomi nell'ultima settimana?"),
  p("— Evito i medici, o li cerco più del necessario?"),
];

const bodyEn = [
  h2("Health anxiety: when the body becomes something to police"),
  p("Everyone notices their own symptoms. The difference is what happens after noticing."),
  p("In health anxiety a bodily sensation doesn't stay a sensation: it immediately becomes a diagnostic hypothesis, and the hypothesis always leans toward the worst available explanation."),
  p("A headache isn't a headache. An irregular heartbeat isn't an irregular heartbeat. Every signal gets read as the possible beginning of something serious, and from there the checking starts."),
  p("The central point is this: the body produces sensations constantly. Anyone monitoring will always find some. Not because they're less well than anyone else, but because they're looking."),
  h2("Why reassurance doesn't hold"),
  p("A clear test result should close the question. It doesn't, and that confuses both the person living it and everyone around them."),
  p("The relief does arrive, and it's real. But it's short: a few hours, a few days. Then a doubt returns — what if they looked at the wrong thing, what if it's too early to show, what if that borderline value means something."),
  p("The reason is that reassurance answers the wrong question. The question isn't \"am I ill?\". It's \"can I be certain I'm not?\". And no test can answer that, because absolute certainty doesn't exist in medicine."),
  p("So every reassurance teaches one thing only: that being calm requires a check. And next time it will require another."),
  h2("Checking: searching online, examining, measuring"),
  p("The checks take different forms and all share the same structure."),
  p("Searching symptoms online. Repeatedly examining the same area. Taking blood pressure or pulse several times a day. Asking family whether you look pale. Comparing a photo from today with one from six months ago. Booking appointments, or postponing them out of fear of what they'd say."),
  p("Each of these lowers anxiety for a few minutes and raises it straight afterwards, because none can produce the certainty being sought."),
  p("Online searching deserves a note of its own: it's built to show matches, not to weigh them. Searching a symptom always returns the worst diagnosis that includes it, alongside the others."),
  h2("Hypochondria and anxiety"),
  p("\"Hypochondria\" is the traditional term, and it's still what many people use to describe themselves. Current diagnostic manuals have changed the category's name, but the picture is the same: persistent health worry, out of proportion to medical findings, with checking behaviours or, at the opposite extreme, total avoidance of medicine."),
  p("It's an anxiety disorder and behaves like one: an alarm that fires, an interpretation that feeds it, and strategies that maintain it while appearing to reduce it."),
  h2("When to speak to a doctor instead"),
  p("This needs saying plainly, and it's why this page takes no position on any reader's symptoms: medical assessment comes first."),
  p("Psychological work isn't there to establish whether a symptom has a physical cause — that isn't within my competence and never will be. It's for when the investigations have been done, the clinical assessment exists, and the worry continues anyway."),
  p("If the investigations haven't been done, that's the first step."),
  h2("Health anxiety therapy in English in Milan and Monza"),
  p("I'm an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy, working in English and Italian, in two practices in Milan, in Monza, in Cernusco sul Naviglio, and online."),
  p("Health anxiety is often harder abroad. An unfamiliar health system, uncertainty about whether you've been understood in a second language, results explained in terminology you can't fully weigh, and no GP who has known you for twenty years — all of it makes reassurance thinner and doubt easier. That's worth naming rather than treating as background."),
  p("The first session is about reconstructing the picture: how long, which symptoms, which investigations have already been done, and what you do when the worry arrives."),
  p("The work then concerns three things: reducing the role of checking, changing how bodily sensations get interpreted, and building tolerance of uncertainty — which is the real knot, because the certainty being sought isn't available."),
  h2("When it makes sense to ask for help"),
  p("— How much of my day goes into checking how I am?"),
  p("— How long does the relief after a test last?"),
  p("— Have I searched symptoms online in the last week?"),
  p("— Do I avoid doctors, or seek them more than necessary?"),
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
    const itId = `faqItem-ansia-malattia-${n}-it`;
    const enId = `faqItem-ansia-malattia-${n}-en`;
    await upsertDoc(client, itId, "faqItem", { question: itItem.q, answer: faqAnswer(itItem.a), language: "it" });
    await upsertDoc(client, enId, "faqItem", { question: enItem.q, answer: faqAnswer(enItem.a), language: "en" });
    await upsertTranslationMetadata(client, `faqItem-ansia-malattia-${n}`, "faqItem", itId, enId);
    faqItIds.push(itId);
    faqEnIds.push(enId);
  }

  await upsertDoc(client, "subtopicPage-ansia-malattia-it", "subtopicPage", {
    title: "Ansia da malattia",
    parentPillar: { _type: "reference", _ref: PARENT_IT },
    slug: { _type: "slug", current: "ansia-da-malattia" },
    titleEmphasisWord: "malattia",
    heroKicker: "DISTURBI D'ANSIA",
    standfirst: "Gli esami dicono che va tutto bene, e il sollievo dura due giorni.",
    epigraph: "Gli esami dicono che va tutto bene. Ma ogni sintomo mi fa pensare alla malattia peggiore.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Uomo seduto in una stanza in penombra, guarda preoccupato lo schermo del telefono con il pugno vicino al mento." },
    faqItems: faqItIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyIt,
    seo: {
      metaTitle: "Ansia da malattia e ipocondria — Psicoterapeuta a Milano",
      metaDescription: "Quando gli esami sono negativi ma la preoccupazione resta. Controllo, rassicurazione, incertezza. Milano, Monza, Cernusco sul Naviglio e online.",
      noIndex: true,
    },
    language: "it",
  });

  await upsertDoc(client, "subtopicPage-ansia-malattia-en", "subtopicPage", {
    title: "Health anxiety",
    parentPillar: { _type: "reference", _ref: PARENT_EN },
    slug: { _type: "slug", current: "health-anxiety" },
    titleEmphasisWord: "anxiety",
    heroKicker: "ANXIETY DISORDERS",
    standfirst: "The tests say everything is fine, and the relief lasts two days.",
    epigraph: "The tests say everything is fine. But every symptom makes me think of the worst possible illness.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Man sitting in a dim room, looking worriedly at his phone screen, fist raised near his chin." },
    faqItems: faqEnIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyEn,
    seo: {
      metaTitle: "Health Anxiety — Therapist in English, Milan",
      metaDescription: "When tests are clear but the worry stays. Checking, reassurance, uncertainty. Italian psychotherapist working in English in Milan and online.",
      noIndex: true,
    },
    language: "en",
  });

  await upsertTranslationMetadata(client, "subtopicPage-ansia-malattia", "subtopicPage", "subtopicPage-ansia-malattia-it", "subtopicPage-ansia-malattia-en");

  console.log("\n=== ansia-malattia subtopic: done ===");
}

main();
