import { createClient } from "@sanity/client";
import { upsertDoc, upsertTranslationMetadata } from "./lib/pillarWriter";

// Homepage FAQ block — adds four new questions (faqItem-home-5..8, it/en)
// after the existing four. Copy supplied verbatim by the owner. Same
// createIfNotExists + patch.set + translation.metadata convention as
// add-trauma-emdr-faq.ts; append (not set) on homePage-{it,en}.faq.items
// so the existing four references and their own _key values are
// untouched. Deliberately does NOT touch faqPage's own items — those
// belong to /faq, per direct instruction.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

function faqAnswer(id: string, text: string) {
  return [
    {
      _key: `${id}-answer`,
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _key: `${id}-answer-span`, _type: "span", marks: [], text }],
    },
  ];
}

const items = [
  {
    id: "faqItem-home-5",
    it: {
      question: "Quanto costa una seduta?",
      answer:
        "Una seduta individuale dura 45 minuti e costa 100 €. Una seduta di coppia dura 60 minuti e costa 130 €. Il costo è lo stesso in studio e online.",
    },
    en: {
      question: "How much does a session cost?",
      answer:
        "An individual session lasts 45 minutes and costs €100. A couple session lasts 60 minutes and costs €130. The fee is the same in the studio and online.",
    },
  },
  {
    id: "faqItem-home-6",
    it: {
      question: "In quanto tempo rispondi?",
      answer:
        "Di solito entro 24 ore. Il canale più veloce è WhatsApp; se preferisci scrivere con più calma, va bene anche l'email.",
    },
    en: {
      question: "How quickly do you reply?",
      answer:
        "Usually within 24 hours. The quickest channel is WhatsApp; if you would rather write at more length, email works too.",
    },
  },
  {
    id: "faqItem-home-7",
    it: {
      question: "Devo prendere farmaci?",
      answer:
        "Non sono un medico e non prescrivo farmaci. Se una terapia è già in corso, lavoro in raccordo con chi l'ha prescritta; se emerge che varrebbe la pena valutarla, te lo dico e ti indirizzo.",
    },
    en: {
      question: "Do I have to take medication?",
      answer:
        "I am not a physician and I do not prescribe. Where medication is already in place I work alongside whoever prescribed it; where it is worth assessing, I say so and point you there.",
    },
  },
  {
    id: "faqItem-home-8",
    it: {
      question: "Dove ricevi?",
      answer:
        "In due studi a Milano — Citylife e Bicocca — a Monza e a Cernusco sul Naviglio, oppure online. La tariffa è la stessa ovunque.",
    },
    en: {
      question: "Where do you practise?",
      answer:
        "In two studios in Milan — Citylife and Bicocca — in Monza and in Cernusco sul Naviglio, or online. The fee is the same everywhere.",
    },
  },
];

async function main() {
  const itRefs: { _key: string; _type: "reference"; _ref: string }[] = [];
  const enRefs: { _key: string; _type: "reference"; _ref: string }[] = [];

  for (const item of items) {
    const n = item.id.split("-").pop();
    const itId = item.id;
    const enId = `${item.id}-en`;

    await upsertDoc(client, itId, "faqItem", {
      question: item.it.question,
      answer: faqAnswer(itId, item.it.answer),
      language: "it",
    });
    await upsertDoc(client, enId, "faqItem", {
      question: item.en.question,
      answer: faqAnswer(enId, item.en.answer),
      language: "en",
    });
    await upsertTranslationMetadata(client, item.id, "faqItem", itId, enId);

    itRefs.push({ _key: `faq-ref-${n}`, _type: "reference", _ref: itId });
    enRefs.push({ _key: `faq-ref-${n}`, _type: "reference", _ref: enId });
  }

  await client.patch("homePage-it").setIfMissing({ "faq.items": [] }).append("faq.items", itRefs).commit();
  console.log("\nhomePage-it: faq.items appended:", JSON.stringify(itRefs));

  await client.patch("homePage-en").setIfMissing({ "faq.items": [] }).append("faq.items", enRefs).commit();
  console.log("homePage-en: faq.items appended:", JSON.stringify(enRefs));

  console.log("\n=== homepage FAQ 5-8: done ===");
}

main();
