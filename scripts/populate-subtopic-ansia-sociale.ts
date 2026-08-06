import { createClient } from "@sanity/client";
import { h2, p } from "./lib/portableText";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Subtopic rollout — social anxiety, parented under the anxiety pillar.
// Source: contents/sub-ansia-sociale-bozza.md (IT+EN combined). Copy
// transcribed verbatim, no edits, review note not imported. Epigraph is
// Giuseppe's own words. noIndex: true throughout.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_ASSET = "image-8fdb6d13e7b07c400cf1f58bfc5848cb222675b3-2000x1333-jpg";
const PARENT_IT = "pillarPage-anxiety-it";
const PARENT_EN = "pillarPage-anxiety-en";

const faqIt = [
  { q: "Ansia sociale e timidezza sono la stessa cosa?", a: "No. La timidezza è un tratto del carattere che non impedisce di fare le cose. L'ansia sociale comporta evitamento, e quell'evitamento restringe la vita." },
  { q: "Riguarda solo parlare in pubblico?", a: "No. Le situazioni più frequenti sono ordinarie: una telefonata, un pranzo con colleghi, entrare in un negozio, chiedere qualcosa. Parlare in pubblico è una forma, non la definizione." },
  { q: "Si può lavorare online?", a: "Sì. Gli incontri online hanno la stessa durata e lo stesso costo di quelli in studio." },
];

const faqEn = [
  { q: "Are social anxiety and shyness the same thing?", a: "No. Shyness is a character trait that doesn't stop you doing things. Social anxiety involves avoidance, and that avoidance narrows a life." },
  { q: "Is it only about public speaking?", a: "No. The most common situations are ordinary ones: a phone call, lunch with colleagues, going into a shop, asking for something. Public speaking is one form, not the definition." },
  { q: "Can this be done online?", a: "Yes. Online sessions run the same length and cost the same as those in person." },
];

const bodyIt = [
  h2("Ansia sociale o timidezza: qual è la differenza"),
  p("La timidezza è un tratto. Rende più lenta l'apertura, ma non impedisce di fare le cose."),
  p("L'ansia sociale è un'altra faccenda. Non riguarda la difficoltà a parlare con gli sconosciuti, ma la certezza anticipata di essere giudicati male — e quello che si fa per evitare che accada."),
  p("La differenza pratica è l'evitamento. Chi è timido a una cena parla poco. Chi ha ansia sociale a quella cena non ci va, oppure ci va e passa la serata a monitorare come sta andando."),
  h2("La paura del giudizio, e cosa la mantiene"),
  p("Il meccanismo centrale è un'attenzione girata al contrario."),
  p("Nelle situazioni sociali l'attenzione dovrebbe stare fuori: sull'altro, sulla conversazione, su quello che succede. Nell'ansia sociale si sposta dentro: come sto apparendo, sto arrossendo, sto sudando, la voce mi trema, ho detto una cosa stupida."),
  p("Questo produce due effetti insieme. Il primo è che si perde metà della conversazione, perché una parte dell'attenzione è impegnata altrove. Il secondo è che l'informazione su cui si giudica la propria prestazione non viene dall'esterno — viene da come ci si è sentiti dentro."),
  p("Ed è per questo che la valutazione è quasi sempre più severa della realtà: si sta giudicando la propria ansia, non quello che gli altri hanno effettivamente visto."),
  h2("Il post-mortem: rimuginare dopo"),
  p("Molte persone descrivono la parte peggiore non come la situazione, ma come le ore successive."),
  p("Si ripercorre la conversazione cercando errori. Si isola una frase e la si rilegge decine di volte. Si immagina cosa avranno pensato. E ogni ripasso rende il ricordo più negativo di com'era l'evento."),
  p("Questa revisione ha l'aria di essere utile — sembra imparare dagli errori. Non lo è: consolida una versione dei fatti costruita dall'interno dell'ansia."),
  h2("Ansia da prestazione e paura di parlare in pubblico"),
  p("Una forma frequente si concentra su situazioni specifiche: parlare in pubblico, una riunione, un esame, una presentazione."),
  p("Qui la struttura è ancora più esplicita: c'è una prestazione, c'è un pubblico, c'è un giudizio. Il corpo reagisce come reagirebbe di fronte a una minaccia, e i segnali di quella reazione — voce che trema, rossore, sudore — diventano essi stessi motivo di paura, perché potrebbero essere visti."),
  p("Da lì nasce il tentativo di controllarli, che li aumenta."),
  h2("I comportamenti protettivi che peggiorano le cose"),
  p("Non sono sempre evitamenti espliciti. Spesso sono strategie fini, invisibili da fuori."),
  p("Preparare mentalmente le frasi prima di dirle. Parlare poco per non sbagliare. Bere qualcosa prima per allentare. Tenere il telefono in mano per avere una via d'uscita. Stare vicino a una persona conosciuta. Evitare gli sguardi."),
  p("Ognuna riduce l'ansia sul momento. Tutte insieme impediscono l'unica cosa che la ridurrebbe davvero: scoprire che senza di esse non sarebbe successo niente."),
  h2("Psicoterapia per l'ansia sociale a Milano, Monza e Cernusco"),
  p("Ricevo in due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Lavoro in italiano e in inglese."),
  p("Il primo incontro serve a capire in quali situazioni compare, cosa si teme esattamente che accada, e cosa si fa per impedirlo — questa terza parte è spesso quella meno visibile a chi la mette in atto."),
  p("Poi il lavoro riguarda tre cose: spostare l'attenzione da dentro a fuori, ridurre progressivamente i comportamenti protettivi, e verificare nella realtà le previsioni che si danno per certe."),
  h2("Quando ha senso chiedere aiuto"),
  p("— Rinuncio a cose che vorrei fare per non trovarmi in quelle situazioni?"),
  p("— Passo le ore dopo a ripercorrere quello che ho detto?"),
  p("— Ci sono strategie che uso sempre e senza cui non ci andrei?"),
  p("— Sto scegliendo il lavoro, o le amicizie, in base a questo?"),
];

const bodyEn = [
  h2("Social anxiety or shyness: the difference"),
  p("Shyness is a trait. It makes opening up slower, but it doesn't stop you doing things."),
  p("Social anxiety is something else. It isn't difficulty talking to strangers; it's the advance certainty of being judged badly — and what you do to prevent that happening."),
  p("The practical difference is avoidance. A shy person at a dinner says little. Someone with social anxiety doesn't go to that dinner, or goes and spends the evening monitoring how it's going."),
  h2("Fear of judgement, and what maintains it"),
  p("The central mechanism is attention turned the wrong way round."),
  p("In social situations attention should sit outside: on the other person, on the conversation, on what's happening. In social anxiety it moves inward: how am I coming across, am I going red, am I sweating, is my voice shaking, did I just say something stupid."),
  p("That produces two effects at once. The first is that you miss half the conversation, because part of your attention is engaged elsewhere. The second is that the information you judge your own performance on doesn't come from outside — it comes from how you felt inside."),
  p("That's why the verdict is almost always harsher than reality: you're judging your own anxiety, not what anyone actually saw."),
  h2("The post-mortem"),
  p("Many people describe the worst part not as the situation but as the hours afterwards."),
  p("You go back over the conversation looking for mistakes. You isolate one sentence and reread it dozens of times. You imagine what they must have thought. And each pass makes the memory more negative than the event was."),
  p("This review looks useful — it resembles learning from mistakes. It isn't: it consolidates a version of events assembled from inside the anxiety."),
  h2("Performance anxiety and fear of public speaking"),
  p("One frequent form concentrates on specific situations: speaking in public, a meeting, an exam, a presentation."),
  p("Here the structure is even more explicit: there's a performance, an audience, a judgement. The body responds as it would to a threat, and the signals of that response — shaking voice, flushing, sweating — become reasons for fear in themselves, because they might be seen."),
  p("From there comes the attempt to control them, which increases them."),
  h2("The safety behaviours that make it worse"),
  p("They aren't always outright avoidance. More often they're fine strategies, invisible from outside."),
  p("Rehearsing sentences before saying them. Speaking little to avoid errors. A drink beforehand to loosen up. Holding your phone as an escape route. Staying near someone you know. Avoiding eye contact."),
  p("Each reduces anxiety in the moment. Together they prevent the one thing that would genuinely reduce it: discovering that without them nothing would have happened."),
  h2("Social anxiety therapy in English in Milan and Monza"),
  p("I'm an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy, working in English and Italian, in two practices in Milan, in Monza, in Cernusco sul Naviglio, and online."),
  p("Social anxiety behaves differently in a second language, and that's worth naming. Speaking a language you're less fluent in gives the monitoring something real to hold onto — an accent, a missing word, a slower reply — and it becomes very hard to tell apart what's anxiety and what's genuinely a language gap. Working in English removes that variable from the room, at least for the hour."),
  p("The first session is about which situations it appears in, what exactly you fear will happen, and what you do to prevent it — that third part is usually the least visible to the person doing it."),
  p("Then the work concerns three things: moving attention from inside to outside, gradually reducing the safety behaviours, and testing against reality the predictions that feel like certainties."),
  h2("When it makes sense to ask for help"),
  p("— Am I giving up things I'd like to do to avoid those situations?"),
  p("— Do I spend the hours afterwards going back over what I said?"),
  p("— Are there strategies I always use, without which I wouldn't go?"),
  p("— Am I choosing work, or friendships, around this?"),
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
    const itId = `faqItem-ansia-sociale-${n}-it`;
    const enId = `faqItem-ansia-sociale-${n}-en`;
    await upsertDoc(client, itId, "faqItem", { question: itItem.q, answer: faqAnswer(itItem.a), language: "it" });
    await upsertDoc(client, enId, "faqItem", { question: enItem.q, answer: faqAnswer(enItem.a), language: "en" });
    await upsertTranslationMetadata(client, `faqItem-ansia-sociale-${n}`, "faqItem", itId, enId);
    faqItIds.push(itId);
    faqEnIds.push(enId);
  }

  await upsertDoc(client, "subtopicPage-ansia-sociale-it", "subtopicPage", {
    title: "Ansia sociale",
    parentPillar: { _type: "reference", _ref: PARENT_IT },
    slug: { _type: "slug", current: "ansia-sociale" },
    titleEmphasisWord: "sociale",
    heroKicker: "DISTURBI D'ANSIA",
    standfirst: "Non è timidezza. È la sensazione di essere continuamente valutati, e di non passare l'esame.",
    epigraph: "Evito le persone per non sentirmi giudicato e ho paura di fare una figuraccia anche nelle situazioni più normali.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Strada pedonale affollata, fuori fuoco, con persone che camminano tra negozi illuminati." },
    faqItems: faqItIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyIt,
    seo: {
      metaTitle: "Ansia sociale — Psicoterapeuta a Milano e Monza",
      metaDescription: "Paura del giudizio, evitamento, rimuginio dopo. Cos'è l'ansia sociale e come si lavora. Milano, Monza, Cernusco sul Naviglio e online.",
      noIndex: true,
    },
    language: "it",
  });

  await upsertDoc(client, "subtopicPage-ansia-sociale-en", "subtopicPage", {
    title: "Social anxiety",
    parentPillar: { _type: "reference", _ref: PARENT_EN },
    slug: { _type: "slug", current: "social-anxiety" },
    titleEmphasisWord: "anxiety",
    heroKicker: "ANXIETY DISORDERS",
    standfirst: "It isn't shyness. It's the sense of being continuously assessed, and of not passing.",
    epigraph: "I avoid people so I won't feel judged, and I'm afraid of embarrassing myself even in ordinary situations.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Out-of-focus crowded pedestrian street, with people walking past lit shop windows." },
    faqItems: faqEnIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyEn,
    seo: {
      metaTitle: "Social Anxiety — Therapist in English, Milan",
      metaDescription: "Fear of judgement, avoidance, replaying it afterwards. What social anxiety is and how the work is done. Milan, Monza and online.",
      noIndex: true,
    },
    language: "en",
  });

  await upsertTranslationMetadata(client, "subtopicPage-ansia-sociale", "subtopicPage", "subtopicPage-ansia-sociale-it", "subtopicPage-ansia-sociale-en");

  console.log("\n=== ansia-sociale subtopic: done ===");
}

main();
