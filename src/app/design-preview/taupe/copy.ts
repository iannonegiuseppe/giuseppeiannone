// Patch pass — all visible copy centralized here (was scattered as inline
// JSX/array literals) so a translator/developer can find and swap every
// string in one place. This is the internal-review (English) version;
// production will be Italian — swapping back is a matter of editing this
// one file's values, not hunting through markup. Deontology-safe: no
// outcome promises, no numbers/percentages, no client counts, no "free
// session," no urgency — keep it that way when this is ever translated
// or edited again.
export const COPY = {
  hero: {
    eyebrow: "PSYCHOLOGIST · PSYCHOTHERAPIST",
    headingBefore: "Where do we ",
    headingEmphasis: "begin",
    headingAfter: "?",
    sub: "A space to understand what you're going through — and what you can do about it. Calmly, without rushing.",
    cta: "Start the journey",
    videoLabel: "ambient video · silent loop",
  },
  recognition: {
    heading: "Does this sound familiar?",
    lines: [
      "I wake up already tired, and I don't even know why.",
      "My heart races for no clear reason. I check that everything's fine — and it is. But my body doesn't believe it.",
      "I keep putting off decisions until they stop being decisions and become emergencies.",
    ],
  },
  hope: {
    eyebrow: "A POSSIBLE PATH",
    heading: "It hasn't always been this way. And it doesn't have to stay this way.",
  },
  journey: {
    heading: "How the journey works",
    steps: [
      {
        numeral: "01",
        title: "The first contact",
        text: "A message or a call, to understand together whether the conditions are there to begin.",
      },
      {
        numeral: "02",
        title: "Understanding it together",
        text: "The first sessions bring the real question into focus, without rushing to conclusions.",
      },
      {
        numeral: "03",
        title: "Work with clear goals",
        text: "We define a direction together, revised and adapted over time as needed.",
      },
      {
        numeral: "04",
        title: "Continuity, at the right pace",
        text: "The path continues at the pace that suits you, not on a fixed schedule.",
      },
    ],
  },
  bio: {
    eyebrow: "WHO I AM",
    heading: "Giuseppe Iannone",
    body: "Psychologist and psychotherapist. For years I've supported people through anxiety, life changes and difficult moments, with a cognitive-behavioural approach.",
    credentials: "Registered with the Order of Psychologists of Lombardy no. [placeholder]",
  },
  areas: {
    heading: "How can I help you?",
    items: [
      {
        title: "Anxiety",
        text: "When the mind always expects the worst, and the body struggles to trust that things are okay.",
        size: "lg",
      },
      {
        title: "Panic attacks",
        text: "Sudden, intense episodes, often followed by the fear they'll happen again.",
        size: "md",
      },
      {
        title: "Rumination and intrusive thoughts",
        text: "The same thought looping, without ever reaching a resolution.",
        size: "md",
      },
      {
        title: "Life changes",
        text: "Major transitions that call for reorganising your points of reference.",
        size: "sm",
      },
      {
        title: "Relational difficulties",
        text: "Patterns that repeat in relationships, in the family or at work.",
        size: "sm",
      },
    ],
  },
  session: {
    eyebrow: "VIDEO",
    heading: "The first session",
    body: "A first meeting to get to know each other, understand the request and consider together how to proceed.",
    label: "click to play · no autoplay",
    activatedLabel: "Preview — no real video in this design artifact",
  },
  contact: {
    eyebrow: "FIRST CONTACT",
    heading: "Let's talk",
    body: "If you feel this might be the right moment for you, I'm here to listen. The first step is simple.",
    cta: "Get in touch",
    phone: "[placeholder — phone]",
    email: "[placeholder — email]",
    mapLabel: "Open in Google Maps",
    mapAriaLabel: "Open in Google Maps (placeholder)",
  },
  footer: {
    wordmark: "Giuseppe Iannone",
    copyright: "© 2026 Giuseppe Iannone",
  },
} as const;
