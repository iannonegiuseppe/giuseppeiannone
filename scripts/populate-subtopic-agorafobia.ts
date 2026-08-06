import { createClient } from "@sanity/client";
import { h2, p } from "./lib/portableText";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Subtopic rollout — agoraphobia, parented under the panic pillar.
// Source: contents/sub-agorafobia-bozza.md (IT+EN combined). Copy
// transcribed verbatim, no edits, review note not imported. Epigraph is
// Giuseppe's own words (per the draft's own note), so no isDraft-style
// flag applies here — this template has no such field anyway (epigraph
// isn't part of the recognitionItem shape). noIndex: true throughout.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_ASSET = "image-22d5615aa812c178d7a877dae4aab92d48a72ea1-2000x1333-jpg";
const PARENT_IT = "pillarPage-panic-it";
const PARENT_EN = "pillarPage-panic-en";

const faqIt = [
  { q: "L'agorafobia è la paura degli spazi aperti?", a: "No. È la paura di trovarsi dove sarebbe difficile andarsene, o essere soccorsi, se si stesse male. Per questo comprende anche spazi chiusi e affollati." },
  { q: "Si può avere agorafobia senza attacchi di panico?", a: "Sì, anche se nella maggior parte dei casi l'agorafobia si sviluppa dopo. Il criterio è la paura della situazione, non la presenza di attacchi." },
  { q: "Devo uscire di casa per iniziare la terapia?", a: "No. Gli incontri online hanno la stessa durata e lo stesso costo di quelli in studio, e per questa difficoltà sono spesso il punto di partenza." },
];

const faqEn = [
  { q: "Is agoraphobia a fear of open spaces?", a: "No. It's the fear of being somewhere it would be hard to leave, or be helped, if you felt unwell. That's why it includes enclosed and crowded spaces too." },
  { q: "Can you have agoraphobia without panic attacks?", a: "Yes, although in most cases agoraphobia develops afterwards. The criterion is fear of the situation, not the presence of attacks." },
  { q: "Do I have to leave the house to start therapy?", a: "No. Online sessions run the same length and cost the same as those in person, and for this difficulty they're often the starting point." },
];

const bodyIt = [
  h2("Cos'è l'agorafobia, davvero"),
  p("Il nome inganna. \"Agorafobia\" viene dal greco agorá, la piazza, e per questo viene spesso tradotta come paura degli spazi aperti. Non è quello."),
  p("L'agorafobia è la paura di trovarsi in una situazione da cui sarebbe difficile allontanarsi, o dove sarebbe difficile essere soccorsi, se si stesse male."),
  p("Questo spiega perché l'elenco delle situazioni temute sembra incoerente a chi lo guarda da fuori: la metropolitana e l'autostrada, il cinema e la fila alla cassa, l'aereo e il ponte, un centro commerciale affollato e una strada di campagna deserta. Non hanno in comune lo spazio. Hanno in comune la difficoltà di uscirne in fretta."),
  h2("Agorafobia e attacchi di panico: come sono collegati"),
  p("Nella maggior parte dei casi l'agorafobia non arriva per prima. Arriva dopo."),
  p("Dopo uno o più attacchi di panico, comincia una domanda diversa: non \"sto male?\", ma \"e se stessi male qui?\". La valutazione si sposta dall'evento al luogo, e il luogo comincia a essere scelto in base a quanto sarebbe gestibile un attacco lì dentro."),
  p("Da quel momento il criterio non è più il pericolo. È l'uscita."),
  h2("Evitamento: perché l'elenco si allunga"),
  p("Si comincia dai posti dove è già successo. Poi quelli che assomigliano. Poi le situazioni con la stessa struttura — poco controllo sull'uscita, molta gente, distanza da casa."),
  p("Ogni evitamento funziona nell'immediato: l'ansia scende, e il sollievo insegna che evitare era la scelta giusta. È per questo che l'elenco non resta fermo. Cresce per somiglianza, un elemento alla volta, senza che ci sia mai stata una decisione di ridurre la propria vita."),
  p("Accanto all'evitamento compaiono i comportamenti protettivi: uscire solo accompagnati, sedersi vicino all'uscita, avere l'ansiolitico in tasca, controllare dov'è il pronto soccorso più vicino, fare sempre lo stesso percorso."),
  p("Anche questi danno sollievo, e anche questi mantengono la paura: confermano ogni volta che senza quella precauzione sarebbe successo qualcosa."),
  h2("Quando l'agorafobia restringe la vita"),
  p("C'è un punto in cui la difficoltà smette di riguardare i luoghi e comincia a riguardare tutto il resto."),
  p("Lavori rifiutati perché richiedono spostamenti. Inviti declinati con scuse plausibili. Viaggi rimandati. Una geografia personale che si accorcia fino a comprendere casa, poche strade e pochi posti sicuri."),
  p("Chi ci arriva raramente lo riconosce mentre accade, perché ogni singola rinuncia sembrava ragionevole al momento di farla."),
  h2("Come si lavora sull'agorafobia a Milano, Monza e Cernusco"),
  p("Ricevo in due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Per chi ha difficoltà a spostarsi, la modalità online è spesso quella che rende possibile iniziare — e questo è vero in particolare per questa difficoltà."),
  p("Il lavoro procede in due direzioni. La prima è il meccanismo: capire cosa attiva l'allarme, quali interpretazioni lo alimentano, e quale ruolo hanno i comportamenti protettivi che sembrano aiutare."),
  p("La seconda è il recupero del campo. Gradualmente, d'accordo, e mai partendo dalla situazione più difficile. Non si tratta di dimostrare qualcosa: si tratta di ricostruire accesso dove si è ristretto."),
  h2("Quando ha senso chiedere aiuto"),
  p("— Sto scegliendo dove andare in base a quanto sarebbe facile uscirne?"),
  p("— L'elenco delle cose che evito è più lungo di sei mesi fa?"),
  p("— Esco portandomi dietro qualcosa che prima non mi serviva?"),
  p("— Ci sono posti dove vado solo se accompagnato?"),
];

const bodyEn = [
  h2("What agoraphobia actually is"),
  p("The name misleads. \"Agoraphobia\" comes from the Greek agorá, the marketplace, which is why it's usually translated as a fear of open spaces. That isn't it."),
  p("Agoraphobia is the fear of being somewhere it would be hard to leave, or hard to be helped, if you felt unwell."),
  p("That explains why the list of feared situations looks incoherent from outside: the metro and the motorway, the cinema and the supermarket queue, a flight and a bridge, a crowded shopping centre and an empty country road. What they share isn't the space. It's the difficulty of getting out quickly."),
  h2("How agoraphobia and panic attacks connect"),
  p("In most cases agoraphobia doesn't come first. It comes after."),
  p("Following one or more panic attacks, a different question starts: not \"am I unwell?\" but \"what if I were unwell here?\". The assessment moves from the event to the place, and places start being chosen by how manageable an attack would be inside them."),
  p("From that point the criterion is no longer danger. It's the exit."),
  h2("Avoidance: why the list keeps growing"),
  p("It starts with the places where it happened. Then places that resemble them. Then situations with the same structure — little control over the exit, many people, distance from home."),
  p("Each avoidance works in the moment: the anxiety drops, and the relief teaches that avoiding was the right call. That's why the list doesn't stay still. It grows by resemblance, one item at a time, without any decision ever being made to make a life smaller."),
  p("Alongside avoidance come the safety behaviours: only going out accompanied, sitting near the exit, carrying medication, checking where the nearest hospital is, always taking the same route."),
  p("These bring relief too, and they maintain the fear too: each one confirms that without the precaution something would have happened."),
  h2("When agoraphobia narrows a life"),
  p("There's a point where the difficulty stops being about places and starts being about everything else."),
  p("Jobs turned down because they involve travel. Invitations declined with plausible excuses. Trips postponed. A personal geography that shortens until it covers home, a few streets and a few safe places."),
  p("People who reach that point rarely recognise it happening, because each individual withdrawal seemed reasonable at the time."),
  h2("Working on agoraphobia in Milan, Monza and Cernusco — in English"),
  p("I'm an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy, working in English and Italian. I see people in two practices in Milan, in Monza and in Cernusco sul Naviglio, and online."),
  p("For anyone who finds travelling difficult, online is often what makes starting possible — and that's especially true of this difficulty. It matters more if you've moved country: the places that feel safe are usually the ones you've known longest, and after a move there aren't many."),
  p("The work runs in two directions. The first is the mechanism: understanding what sets off the alarm, which interpretations feed it, and what role the safety behaviours play."),
  p("The second is recovering the field. Gradually, by agreement, and never starting from the hardest situation. It isn't about proving anything: it's about rebuilding access where it narrowed."),
  h2("When it makes sense to ask for help"),
  p("— Am I choosing where to go based on how easy it would be to leave?"),
  p("— Is the list of things I avoid longer than it was six months ago?"),
  p("— Do I leave the house carrying something I didn't used to need?"),
  p("— Are there places I only go to accompanied?"),
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
    const itId = `faqItem-agorafobia-${n}-it`;
    const enId = `faqItem-agorafobia-${n}-en`;
    await upsertDoc(client, itId, "faqItem", { question: itItem.q, answer: faqAnswer(itItem.a), language: "it" });
    await upsertDoc(client, enId, "faqItem", { question: enItem.q, answer: faqAnswer(enItem.a), language: "en" });
    await upsertTranslationMetadata(client, `faqItem-agorafobia-${n}`, "faqItem", itId, enId);
    faqItIds.push(itId);
    faqEnIds.push(enId);
  }

  await upsertDoc(client, "subtopicPage-agorafobia-it", "subtopicPage", {
    title: "Agorafobia",
    parentPillar: { _type: "reference", _ref: PARENT_IT },
    slug: { _type: "slug", current: "agorafobia" },
    titleEmphasisWord: "Agorafobia",
    heroKicker: "ATTACCHI DI PANICO",
    standfirst: "Non è paura degli spazi aperti. È la paura di stare male dove non si può andare via.",
    epigraph: "Ho paura di sentirmi male lontano da casa.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Vista da un motociclista su una strada di montagna tortuosa, tra rocce e vegetazione, sotto un cielo azzurro." },
    faqItems: faqItIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyIt,
    seo: {
      metaTitle: "Agorafobia — Psicoterapeuta a Milano, Monza e online",
      metaDescription: "Cos'è l'agorafobia, come si lega agli attacchi di panico e come si lavora. Psicoterapia a Milano, Monza, Cernusco sul Naviglio e online.",
      noIndex: true,
    },
    language: "it",
  });

  await upsertDoc(client, "subtopicPage-agorafobia-en", "subtopicPage", {
    title: "Agoraphobia",
    parentPillar: { _type: "reference", _ref: PARENT_EN },
    slug: { _type: "slug", current: "agoraphobia" },
    titleEmphasisWord: "Agoraphobia",
    heroKicker: "PANIC ATTACKS",
    standfirst: "It isn't a fear of open spaces. It's the fear of feeling unwell somewhere you can't leave.",
    epigraph: "I'm afraid of feeling unwell far from home.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "View from a motorcyclist along a winding mountain road, past rock outcrops and scrubland, under a blue sky." },
    faqItems: faqEnIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyEn,
    seo: {
      metaTitle: "Agoraphobia — Therapist in English, Milan and Online",
      metaDescription: "What agoraphobia is, how it connects to panic attacks, and how the work is done. Italian psychotherapist working in English in Milan and online.",
      noIndex: true,
    },
    language: "en",
  });

  await upsertTranslationMetadata(client, "subtopicPage-agorafobia", "subtopicPage", "subtopicPage-agorafobia-it", "subtopicPage-agorafobia-en");

  console.log("\n=== agorafobia subtopic: done ===");
}

main();
