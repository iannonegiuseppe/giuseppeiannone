import { createClient } from "@sanity/client";
import { h2, p } from "./lib/portableText";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Pillar rollout — relationship difficulties. Source: contents/pillar-relazioni-bozza-v2.md
// (IT+EN combined file). Copy transcribed verbatim, no edits. Recognition quote #3
// ("Quando non risponde ai messaggi...") is an exact match to pillarPage-anxiety's own
// "Ansia da separazione" / "Separation anxiety" precedent, reused directly. Labels 1–2
// are lifted from this page's own H2 headings (high confidence). Labels 4–6 have no
// clean lift available and are paraphrased from their quotes/nearby headings — flagged
// as lower-confidence in the population report, not left blank (label is a required
// field and every quote here is Giuseppe's own, so isDraft stays false throughout — only
// the stress/trauma pages get isDraft: true, per the author's own flagging of those two).
// No bracketed placeholders existed in this draft. noIndex: true throughout.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_ASSET = "image-ac4694e03660cdbddfe53c5f12e9bb72d4e3bb82-3548x2580-jpg";

const faqIt = [
  { q: "Il mio partner non vuole venire. Ha senso venire da solo?", a: "Sì. Una parte consistente del lavoro sulle relazioni si fa individualmente, e riguarda il proprio modo di stare in relazione — che è l'unica parte su cui si ha davvero margine." },
  { q: "Qual è la differenza con la terapia di coppia?", a: "Qui il lavoro è individuale, anche quando l'argomento è una relazione. La terapia di coppia coinvolge entrambi i partner in seduta ed è un percorso a sé." },
  { q: "Dove ricevi?", a: "In due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Gli incontri online hanno la stessa durata e lo stesso costo di quelli in studio." },
  { q: "Come funziona il primo colloquio?", a: "È un incontro di 45 minuti in cui mi racconti cosa succede. Serve a capire la richiesta e a valutare insieme se e come proseguire. Non comporta impegno a continuare." },
];

const faqEn = [
  { q: "My partner won't come. Is it worth coming alone?", a: "Yes. A substantial part of relationship work is done individually, and concerns your own way of being in a relationship — the only part you genuinely have room to change." },
  { q: "How is this different from couples therapy?", a: "Here the work is individual, even when the subject is a relationship. Couples therapy involves both partners in the room and is a separate course of work." },
  { q: "Where do you practise?", a: "Two practices in Milan, one in Monza and one in Cernusco sul Naviglio, plus online. Online sessions run the same length and cost the same as those in person." },
  { q: "How does the first session work?", a: "It's a 45-minute meeting where you tell me what's going on. It's there to understand what you're asking for and to work out together whether and how to continue." },
];

// Confidence notes (reported to the user, not encoded here): 1–2 lifted from this
// page's own H2 titles; 3 is an exact precedent reuse from the anxiety pillar; 4–6
// are paraphrased — no clean lift existed for them.
const recognitionIt = [
  { quote: "Ho così paura di restare solo che accetto relazioni che mi fanno soffrire.", label: "Dipendenza affettiva" },
  { quote: "Mi sento più in ansia quando siamo insieme che quando siamo lontani.", label: "Ansia nelle relazioni" },
  { quote: "Quando non risponde ai messaggi sento subito un vuoto e penso che voglia abbandonarmi.", label: "Ansia da separazione" },
  { quote: "Non riesco ad accettare che sia finita.", label: "Difficoltà ad accettare la fine di una relazione" },
  { quote: "Ogni discussione finisce per parlare dell'ultima lite. Mai di quello che ci ha fatto soffrire davvero.", label: "Schemi relazionali che si ripetono" },
  { quote: "Viviamo nella stessa casa. Ma è da tempo che non ci sentiamo nello stesso posto.", label: "Distanza nella relazione" },
];

const recognitionEn = [
  { quote: "I'm so afraid of being alone that I accept relationships that hurt me.", label: "Emotional dependence" },
  { quote: "I feel more anxious when we're together than when we're apart.", label: "Relationship anxiety" },
  { quote: "When they don't reply, I feel an immediate emptiness and think they want to leave me.", label: "Separation anxiety" },
  { quote: "I can't accept that it's over.", label: "Difficulty accepting the end of a relationship" },
  { quote: "Every argument ends up being about the last argument. Never about what actually hurt.", label: "Repeating relationship patterns" },
  { quote: "We live in the same house. But it's been a long time since we felt like we were in the same place.", label: "Distance within the relationship" },
];

const bodyIt = [
  h2("Difficoltà relazionali: quando il problema non è il partner"),
  p("Non tutte le difficoltà di relazione sono un problema di coppia. Molte persone arrivano da sole, e non perché il partner non voglia venire: perché quello che vogliono capire riguarda loro."),
  p("Perché scelgono sempre lo stesso tipo di persona. Perché il silenzio dell'altro produce un allarme sproporzionato. Perché è così difficile dire di no, o andarsene, o restare senza controllare."),
  p("Le relazioni sono anche il posto dove l'ansia si vede meglio. Chi teme il giudizio lo teme di più con chi ama. Chi ha bisogno di certezze le chiede a chi gli sta vicino."),
  h2("Dipendenza affettiva e paura dell'abbandono"),
  p("C'è una forma di sofferenza relazionale che ha un tratto riconoscibile: la paura di restare soli è più forte del dolore che la relazione produce."),
  p("Si accettano condizioni che non si accetterebbero altrove. Si rimanda una decisione per anni. Si scambia l'intensità per intimità, e l'ansia dell'attesa per amore."),
  p("Chi la vive spesso lo sa già, e non basta saperlo. Riconoscere un meccanismo non lo disattiva: serve capire cosa lo tiene acceso."),
  h2("Relazioni che si ripetono: lo stesso schema con persone diverse"),
  p("Quello che più spesso porta qualcuno a chiedere aiuto non è una singola crisi. È l'impressione che sia già successo."),
  p("Stessa dinamica, persone diverse. Oppure stessa persona, stessa discussione, per anni. Cambiano le parole, la sensazione alla fine è sempre la stessa."),
  p("Quando qualcosa si ripete con questa precisione, di solito non è questione di scelte sbagliate. È un funzionamento appreso: un modo di leggere i segnali dell'altro, di reagire alla distanza, di cercare rassicurazione o di ritirarsi. Si è formato dove c'erano ragioni per formarsi."),
  h2("Il ciclo inseguimento-allontanamento nella coppia"),
  p("Uno dei meccanismi più frequenti funziona così."),
  p("Uno dei due percepisce distanza e si avvicina: chiama, chiede, vuole chiarire subito. L'altro si sente sotto pressione e prende spazio. La distanza aumenta. Il primo si avvicina ancora."),
  p("Nessuno dei due sta sbagliando di proposito. Ognuno fa la cosa che, dalla sua posizione, sembra ragionevole. Ma insieme le due ragionevolezze producono esattamente ciò che entrambi temono."),
  p("Chi insegue non sta inseguendo l'altro. Sta inseguendo una sensazione di sicurezza che con quella persona aveva trovato."),
  h2("Ansia nelle relazioni: quando il problema è un altro"),
  p("A volte quello che sembra un problema di coppia è ansia che si esprime nella relazione."),
  p("Il bisogno continuo di rassicurazione. Il controllo dei messaggi. Un tono di voce letto come segnale di allontanamento. Il vuoto immediato quando l'altro non risponde."),
  p("Distinguere le due cose cambia il lavoro. Se la relazione è il luogo dove l'ansia si manifesta, lavorare solo sulla relazione lascia intatto il meccanismo, che si ripresenterà con la prossima persona."),
  h2("Psicoterapia per le difficoltà relazionali a Milano, Monza e Cernusco"),
  p("Ricevo in due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Lavoro in italiano e in inglese."),
  p("Il primo incontro serve a capire cosa si sta chiedendo: se la domanda riguarda una relazione specifica, un modo di stare nelle relazioni in generale, o una decisione che non si riesce a prendere."),
  p("Poi si lavora su tre cose: riconoscere il meccanismo mentre si attiva, capire cosa lo alimenta, e trovare margine per rispondere diversamente da come si è sempre risposto."),
  p("Non do consigli su cosa fare della relazione. Non è il mio ruolo dire a qualcuno se restare o andarsene: è una decisione che riguarda una vita che non è la mia. Quello su cui si può lavorare è la chiarezza con cui quella decisione viene presa."),
  p("Se il lavoro riguarda entrambi i partner, la terapia di coppia è un percorso diverso."),
  h2("Quando rivolgersi a uno psicoterapeuta"),
  p("— La stessa discussione ricomincia da capo, e conosco già come finisce?"),
  p("— Mi sento più in ansia con questa persona che senza?"),
  p("— Sto rimandando una decisione da mesi?"),
  p("— Riconosco questo schema anche in relazioni precedenti?"),
  p("Non serve una crisi per parlarne."),
];

const bodyEn = [
  h2("Relationship difficulties: when the problem isn't your partner"),
  p("Not every relationship difficulty is a couple's problem. Many people come alone, and not because their partner refuses: because what they want to understand is about them."),
  p("Why they always choose the same kind of person. Why the other person's silence sets off an alarm out of all proportion. Why it's so hard to say no, or to leave, or to stay without checking."),
  p("Relationships are also where anxiety shows most clearly. Someone who fears judgement fears it most with the person they love. Someone who needs certainty asks for it from whoever is closest."),
  h2("Emotional dependence and fear of abandonment"),
  p("There's a form of relational suffering with a recognisable signature: the fear of being alone outweighs the pain the relationship causes."),
  p("You accept conditions you wouldn't accept anywhere else. You postpone a decision for years. You mistake intensity for intimacy, and the anxiety of waiting for love."),
  p("People living it often already know. Knowing isn't enough — recognising a mechanism doesn't switch it off. What helps is understanding what keeps it running."),
  h2("The same pattern with different people"),
  p("What usually brings someone to ask for help isn't a single crisis. It's the sense that this has happened before."),
  p("Same dynamic, different people. Or the same person, the same argument, for years. The words change; the feeling at the end is always the same."),
  p("When something repeats with that precision, it's usually not a matter of bad choices. It's a learned way of working: how you read the other person's signals, how you respond to distance, whether you seek reassurance or withdraw. It formed where there were reasons for it to form."),
  h2("The pursue-withdraw cycle"),
  p("One of the most common mechanisms works like this."),
  p("One person senses distance and moves closer: calls, asks, wants to resolve it now. The other feels pressed and takes space. The distance grows. The first moves closer again."),
  p("Neither is doing anything wrong on purpose. Each is doing what, from where they stand, seems reasonable. Together, the two reasonable responses produce exactly what both of them fear."),
  p("The one pursuing isn't pursuing the other person. They're pursuing a feeling of safety they had found with them."),
  h2("Relationship anxiety: when the real problem is something else"),
  p("Sometimes what looks like a relationship problem is anxiety expressing itself through the relationship."),
  p("The constant need for reassurance. Checking messages. Reading a change of tone as withdrawal. The immediate emptiness when there's no reply."),
  p("Telling those apart changes the work. If the relationship is where the anxiety appears, working only on the relationship leaves the mechanism intact — and it shows up again with the next person."),
  h2("Therapy in English for relationship difficulties in Milan and Monza"),
  p("I'm an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy. I see people in two practices in Milan, in Monza and in Cernusco sul Naviglio, and online. I work in English and in Italian."),
  p("Relationships carry particular weight when you've moved country. A partner can become the whole support network by default — the only person who knows you, the reason you're here, sometimes the only one who speaks your language at home. That concentration puts pressure on a relationship that has nothing to do with the relationship itself, and it's worth naming."),
  p("The first session is about understanding what's being asked: whether the question is about one relationship, about a way of being in relationships generally, or about a decision that won't get made."),
  p("Then the work goes to three things: recognising the mechanism as it fires, understanding what feeds it, and finding room to respond differently."),
  p("I don't advise people on what to do about the relationship. It isn't my place to tell someone whether to stay or leave: that's a decision about a life that isn't mine. What can be worked on is the clarity with which the decision gets made."),
  h2("When to see a psychotherapist"),
  p("— Does the same argument start over, and do I already know how it ends?"),
  p("— Am I more anxious with this person than without them?"),
  p("— Have I been postponing a decision for months?"),
  p("— Do I recognise this pattern in earlier relationships too?"),
  p("You don't need a crisis to talk about it."),
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
    const itId = `faqItem-relazioni-${n}-it`;
    const enId = `faqItem-relazioni-${n}-en`;
    await upsertDoc(client, itId, "faqItem", { question: itItem.q, answer: faqAnswer(itItem.a), language: "it" });
    await upsertDoc(client, enId, "faqItem", { question: enItem.q, answer: faqAnswer(enItem.a), language: "en" });
    await upsertTranslationMetadata(client, `faqItem-relazioni-${n}`, "faqItem", itId, enId);
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

  await upsertDoc(client, "pillarPage-relazioni-it", "pillarPage", {
    title: "Difficoltà nelle relazioni",
    slug: { _type: "slug", current: "difficolta-relazionali" },
    titleEmphasisWord: "relazioni",
    heroKicker: "AREA DI INTERVENTO",
    standfirst: "Quando la stessa discussione ricomincia da capo, con parole diverse e lo stesso finale.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Due persone di spalle, sedute vicine ma senza toccarsi, che guardano il tramonto sul mare." },
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
      metaTitle: "Difficoltà relazionali — Psicoterapeuta a Milano e Monza",
      metaDescription: "Dipendenza affettiva, paura dell'abbandono, schemi che si ripetono. Psicoterapia individuale a Milano, Monza, Cernusco sul Naviglio e online.",
      noIndex: true,
    },
    language: "it",
  });

  await upsertDoc(client, "pillarPage-relazioni-en", "pillarPage", {
    title: "Difficulties in relationships",
    slug: { _type: "slug", current: "relationship-difficulties" },
    titleEmphasisWord: "relationships",
    heroKicker: "AREA OF WORK",
    standfirst: "When the same argument starts over, in different words, with the same ending.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Two people seen from behind, sitting close together but not touching, watching the sunset over the sea." },
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
      metaTitle: "Relationship Difficulties — Therapist in English, Milan",
      metaDescription: "Emotional dependence, fear of abandonment, patterns that repeat. Italian psychotherapist working in English in Milan, Monza and online.",
      noIndex: true,
    },
    language: "en",
  });

  await upsertTranslationMetadata(client, "pillarPage-relazioni", "pillarPage", "pillarPage-relazioni-it", "pillarPage-relazioni-en");

  console.log("\n=== relazioni pillar: done ===");
}

main();
