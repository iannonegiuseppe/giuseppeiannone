import { createClient } from "@sanity/client";
import { h2, p } from "./lib/portableText";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Subtopic rollout — anxiety-related insomnia, parented under the
// anxiety pillar. Source: contents/sub-insonnia-bozza.md (IT+EN
// combined). Copy transcribed verbatim, no edits, review note not
// imported. Epigraph is Giuseppe's own words. noIndex: true throughout.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const HERO_ASSET = "image-3d0166a4b8f97fca01a06a96dce8261e96ebf495-2000x1333-jpg";
const PARENT_IT = "pillarPage-anxiety-it";
const PARENT_EN = "pillarPage-anxiety-en";

const faqIt = [
  { q: "Ho già provato tutto sull'igiene del sonno. Perché non ha funzionato?", a: "Perché l'igiene del sonno affronta le condizioni, non il meccanismo. Se quello che tiene svegli è l'attivazione ansiosa, migliorare le abitudini non la tocca." },
  { q: "Devo fare prima una valutazione medica?", a: "Se l'insonnia è persistente, sì. I disturbi del sonno possono avere cause organiche che vanno escluse — le apnee notturne in particolare sono frequenti e spesso non diagnosticate." },
  { q: "Prescrivi farmaci per dormire?", a: "No, non sono un medico. Se è già in corso una terapia farmacologica, o se emerge che potrebbe essere utile valutarla, lavoro in raccordo con il medico curante." },
];

const faqEn = [
  { q: "I've tried everything on sleep hygiene. Why hasn't it worked?", a: "Because sleep hygiene addresses the conditions, not the mechanism. If what keeps you awake is anxious activation, improving habits doesn't touch it." },
  { q: "Do I need a medical assessment first?", a: "If the insomnia is persistent, yes. Sleep disorders can have physical causes that need ruling out — sleep apnoea in particular is common and frequently undiagnosed." },
  { q: "Do you prescribe sleeping medication?", a: "No, I'm not a medical doctor. If medication is already in place, or if it emerges that it might be worth considering, I work alongside your GP." },
];

const bodyIt = [
  h2("Insonnia da ansia: perché i pensieri arrivano di sera"),
  p("Non è un caso che comincino quando si spegne la luce."),
  p("Durante la giornata l'attenzione è occupata: c'è da fare, c'è da rispondere, c'è rumore. La sera tutto questo si ferma, e per la prima volta in sedici ore non c'è niente che occupi la mente."),
  p("Quello che era stato rimandato arriva allora. Non perché la sera renda le cose più gravi, ma perché è il primo momento in cui c'è spazio per pensarle."),
  p("A questo si aggiunge un fatto fisiologico: nell'ansia il livello di attivazione resta alto anche quando il corpo è stanco. Stanchezza e attivazione non si escludono — si possono avere entrambe, ed è esattamente quella la sensazione di essere esausti e incapaci di addormentarsi."),
  h2("Il circolo: quando dormire diventa una prestazione"),
  p("L'insonnia da ansia si mantiene con lo stesso meccanismo dell'ansia in generale: il tentativo di controllare peggiora la cosa."),
  p("Il sonno non è un'azione volontaria. Non si può decidere di addormentarsi, come non si può decidere di digerire. Arriva quando l'attenzione lascia il campo."),
  p("Nel momento in cui addormentarsi diventa un obiettivo — devo dormire, domani ho una giornata pesante, sono già le due — l'attenzione si sposta sul risultato. E l'attenzione sul risultato è esattamente ciò che impedisce il risultato."),
  p("Da lì nasce il circolo: una notte va male, la notte dopo si va a letto preoccupati di come andrà, e la preoccupazione produce l'attivazione che tiene svegli."),
  h2("Risvegli notturni e pensieri delle quattro del mattino"),
  p("Una forma frequente non riguarda l'addormentamento ma il risveglio: ci si sveglia alle tre o alle quattro con i pensieri già in corsa, come se non ci fosse stata una pausa."),
  p("C'è una ragione per cui a quell'ora tutto sembra peggio. Nella seconda metà della notte il corpo si prepara al risveglio: il cortisolo sale, la temperatura comincia a risalire, il sonno è più leggero. Un pensiero che di giorno avrebbe un peso normale, a quell'ora arriva in un organismo già attivato e senza nessuna delle informazioni di contesto che di giorno lo ridimensionerebbero."),
  p("Le decisioni prese alle quattro del mattino sono quasi sempre sbagliate, e quasi sempre sembrano lucidissime."),
  h2("Perché l'igiene del sonno da sola non basta"),
  p("I consigli standard — orari regolari, niente schermi, camera fresca, niente caffeina la sera — sono corretti e utili. Ma affrontano le condizioni, non il meccanismo."),
  p("Se quello che tiene svegli è l'attivazione ansiosa e il rimuginio, migliorare le condizioni non lo tocca. È il motivo per cui molte persone arrivano dicendo di aver provato tutto: hanno provato tutto sul piano delle abitudini, e il problema era su un altro piano."),
  p("C'è anche un effetto paradosso: applicare regole del sonno con precisione può trasformarsi in un'ulteriore forma di controllo, e quindi in un'ulteriore fonte di ansia serale."),
  h2("Sonno, ansia e stress: cosa si tiene insieme"),
  p("Il rapporto è a due direzioni, ed è quello che rende difficile uscirne."),
  p("L'ansia rende il sonno più leggero e frammentato. Il sonno insufficiente abbassa la soglia a cui l'allarme si attiva il giorno dopo. Il giorno dopo si è più reattivi, più stanchi, meno capaci di gestire quello che capita — e la sera si arriva più attivati di prima."),
  p("Per questo il sonno è spesso il primo posto in cui l'ansia si vede, e uno degli ultimi a rientrare."),
  h2("Psicoterapia per l'insonnia da ansia a Milano, Monza e Cernusco"),
  p("Ricevo in due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Lavoro in italiano e in inglese."),
  p("Prima di tutto: se l'insonnia è persistente, la valutazione medica viene prima. Disturbi del sonno possono avere cause organiche — tra cui le apnee notturne, che sono frequenti e sottodiagnosticate — e vanno escluse."),
  p("Quando invece il quadro è quello dell'attivazione ansiosa, il lavoro riguarda tre cose: ridurre il livello di attivazione generale, non solo serale; interrompere il rimuginio prima che si strutturi; e togliere al sonno lo status di prestazione da riuscire."),
  h2("Quando ha senso chiedere aiuto"),
  p("— Sono stanco tutto il giorno e sveglio la sera?"),
  p("— Vado a letto preoccupato di come andrà la notte?"),
  p("— Mi sveglio alle quattro con i pensieri già in corsa?"),
  p("— Ho provato le regole del sonno senza risultato?"),
];

const bodyEn = [
  h2("Why the thoughts arrive at night"),
  p("It isn't a coincidence that they begin when the light goes off."),
  p("During the day attention is occupied: there are things to do, messages to answer, noise. In the evening all of that stops, and for the first time in sixteen hours there's nothing filling the mind."),
  p("What was postponed arrives then. Not because the evening makes things worse, but because it's the first moment there's room to think them."),
  p("There's a physiological fact on top of that: in anxiety the level of activation stays high even when the body is tired. Tiredness and activation don't cancel each other out — you can have both, and that's exactly the sensation of being exhausted and unable to fall asleep."),
  h2("The cycle: when sleeping becomes a performance"),
  p("Anxiety-related insomnia maintains itself the way anxiety does generally: trying to control it makes it worse."),
  p("Sleep isn't a voluntary action. You can't decide to fall asleep, any more than you can decide to digest. It arrives when attention leaves the field."),
  p("The moment falling asleep becomes an objective — I have to sleep, tomorrow is heavy, it's already two — attention moves onto the outcome. And attention on the outcome is precisely what prevents the outcome."),
  p("From there the cycle: one night goes badly, the next night you go to bed worried about how it will go, and the worry produces the activation that keeps you awake."),
  h2("Waking at four in the morning"),
  p("One common form isn't about falling asleep but about waking: you come round at three or four with the thoughts already running, as though there had been no pause."),
  p("There's a reason everything looks worse at that hour. In the second half of the night the body prepares to wake: cortisol rises, temperature starts climbing, sleep is lighter. A thought that would carry normal weight by day arrives in an already-activated body, without any of the daytime context that would cut it down to size."),
  p("Decisions made at four in the morning are almost always wrong, and almost always feel exceptionally clear."),
  h2("Why sleep hygiene alone isn't enough"),
  p("The standard advice — regular hours, no screens, a cool room, no caffeine late — is correct and useful. But it addresses the conditions, not the mechanism."),
  p("If what keeps you awake is anxious activation and rumination, improving the conditions doesn't touch it. That's why many people arrive saying they've tried everything: they've tried everything at the level of habits, and the problem was at another level."),
  p("There's a paradoxical effect too: applying sleep rules with precision can itself become another form of control, and therefore another source of evening anxiety."),
  h2("Sleep, anxiety and stress"),
  p("The relationship runs both ways, which is what makes it hard to leave."),
  p("Anxiety makes sleep lighter and more broken. Insufficient sleep lowers the threshold at which the alarm fires the next day. The next day you're more reactive, more tired, less able to handle what comes — and you arrive at the evening more activated than before."),
  p("That's why sleep is often the first place anxiety shows, and one of the last to settle."),
  h2("Insomnia and anxiety therapy in English in Milan and Monza"),
  p("I'm an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy, working in English and Italian, in two practices in Milan, in Monza, in Cernusco sul Naviglio, and online."),
  p("First of all: if the insomnia is persistent, medical assessment comes first. Sleep problems can have physical causes — sleep apnoea among them, which is common and often undiagnosed — and those need ruling out."),
  p("Where the picture is anxious activation, the work concerns three things: reducing the general level of activation, not only the evening's; interrupting rumination before it settles into shape; and taking away sleep's status as a performance to succeed at."),
  h2("When it makes sense to ask for help"),
  p("— Am I tired all day and awake at night?"),
  p("— Do I go to bed worried about how the night will go?"),
  p("— Do I wake at four with the thoughts already running?"),
  p("— Have I tried the sleep rules without result?"),
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
    const itId = `faqItem-insonnia-${n}-it`;
    const enId = `faqItem-insonnia-${n}-en`;
    await upsertDoc(client, itId, "faqItem", { question: itItem.q, answer: faqAnswer(itItem.a), language: "it" });
    await upsertDoc(client, enId, "faqItem", { question: enItem.q, answer: faqAnswer(enItem.a), language: "en" });
    await upsertTranslationMetadata(client, `faqItem-insonnia-${n}`, "faqItem", itId, enId);
    faqItIds.push(itId);
    faqEnIds.push(enId);
  }

  await upsertDoc(client, "subtopicPage-insonnia-it", "subtopicPage", {
    title: "Insonnia da ansia",
    parentPillar: { _type: "reference", _ref: PARENT_IT },
    slug: { _type: "slug", current: "insonnia-da-ansia" },
    titleEmphasisWord: "ansia",
    heroKicker: "DISTURBI D'ANSIA",
    standfirst: "Il corpo è esausto. La testa no, e comincia proprio quando si spegne la luce.",
    epigraph: "Anche se sono stanco, la mia testa non va mai a dormire. E appena spengo la luce iniziano i pensieri negativi.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Donna sdraiata sul divano di notte, sveglia e con lo sguardo assente, con una bottiglia di birra e scatole di medicinali sul tavolino in primo piano." },
    faqItems: faqItIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyIt,
    seo: {
      metaTitle: "Insonnia da ansia — Psicoterapeuta a Milano e Monza",
      metaDescription: "Pensieri che partono a luci spente, risvegli alle quattro, sonno che non ristora. Psicoterapia a Milano, Monza, Cernusco sul Naviglio e online.",
      noIndex: true,
    },
    language: "it",
  });

  await upsertDoc(client, "subtopicPage-insonnia-en", "subtopicPage", {
    title: "Anxiety and insomnia",
    parentPillar: { _type: "reference", _ref: PARENT_EN },
    slug: { _type: "slug", current: "anxiety-insomnia" },
    titleEmphasisWord: "insomnia",
    heroKicker: "ANXIETY DISORDERS",
    standfirst: "The body is exhausted. The head isn't, and it starts the moment the light goes off.",
    epigraph: "Even when I'm exhausted, my head never goes to sleep. The moment I turn off the light, the thoughts start.",
    heroImage: { _type: "image", asset: { _ref: HERO_ASSET, _type: "reference" }, alt: "Woman lying awake on a sofa at night with a blank stare, a beer bottle and medicine boxes on the table in the foreground." },
    faqItems: faqEnIds.map((id, i) => ({ _key: `faq-ref-${i}`, _type: "reference", _ref: id })),
    body: bodyEn,
    seo: {
      metaTitle: "Anxiety and Insomnia — Therapist in English, Milan",
      metaDescription: "Thoughts that start at lights-out, waking at four, sleep that doesn't restore. Italian psychotherapist working in English in Milan and online.",
      noIndex: true,
    },
    language: "en",
  });

  await upsertTranslationMetadata(client, "subtopicPage-insonnia", "subtopicPage", "subtopicPage-insonnia-it", "subtopicPage-insonnia-en");

  console.log("\n=== insonnia subtopic: done ===");
}

main();
