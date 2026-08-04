import { createClient } from "@sanity/client";

// Six-item pass, item 4 — final editorial block copy, both locales, seeded
// as portable text with real h2 headings (blogIndexSection.ts's own schema
// was extended this pass to allow the "h2" block style — see that file's
// own comment). patch.set on exactly `editorial` — never touches
// kicker/heading/headingEmphasisWord/intro, seeded in an earlier pass.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

let keyCounter = 0;
function nextKey(prefix: string): string {
  keyCounter += 1;
  return `${prefix}-${keyCounter}`;
}

function h2(text: string) {
  return {
    _type: "block",
    _key: nextKey("block"),
    style: "h2",
    markDefs: [],
    children: [{ _type: "span", _key: nextKey("span"), text, marks: [] }],
  };
}

function p(text: string) {
  return {
    _type: "block",
    _key: nextKey("block"),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: nextKey("span"), text, marks: [] }],
  };
}

const IT_EDITORIAL = [
  h2("Perché scrivo questi articoli"),
  p(
    "Ogni settimana, in studio, ascolto le stesse domande formulate in modi diversi. Perché il cuore accelera senza un motivo apparente. Perché una relazione che sembrava solida è diventata faticosa. Perché certe sere l'ansia arriva puntuale e la mattina dopo sembra non essere mai esistita.",
  ),
  p(
    "Questi articoli nascono da quelle domande. Li scrivo tra una seduta e l'altra, quando mi accorgo che una cosa detta in studio potrebbe essere utile anche a chi non è ancora entrato da quella porta.",
  ),
  h2("Di cosa parlo"),
  p(
    "Mi occupo di ansia e attacchi di panico, di agorafobia e claustrofobia, di stress e burnout, di difficoltà nelle relazioni, di disfunzioni sessuali e di trauma. Gli articoli seguono le stesse aree: come si formano certi meccanismi, che cosa succede nel corpo, perché alcune situazioni si ripetono, come si svolge un percorso di psicoterapia.",
  ),
  p(
    "Non troverai esercizi da applicare né tecniche da provare a casa. Troverai descrizioni: di come funzionano certe cose, e di che cosa se ne può fare.",
  ),
  h2("Come leggere questi articoli"),
  p(
    "Sono testi brevi, pensati per essere letti in pochi minuti. Ognuno affronta una domanda sola. Se ti riconosci in quello che leggi, non significa che tu abbia un disturbo: significa che quella descrizione ti ha toccato qualcosa. È un punto di partenza, non una diagnosi.",
  ),
  p("Un articolo non può conoscere la tua storia, il tuo contesto, quello che hai già provato a fare. Per quello serve una conversazione."),
  h2("Se vuoi parlarne"),
  p(
    "Sono uno psicologo psicoterapeuta iscritto all'Albo degli Psicologi della Lombardia. Ricevo in due studi a Milano, a Monza e a Cernusco sul Naviglio, oppure online. Lavoro in italiano e in inglese.",
  ),
  p("Se dopo aver letto qualcosa ti viene voglia di scrivermi, il primo passo è solo un messaggio. Da lì capiamo insieme cosa può essere utile."),
];

const EN_EDITORIAL = [
  h2("Why I write these articles"),
  p(
    "Every week, in practice, I hear the same questions asked in different ways. Why the heart races for no apparent reason. Why a relationship that felt solid has become hard work. Why anxiety arrives punctually on certain evenings and seems never to have existed the next morning.",
  ),
  p(
    "These articles come from those questions. I write them between sessions, when something said in the room seems worth saying to someone who hasn't yet walked through the door.",
  ),
  h2("What I write about"),
  p(
    "I work with anxiety and panic attacks, agoraphobia and claustrophobia, stress and burnout, difficulties in relationships, sexual dysfunction, and trauma. The articles follow the same areas: how certain mechanisms form, what happens in the body, why some situations repeat, and how a course of psychotherapy works.",
  ),
  p("You won't find exercises to apply or techniques to try at home. You'll find descriptions: of how certain things work, and what can be done with that."),
  h2("How to read these articles"),
  p(
    "They are short pieces, meant to be read in a few minutes. Each one takes a single question. If you recognise yourself in what you read, it doesn't mean you have a disorder: it means the description touched something. It's a place to start, not a diagnosis.",
  ),
  p("An article can't know your history, your context, or what you have already tried. That takes a conversation."),
  h2("If you'd like to talk"),
  p(
    "I am an Italian psychologist and psychotherapist, registered with the Order of Psychologists of Lombardy. I practise in Italy — two rooms in Milan, one in Monza and one in Cernusco sul Naviglio — and I also work online. I see people in Italian and in English, and I have worked with people who moved to Milan from all over the world.",
  ),
  p("If something here makes you want to write, the first step is only a message. From there we work out together what might be useful."),
];

async function patchEditorial(id: string, editorial: unknown[]) {
  const before = await client.fetch(`*[_id == $id][0]{editorial}`, { id });
  console.log(`BEFORE ${id}:`, JSON.stringify(before));

  await client.patch(id).set({ editorial }).commit();

  const after = await client.fetch(`*[_id == $id][0]{editorial}`, { id });
  console.log(`AFTER  ${id} block count:`, (after?.editorial ?? []).length);
}

async function main() {
  await patchEditorial("blogIndexSection-it", IT_EDITORIAL);
  await patchEditorial("blogIndexSection-en", EN_EDITORIAL);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
