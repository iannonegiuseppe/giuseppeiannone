import { createClient } from "@sanity/client";

// Lead-expansion pass — replaces contactPage.intro (was a single-sentence
// plain string) with three portable-text paragraphs, the second carrying
// seven inline pillarLink marks to the real pillarPage documents (a
// reference, not a typed path — see pillarLinkAnnotation.ts's own
// comment for why). Also replaces the placeholder SEO metaTitle/
// metaDescription. Copy is verbatim from the approved brief — patch.set
// on the exact leaf paths, not createOrReplace.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

let keyCounter = 0;
function key(prefix: string): string {
  keyCounter += 1;
  return `${prefix}${keyCounter}`;
}

function plainBlock(text: string) {
  return {
    _type: "block",
    _key: key("blk"),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key("span"), text, marks: [] }],
  };
}

function linkedBlock(segments: { text: string; pillarId?: string }[]) {
  const markDefs: { _type: string; _key: string; target: { _type: string; _ref: string } }[] = [];
  const children = segments.map((seg) => {
    if (seg.pillarId) {
      const markKey = key("mark");
      markDefs.push({
        _type: "pillarLink",
        _key: markKey,
        target: { _type: "reference", _ref: seg.pillarId },
      });
      return { _type: "span", _key: key("span"), text: seg.text, marks: [markKey] };
    }
    return { _type: "span", _key: key("span"), text: seg.text, marks: [] };
  });
  return { _type: "block", _key: key("blk"), style: "normal", markDefs, children };
}

const introIt = [
  plainBlock("Scegli il canale che ti è più comodo. Rispondo personalmente, di solito entro 24 ore."),
  linkedBlock([
    { text: "Mi occupo di " },
    { text: "ansia", pillarId: "pillarPage-anxiety-it" },
    { text: ", " },
    { text: "attacchi di panico e agorafobia", pillarId: "pillarPage-panic-it" },
    { text: ", " },
    { text: "difficoltà sessuali", pillarId: "pillarPage-sessuali-it" },
    { text: ", " },
    { text: "stress e burnout", pillarId: "pillarPage-stress-it" },
    { text: ", " },
    { text: "difficoltà relazionali", pillarId: "pillarPage-relazioni-it" },
    { text: " e " },
    { text: "terapia di coppia", pillarId: "pillarPage-coppia-it" },
    { text: ", e delle conseguenze di " },
    { text: "esperienze traumatiche", pillarId: "pillarPage-trauma-it" },
    {
      text: ". Ricevo in due studi a Milano — Citylife e Bicocca — a Monza e a Cernusco sul Naviglio, oppure in videochiamata.",
    },
  ]),
  plainBlock(
    "Scrivere non impegna a niente: un primo messaggio serve a capire se posso esserti utile, e a fissare un primo incontro se decidi di farlo.",
  ),
];

const introEn = [
  plainBlock("Choose whichever channel suits you. I reply personally, usually within 24 hours."),
  linkedBlock([
    { text: "I work with " },
    { text: "anxiety", pillarId: "pillarPage-anxiety-en" },
    { text: ", " },
    { text: "panic attacks and agoraphobia", pillarId: "pillarPage-panic-en" },
    { text: ", " },
    { text: "sexual difficulties", pillarId: "pillarPage-sessuali-en" },
    { text: ", " },
    { text: "stress and burnout", pillarId: "pillarPage-stress-en" },
    { text: ", " },
    { text: "relationship difficulties", pillarId: "pillarPage-relazioni-en" },
    { text: " and " },
    { text: "couples therapy", pillarId: "pillarPage-coppia-en" },
    { text: ", and the aftermath of " },
    { text: "traumatic experiences", pillarId: "pillarPage-trauma-en" },
    {
      text: ". I practise in two studios in Milan — Citylife and Bicocca — in Monza and in Cernusco sul Naviglio, or by video call, in Italian and in English.",
    },
  ]),
  plainBlock(
    "Writing commits you to nothing: a first message is there to see whether I can be of help, and to arrange a first session if you decide to.",
  ),
];

async function main() {
  await client
    .patch("contactPage-it")
    .set({
      intro: introIt,
      "seo.metaTitle": "Contatti — psicologo e psicoterapeuta a Milano, Monza e Cernusco",
      "seo.metaDescription":
        "Come contattarmi: WhatsApp, telefono o email, con risposta entro 24 ore. Ricevo in due studi a Milano, a Monza, a Cernusco sul Naviglio e in videochiamata, dal lunedì al venerdì.",
    })
    .commit();
  console.log("contactPage-it: intro + seo updated");

  await client
    .patch("contactPage-en")
    .set({
      intro: introEn,
      "seo.metaTitle": "Contact — English-speaking psychotherapist in Milan and Monza",
      "seo.metaDescription":
        "How to reach me: WhatsApp, phone or email, with a reply within 24 hours. I practise in two studios in Milan, in Monza, in Cernusco sul Naviglio and by video call, Monday to Friday.",
    })
    .commit();
  console.log("contactPage-en: intro + seo updated");
}
main();
