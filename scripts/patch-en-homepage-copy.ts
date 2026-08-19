import { createClient } from "@sanity/client";

// English-only homepage copy rewrite, sourced verbatim from
// contents/homepage-en-copy.md. Every field below is set to the exact text
// from that file — no rephrasing here. Fields the file marks "(unchanged)"
// are intentionally omitted from SET_FIELDS rather than rewritten with
// identical values.
//
// homePage-it is never referenced in SET_FIELDS below — only homePage-en and
// the eight EN faqItem documents are patched. The six aree.items cards (both
// locales) are never touched: only aree.intro is in SET_FIELDS.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const SHARED_PARAGRAPH =
  "I'm Giuseppe Iannone, a psychologist and psychotherapist. I work with anxiety, panic attacks and agoraphobia, in English and in Italian. I see people in Milan — Citylife and Bicocca — in Monza, in Cernusco sul Naviglio, and online. Many of them moved here from somewhere else. The first consultation is a chance to understand together what is going on, with no obligation to continue.";

const HOMEPAGE_EN_SET: Record<string, unknown> = {
  "hero.headline": "Psychotherapy in English for anxiety and panic — Milan and Monza",
  "hero.headlineEmphasisWord": "anxiety and panic",
  "hero.positioningStatement": SHARED_PARAGRAPH,

  "recognition.bridgeLine":
    "Anxiety, panic, burnout: you do not need the right word for what you are feeling. Sometimes it is enough to recognise yourself in someone else's, and start from there.",
  "recognition.fragments[0].text":
    "From the outside everything looks fine: the job, the people, the plans. Inside it is not. And putting that into words is the hardest part.",
  "recognition.fragments[0].emphasisWord": "Inside",
  "recognition.fragments[1].text":
    "I wake up tired before the day has started. Every morning the same, as though the night had not put anything back where it belongs.",
  "recognition.fragments[1].emphasisWord": "tired before the day has started",
  "recognition.fragments[2].text":
    "I turn the same thing over and over and put off deciding, until it stops being a decision and becomes an emergency.",
  "recognition.fragments[2].emphasisWord": "an emergency",
  "recognition.fragments[3].text":
    "My heart races for no reason I can point to. I know perfectly well that nothing is wrong. My body does not believe me and keeps bracing for something.",
  "recognition.fragments[3].emphasisWord": "My body does not believe me",
  "recognition.fragments[4].text":
    "I say yes to everything so nobody is let down. Then there is nothing left over for me — no time, no energy.",
  "recognition.fragments[4].emphasisWord": "nothing left over for me",
  "recognition.fragments[5].text":
    "I walk into a room and I have already found the nearest way out. Just in case. Even when nothing ever happens.",
  "recognition.fragments[5].emphasisWord": "the nearest way out",

  "hope.heading": "It has not always been like this. And it does not have to stay like this.",
  "hope.headingEmphasisWord": "does not have to stay",

  "welcome.paragraph": SHARED_PARAGRAPH,

  "credentialsBand.clinicalPracticeDescription": "Since 2013, between private practice and continuing training.",
  "credentialsBand.trainingDescription": "A degree, a research master's, a specialisation — and it has not stopped since.",
  "credentialsBand.languagesDescription": "Sessions in either language, in person or online.",

  "aree.intro":
    "Mostly anxiety and what tends to arrive with it — panic attacks, agoraphobia, stress, difficulties in relationships. Every course of work starts from what you bring, not from a standard protocol.",

  "metodo.paragraph": "Every course of work is different, but the shape of it is clear from the beginning. Here is what to expect.",
  "metodo.steps[0].shortLine": "You write on WhatsApp or by email, whichever suits you. I answer within 24 hours.",
  "metodo.steps[1].title": "First session",
  "metodo.steps[1].shortLine": "Forty-five minutes to understand what is going on. It is already clinical work, not an introduction.",
  "metodo.steps[2].shortLine": "We agree what we are aiming at and how often to meet. In person, online, or alternating between the two.",
  "metodo.steps[3].title": "Toward not needing it",
  "metodo.steps[3].shortLine": "We look at where the work has got to, and at the point where it stops being necessary.",

  "tariffe.detailsItems[3]": "19% deduction as a medical expense in Italy",
  "tariffe.detrazioneFootnote": "It applies to traceable payments, and only if you file an Italian tax return.",

  "ctaBridge.title": "You do not need to know where to start.",
  "ctaBridge.body":
    "The first step is a message, nothing more. From there we work out together what might help, with no obligation to carry on. I answer within 24 hours.",

  "profilo.heading": "I do not do a bit of everything. I work with anxiety and panic",
  "profilo.headingEmphasisWord": "anxiety and panic",
  "profilo.paragraphs[0]":
    "I studied Cognitive and Clinical Neuroscience at Maastricht University and worked as a researcher on the mechanisms of anxiety and panic. Then came the specialisation in Cognitive-Neuropsychological Psychotherapy, and clinical work on psychiatric wards between Milan and Brescia.",
  "profilo.paragraphs[1]":
    "I work in English as readily as in Italian. Most of the people I see came to Milan from somewhere else — for work, for study, for someone — and I have lived abroad myself. It taught me how much it matters to be able to say a difficult thing in the language you actually think in.",
  "profilo.paragraphs[2]":
    "Today I work with anxiety and panic and the difficulties that travel with them. In Milan, in Monza, in Cernusco sul Naviglio, and online.",

  "diplomi.alboLine": "I am licensed to practise in Lombardy, and the register is public.",

  "video.heading": "See how I work before you write to me",
  "video.lead":
    "A short video, so I am not a stranger. Watch how a first meeting goes and see whether it feels workable — who you do this with matters more than anything else.",

  "locations.intro":
    "Two practices in Milan, one in Monza and one in Cernusco sul Naviglio. Online sessions run the same length and cost the same as those in person, and can be held in English or in Italian.",

  "spaces.introLine": "These are the rooms I work in. The photographs are my own.",

  "contactSection.heading": "Write me a few lines and we will find where to start.",

  "seo.metaTitle": "English-speaking psychotherapist in Milan — anxiety and panic attacks",
  "seo.metaDescription":
    "Psychotherapy in English for anxiety, panic attacks and agoraphobia. Sessions in Milan, Monza, Cernusco sul Naviglio and online. First consultation 45 minutes, €100.",
};

type FaqPatch = { id: string; blockKey: string; spanKey: string; question: string; answer: string };

const FAQ_PATCHES: FaqPatch[] = [
  {
    id: "faqItem-home-1-en",
    blockKey: "faqItem-home-1-en-answer",
    spanKey: "faqItem-home-1-en-answer-span",
    question: "How does the first session work?",
    answer:
      "Forty-five minutes in which you tell me what is going on. It is there to understand what you are asking for and to work out together whether and how to continue. It commits you to nothing.",
  },
  {
    id: "faqItem-home-2-en",
    blockKey: "faqItem-home-2-en-answer",
    spanKey: "faqItem-home-2-en-answer-span",
    question: "How long does a session last?",
    answer: "Forty-five minutes for individual sessions, sixty for couples. The same in the studio and online.",
  },
  {
    // REPLACED subject: was "Do you also see clients online?"
    id: "faqItem-home-3-en",
    blockKey: "faqItem-home-3-en-answer",
    spanKey: "faqItem-home-3-en-answer-span",
    question: "Do you work in English?",
    answer:
      "Yes, and a substantial part of my practice is in English. Working in a second language is worth thinking about rather than assuming it is neutral: for some people English is where they are most precise, for others their emotional vocabulary belongs elsewhere. Both are workable, and we can look at it directly.",
  },
  {
    id: "faqItem-home-4-en",
    blockKey: "faqItem-home-4-en-answer",
    spanKey: "faqItem-home-4-en-answer-span",
    question: "Do I need to know what to say?",
    answer: "No, and most people do not. It is ordinary to arrive without knowing where to begin. I ask the questions.",
  },
  {
    id: "faqItem-home-5-en",
    blockKey: "faqItem-home-5-en-answer",
    spanKey: "faqItem-home-5-en-answer-span",
    question: "How much does a session cost?",
    answer:
      "An individual session lasts 45 minutes and costs €100. A couple session lasts 60 minutes and costs €130. The fee is the same in the studio and online, at every location.",
  },
  {
    id: "faqItem-home-6-en",
    blockKey: "faqItem-home-6-en-answer",
    spanKey: "faqItem-home-6-en-answer-span",
    question: "How quickly do you reply?",
    answer: "Usually within 24 hours. WhatsApp is quickest; email works if you would rather write at more length.",
  },
  {
    id: "faqItem-home-7-en",
    blockKey: "faqItem-home-7-en-answer",
    spanKey: "faqItem-home-7-en-answer-span",
    question: "Do I have to take medication?",
    answer:
      "I am not a physician and I do not prescribe. Where a course of medication is already in place I work alongside whoever prescribed it; where it is worth assessing, I say so and point you there.",
  },
  {
    // REPLACED subject: was "Where do you practise?"
    id: "faqItem-home-8-en",
    blockKey: "faqItem-home-8-en-answer",
    spanKey: "faqItem-home-8-en-answer-span",
    question: "Do I need a referral from a doctor?",
    answer:
      "No. In Italy you can contact a psychologist in private practice directly — no referral letter, no going through a GP first. If you come from a system where mental health care starts elsewhere, that is one of the practical differences.",
  },
];

async function main() {
  const beforeItRev = await client.fetch<string>(`*[_id == "homePage-it"][0]._rev`);
  const beforeEnRev = await client.fetch<string>(`*[_id == "homePage-en"][0]._rev`);
  const beforeItAree = await client.fetch(`*[_id == "homePage-it"][0].aree.items[]{title, descriptor}`);
  const beforeEnAree = await client.fetch(`*[_id == "homePage-en"][0].aree.items[]{title, descriptor}`);

  console.log("BEFORE homePage-it._rev:", beforeItRev);
  console.log("BEFORE homePage-en._rev:", beforeEnRev);

  await client.patch("homePage-en").set(HOMEPAGE_EN_SET).commit();

  for (const faq of FAQ_PATCHES) {
    await client
      .patch(faq.id)
      .set({
        question: faq.question,
        [`answer[_key=="${faq.blockKey}"].children[_key=="${faq.spanKey}"].text`]: faq.answer,
      })
      .commit();
  }

  const afterItRev = await client.fetch<string>(`*[_id == "homePage-it"][0]._rev`);
  const afterEnRev = await client.fetch<string>(`*[_id == "homePage-en"][0]._rev`);
  const afterItAree = await client.fetch(`*[_id == "homePage-it"][0].aree.items[]{title, descriptor}`);
  const afterEnAree = await client.fetch(`*[_id == "homePage-en"][0].aree.items[]{title, descriptor}`);

  console.log("AFTER  homePage-it._rev:", afterItRev);
  console.log("AFTER  homePage-en._rev:", afterEnRev);
  console.log("homePage-it._rev unchanged:", beforeItRev === afterItRev);
  console.log("homePage-it.aree.items unchanged:", JSON.stringify(beforeItAree) === JSON.stringify(afterItAree));
  console.log("homePage-en.aree.items unchanged:", JSON.stringify(beforeEnAree) === JSON.stringify(afterEnAree));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
