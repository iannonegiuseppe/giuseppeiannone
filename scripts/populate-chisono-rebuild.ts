import { createClient } from "@sanity/client";
import fs from "fs";

// Chi sono full rebuild pass — writes every new/changed chiSonoSection
// field for the rebuilt page: glassCard, parallaxDivider, howIWork
// (rewritten parts), credentials (institutions band), bodyBlocks (the two
// alternating blocks, replacing the standalone pull-quote section),
// timeline (reduced from 8 entries to 6 by merging, per the rebuild
// brief), publications (restructured into real citations, grouped).
//
// Timeline images: reused, not re-uploaded — the five placeholder assets
// populate-chisono-timeline-images.ts already uploaded (indices 1/2/3/5/6
// of the old 8-entry array) are read off the live IT document first, then
// the same asset refs are written into the new 6-entry array at their
// merged positions. Only two NEW uploads happen here: public/design-lab/
// photos/12.webp and 13.webp, for the two bodyBlocks (previously unused
// anywhere on the site — confirmed via grep before picking them).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

type ImageRef = { _type: "image"; asset: { _type: "reference"; _ref: string }; alt?: string };

async function getExistingTimelineImageRefs(): Promise<Record<number, ImageRef>> {
  const doc = await client.fetch<{ timeline?: { image?: ImageRef }[] } | null>(
    `*[_id == "chiSonoSection-it"][0]{ timeline[]{ image } }`,
  );
  const refs: Record<number, ImageRef> = {};
  (doc?.timeline ?? []).forEach((entry, index) => {
    if (entry.image?.asset?._ref) refs[index] = entry.image;
  });
  return refs;
}

async function uploadBodyBlockImages(): Promise<{ block1: ImageRef; block2: ImageRef }> {
  const upload = async (file: string, label: string): Promise<ImageRef> => {
    const buffer = fs.readFileSync(file);
    const asset = await client.assets.upload("image", buffer, { filename: label });
    console.log(`uploaded ${label} -> ${asset._id}`);
    return { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: "" };
  };
  const block1 = await upload("public/design-lab/photos/12.webp", "PLACEHOLDER — Il corpo / The body");
  const block2 = await upload("public/design-lab/photos/13.webp", "PLACEHOLDER — I sintomi / Symptoms");
  return { block1, block2 };
}

function stripAlt(ref: ImageRef | undefined): ImageRef | undefined {
  if (!ref) return undefined;
  return { _type: "image", asset: ref.asset, alt: "" };
}

async function main() {
  const existingImages = await getExistingTimelineImageRefs();
  const bodyImages = await uploadBodyBlockImages();

  // Old 8-entry indices: 0 Siena, 1 Amsterdam, 2 Maastricht/training,
  // 3 Maastricht/research, 4 Italia/grants, 5 Milano/specialisation,
  // 6 Brescia, 7 Oggi.
  const imgAmsterdam = stripAlt(existingImages[1]);
  const imgMaastricht = stripAlt(existingImages[2]);
  const imgMilano = stripAlt(existingImages[5]);
  const imgBrescia = stripAlt(existingImages[6]);

  const glassCardIt = {
    facts: [
      { label: "ALBO DEGLI PSICOLOGI", value: "n. 18949, Lombardia" },
      { label: "RICERCA", value: "Sette lavori pubblicati" },
      { label: "STUDI", value: "Milano, Monza, Cernusco, Online" },
      { label: "LINGUE", value: "Italiano e inglese" },
    ],
  };
  const glassCardEn = {
    facts: [
      { label: "PSYCHOLOGISTS' REGISTER", value: "No. 18949, Lombardy" },
      { label: "RESEARCH", value: "Seven published papers" },
      { label: "PRACTICES", value: "Milan, Monza, Cernusco, Online" },
      { label: "LANGUAGES", value: "Italian and English" },
    ],
  };

  const parallaxDividerIt = {
    line1: "Riconoscersi in un elenco non è una diagnosi.",
    emphasisWord: "diagnosi",
    line2: "È il punto da cui si comincia a capire cosa sta succedendo, e cosa se ne può fare.",
    markerLabel: "COME LAVORO",
  };
  const parallaxDividerEn = {
    line1: "Recognising yourself in a list isn't a diagnosis.",
    emphasisWord: "diagnosis",
    line2: "It's where you start to understand what's happening, and what can be done with it.",
    markerLabel: "HOW I WORK",
  };

  const howIWorkIt = {
    kicker: "COME LAVORO",
    heading: "Cosa succede, concretamente",
    intro: "Molte persone arrivano senza sapere cosa aspettarsi. È ragionevole: della psicoterapia si parla molto e si racconta poco.",
    parts: [
      {
        title: "Il primo incontro",
        body: [
          "Dura quarantacinque minuti. Mi racconti cosa succede — da quanto, in quali situazioni, cosa hai già provato a fare. Non è un test e non richiede di aver già capito qualcosa: le domande le faccio io.",
          "Serve a due cose: capire di cosa stiamo parlando, e valutare insieme se e come proseguire. Non comporta impegno a continuare.",
        ],
      },
      {
        title: "Gli incontri successivi",
        body: [
          "I primi due o tre incontri sono ravvicinati: settimanali, o a distanza di una decina di giorni. Serve a mettere insieme il quadro senza perdere il filo.",
          "Dopo, il ritmo si allarga: di solito un incontro ogni due o tre settimane. Non è una regola fissa — si valuta insieme e cambia nel tempo.",
          "Il lavoro procede su due binari che si intrecciano. Uno è capire il meccanismo: non l'ansia in generale, ma la tua — quali situazioni la attivano, quali interpretazioni la alimentano, quali strategie la stanno mantenendo senza che tu te ne accorga. Molte persone scoprono qui che quello che facevano per gestirla era parte di ciò che la teneva viva.",
          "L'altro è il lavoro sulle situazioni concrete: ricostruire margine dove il campo si era ristretto, gradualmente e d'accordo.",
        ],
      },
      {
        title: "Fra un incontro e l'altro",
        body: [
          "Il lavoro non si esaurisce in seduta. Fra un incontro e l'altro può esserci qualcosa da fare: esercizi concreti, letture, o l'annotazione di quello che succede — quando arriva l'ansia, in quali situazioni, cosa la precede.",
          "L'automonitoraggio in particolare serve a una cosa precisa: l'ansia si ricorda male. A distanza di giorni resta l'impressione generale e si perdono i dettagli, che sono esattamente quelli su cui si lavora.",
          "Non è compito assegnato da consegnare. È materiale che portiamo all'incontro successivo.",
        ],
      },
      {
        title: "Cosa non faccio",
        body: [
          "Non sono un medico e non prescrivo farmaci. Quando una terapia farmacologica è già in corso, o quando emerge che potrebbe essere utile valutarla, lavoro in raccordo con il medico curante o lo psichiatra.",
          "E non prometto tempi. Quanto dura un percorso dipende da cosa lo ha portato, e chi lo sa in anticipo sta dicendo qualcosa che non può sapere.",
        ],
      },
    ],
  };

  const howIWorkEn = {
    kicker: "HOW I WORK",
    heading: "What actually happens",
    intro: "Many people arrive without knowing what to expect. That's reasonable: psychotherapy gets talked about a great deal and described very little.",
    parts: [
      {
        title: "The first session",
        body: [
          "Forty-five minutes. You tell me what's happening — how long, in what situations, what you've already tried. It isn't a test and it doesn't require having worked anything out beforehand: I ask the questions.",
          "It's there for two things: to understand what we're dealing with, and to work out together whether and how to continue. It doesn't commit you to carrying on.",
        ],
      },
      {
        title: "The sessions after that",
        body: [
          "The first two or three sessions are close together: weekly, or about ten days apart. That's to put the picture together without losing the thread.",
          "After that the rhythm opens out: usually one session every two or three weeks. It isn't a fixed rule — we assess it together and it changes over time.",
          "The work runs on two tracks that interweave. One is understanding the mechanism: not anxiety in general, but yours — which situations set it off, which interpretations feed it, which strategies are maintaining it without your noticing. Many people discover here that what they were doing to manage it was part of what kept it alive.",
          "The other is working on concrete situations: rebuilding room where the field had narrowed, gradually and by agreement.",
        ],
      },
      {
        title: "Between sessions",
        body: [
          "The work doesn't end in the room. Between sessions there may be something to do: concrete exercises, reading, or noting down what happens — when the anxiety arrives, in which situations, what precedes it.",
          "Self-monitoring in particular serves one precise purpose: anxiety is badly remembered. After a few days the general impression remains and the details are gone, and the details are exactly what the work is about.",
          "It isn't homework to hand in. It's material we bring to the next session.",
        ],
      },
      {
        title: "Working in English",
        body: [
          "I'm Italian, and I work in both English and Italian. A large part of the people I see in English didn't grow up in Italy: they came for work, for a partner, for study, or for a year that turned into several.",
          "Describing anxiety is hard enough in your own language. If Italian isn't the language you'd choose for it, that matters, and it's worth saying at the start.",
        ],
      },
      {
        title: "What I don't do",
        body: [
          "I'm not a medical doctor and I don't prescribe. Where medication is already in place, or where it emerges that it might be worth considering, I work alongside your GP or psychiatrist.",
          "And I don't promise timeframes. How long a course of work takes depends on what brought it, and anyone who knows in advance is telling you something they can't know.",
        ],
      },
    ],
  };

  const credentialsIt = {
    kicker: "FORMAZIONE E ESPERIENZA CLINICA",
    tagline: "Quattordici anni fra formazione, ricerca e reparti.",
    items: [
      { institution: "Maastricht University", role: "Neuroscienze" },
      { institution: "Clinica PsyQ, Maastricht", role: "Disturbi d'ansia" },
      { institution: "Università Milano-Bicocca", role: "Psicologia" },
      { institution: "IRCCS Policlinico Maggiore", role: "Psichiatria" },
      { institution: "IRCCS Fatebenefratelli", role: "Ricerca" },
    ],
  };
  const credentialsEn = {
    kicker: "TRAINING AND CLINICAL EXPERIENCE",
    tagline: "Fourteen years across training, research and hospital wards.",
    items: [
      { institution: "Maastricht University", role: "Neuroscience" },
      { institution: "PsyQ Clinic, Maastricht", role: "Anxiety disorders" },
      { institution: "Milano-Bicocca University", role: "Psychology" },
      { institution: "IRCCS Policlinico Maggiore", role: "Psychiatry" },
      { institution: "IRCCS Fatebenefratelli", role: "Research" },
    ],
  };

  const bodyBlocksIt = [
    {
      kicker: "IL CORPO",
      heading: "Il corpo arriva prima del pensiero",
      headingEmphasisWord: "del pensiero",
      body: [
        "Nell'ansia il corpo arriva prima del pensiero. Il respiro, l'attenzione ai segnali corporei, il modo in cui si reagisce a un battito accelerato: sono cose su cui si può lavorare direttamente, e spesso sono il punto da cui si comincia.",
        "Non è un accessorio del percorso. È il motivo per cui ho studiato neuroscienze prima di diventare psicoterapeuta.",
      ],
      quote: "«Il respiro non segue la paura. La precede.»",
      image: bodyImages.block1,
    },
    {
      kicker: "I SINTOMI",
      heading: "Una spia sul cruscotto",
      headingEmphasisWord: "cruscotto",
      body: [
        "Si può tagliare il filo che porta il segnale luminoso e continuare a guidare. Si avrebbe l'illusione che il guasto non ci sia.",
        "Non ho nulla contro i farmaci: in molti casi sono alleati preziosi, soprattutto insieme alla psicoterapia. Ma quando i sintomi vengono soltanto spenti, la domanda che li ha prodotti resta senza risposta.",
        "In psicoterapia si va a leggere il significato dei sintomi, e a contestualizzarli in una storia — la tua.",
      ],
      quote: "«Spegnere la spia non ripara il guasto.»",
      image: bodyImages.block2,
    },
  ];

  const bodyBlocksEn = [
    {
      kicker: "THE BODY",
      heading: "The body arrives before the thought",
      headingEmphasisWord: "the thought",
      body: [
        "In anxiety the body arrives before the thought. Breathing, attention to bodily signals, how you respond to a racing heart — these can be worked on directly, and they're often where we start.",
        "It isn't an accessory to the work. It's why I studied neuroscience before becoming a psychotherapist.",
      ],
      quote: "\"Breathing doesn't follow the fear. It precedes it.\"",
      image: bodyImages.block1,
    },
    {
      kicker: "SYMPTOMS",
      heading: "A warning light on the dashboard",
      headingEmphasisWord: "dashboard",
      body: [
        "You could cut the wire that carries the signal and keep driving. You'd have the illusion that there was no fault.",
        "I have nothing against medication: in many cases it's a valuable ally, particularly alongside psychotherapy. But when symptoms are only switched off, the question that produced them goes unanswered.",
        "In psychotherapy we read what the symptoms mean, and place them in a history — yours.",
      ],
      quote: "\"Switching the light off doesn't fix the fault.\"",
      image: bodyImages.block2,
    },
  ];

  const timelineIt = [
    {
      place: "Siena",
      kicker: "L'INIZIO",
      title: "Un'esperienza a cui non sapevo dare un nome",
      body: [
        "Era il 2001. Studiavo Filologia all'Università per Stranieri di Siena e della psicologia non sapevo nulla. Un giorno, durante una lezione di letterature comparate, il cuore ha iniziato a correre all'improvviso, senza motivo. Testa leggera, respiro corto, la sensazione di essere staccato dal mio corpo e dall'aula.",
        "Sono uscito di corsa e ho fatto la strada verso casa chiedendomi se ce l'avrei fatta ad arrivare. Quando sono arrivato era già finito.",
        "Era un attacco di panico — ma allora non sapevo dargli un nome.",
      ],
      pullQuote: "«Da quel giorno ho iniziato a evitare. Il supermercato, il cinema, l'ascensore, i mezzi, l'università. Era diventata la mia strategia.»",
    },
    {
      place: "Amsterdam",
      kicker: "IL NOME",
      title: "Dare un nome cambia la direzione",
      body: [
        "Dopo la laurea ho ottenuto un posto come docente di lingua e cultura italiana ad Amsterdam. Nel frattempo quell'esperienza si era ripresentata più volte.",
        "È lì che, per la prima volta, ho chiesto aiuto a uno psicoterapeuta.",
        "Dare un nome e un senso a quello che mi succedeva ha cambiato la direzione della mia vita: ho deciso di ricominciare dagli studi e di dedicarmi alla psicologia.",
      ],
      image: imgAmsterdam,
    },
    {
      place: "Maastricht",
      kicker: "FORMAZIONE E RICERCA",
      title: "Neuroscienze Cognitive e Cliniche",
      body: [
        "Avevo già una laurea e un lavoro. Mi sono iscritto di nuovo all'università, questa volta a Psicologia, e ho concluso gli studi in Neuroscienze Cognitive e Cliniche all'Università di Maastricht, con specializzazione in Psicopatologia.",
        "Dopo la specializzazione ho svolto un tirocinio clinico presso il Dipartimento dei Disturbi d'Ansia della clinica PsyQ di Maastricht. Lì, anche grazie al mio background di insegnante, conducevo sedute di gruppo di psicoeducazione per pazienti olandesi con disturbi d'ansia.",
        "L'interesse per la ricerca mi ha portato a un secondo tirocinio, su stress e resilienza, presso la Mental Health School of Neuroscience.",
        "Non è un dettaglio pittoresco. È il motivo per cui, quando in studio si parla di quello che il corpo fa durante un attacco di panico, so di cosa sto parlando dal lato del laboratorio, non solo da quello della stanza.",
      ],
      pullQuote: "«Un laboratorio al piano meno uno, a sezionare fettine sottilissime di cervelli di topi e a contare neuroni nell'ippocampo al microscopio ottico. Cercavo di capire se certi topi nascano più preparati di altri ad affrontare lo stress.»",
      image: imgMaastricht,
    },
    {
      place: "Milano",
      kicker: "SPECIALIZZAZIONE",
      title: "La scuola di psicoterapia",
      body: [
        "Rientrato in Italia, ho vinto due borse di ricerca biennali per studiare le alterazioni fisiologiche e i correlati psicologici del disturbo di panico.",
        "È l'esperienza che ha aggiunto al lavoro clinico una base metodologica: leggere la letteratura scientifica, valutarla, e distinguere quello che è documentato da quello che circola.",
        "In quegli anni ho pubblicato alcuni lavori su ansia e depressione.",
        "Ho conseguito il Diploma di specializzazione in Psicoterapia Cognitiva Neuropsicologica: un percorso di quattro anni che abilita all'esercizio della professione di psicoterapeuta.",
        "In quegli anni ho svolto un tirocinio di dodici mesi presso il reparto di Psichiatria dell'Ospedale IRCCS Policlinico Maggiore di Milano, con pazienti affetti da psicosi, disturbo bipolare e disturbi di personalità.",
        "Anche lì l'ansia e il panico c'erano.",
      ],
      image: imgMilano,
    },
    {
      place: "Brescia",
      kicker: "RICERCA CLINICA",
      title: "Psichiatria epidemiologica",
      body: [
        "Per un anno ho lavorato come ricercatore presso il Dipartimento di Psichiatria Epidemiologica dell'IRCCS Fatebenefratelli di Brescia, dove ho pubblicato una meta-analisi sull'accettabilità delle misure di rilevamento dell'umore nei pazienti con depressione.",
        "Nello stesso periodo ho condotto giornate di formazione sull'uso di una batteria di test neuropsicologici e somministrato test in contesti di psichiatria forense.",
      ],
      image: imgBrescia,
    },
    {
      place: "Oggi",
      kicker: "OGGI",
      title: "Non sono un tuttologo",
      body: [
        "Lavoro in italiano e in inglese. Negli anni ho accompagnato persone arrivate a Milano da ogni parte del mondo: studiare e vivere all'estero mi ha insegnato quanto conti potersi raccontare nella lingua in cui ci si sente a casa.",
        "Oggi mi occupo esclusivamente di ansia e panico, e delle difficoltà che li accompagnano. Ricevo a Milano, Monza, Cernusco sul Naviglio e online.",
        "Non sono un tuttologo — e lo considero un punto di forza.",
      ],
    },
  ];

  const timelineEn = [
    {
      place: "Siena",
      kicker: "THE BEGINNING",
      title: "Something I had no name for",
      body: [
        "It was 2001. I was studying Philology at the University for Foreigners in Siena and knew nothing about psychology. One day, during a comparative literature lecture, my heart started racing out of nowhere. Light head, short breath, the sense of being detached from my own body and from the room.",
        "I left in a hurry and walked home wondering whether I would make it. By the time I got there it was over.",
        "It was a panic attack — but I had no name for it then.",
      ],
      pullQuote: "\"From that day I started avoiding. The supermarket, the cinema, lifts, public transport, the university. It had become my strategy.\"",
    },
    {
      place: "Amsterdam",
      kicker: "A NAME",
      title: "Naming it changed the direction",
      body: [
        "After graduating I took a post teaching Italian language and culture in Amsterdam. By then the experience had returned several times.",
        "It was there that I first asked a psychotherapist for help.",
        "Giving a name and a meaning to what was happening to me changed the direction of my life: I decided to start my studies again and turn to psychology.",
      ],
      image: imgAmsterdam,
    },
    {
      place: "Maastricht",
      kicker: "TRAINING AND RESEARCH",
      title: "Cognitive and Clinical Neuroscience",
      body: [
        "I already had a degree and a job. I enrolled at university again, this time in Psychology, and completed my studies in Cognitive and Clinical Neuroscience at Maastricht University, specialising in Psychopathology.",
        "After qualifying I did a clinical placement in the Anxiety Disorders Department of the PsyQ clinic in Maastricht. There, partly thanks to my background as a teacher, I ran psychoeducation groups for Dutch patients with anxiety disorders.",
        "An interest in research led me to a second placement, on stress and resilience, at the Mental Health School of Neuroscience.",
        "That isn't a picturesque detail. It's why, when we talk in session about what the body does during a panic attack, I know what I'm talking about from the laboratory side, not only from the consulting-room side.",
      ],
      pullQuote: "\"A laboratory one floor below ground, sectioning very thin slices of mouse brain and counting neurons in the hippocampus under an optical microscope. I was trying to work out whether some mice are born better equipped than others to handle stress.\"",
      image: imgMaastricht,
    },
    {
      place: "Milan",
      kicker: "SPECIALISATION",
      title: "Psychotherapy training",
      body: [
        "Back in Italy, I was awarded two two-year research grants to study the physiological alterations and psychological correlates of panic disorder.",
        "That's the experience that added a methodological base to the clinical work: reading the scientific literature, assessing it, and telling what's documented apart from what merely circulates.",
        "During those years I published some work on anxiety and depression.",
        "I completed the Specialisation Diploma in Cognitive-Neuropsychological Psychotherapy: a four-year course that qualifies a practitioner to work as a psychotherapist.",
        "During those years I did a twelve-month placement in the Psychiatry department of the IRCCS Policlinico Maggiore hospital in Milan, with patients living with psychosis, bipolar disorder and personality disorders.",
        "Anxiety and panic were there too.",
      ],
      image: imgMilano,
    },
    {
      place: "Brescia",
      kicker: "CLINICAL RESEARCH",
      title: "Epidemiological psychiatry",
      body: [
        "For a year I worked as a researcher in the Department of Epidemiological Psychiatry at IRCCS Fatebenefratelli in Brescia, where I published a meta-analysis on the acceptability of mood measurement instruments in patients with depression.",
        "In the same period I ran training days on the use of a neuropsychological test battery, and administered tests in forensic psychiatry settings.",
      ],
      image: imgBrescia,
    },
    {
      place: "Today",
      kicker: "TODAY",
      title: "I'm not a jack-of-all-trades",
      body: [
        "I work in Italian and in English. Over the years I've worked with people who came to Milan from all over the world: studying and living abroad taught me how much it matters to be able to describe yourself in the language you feel at home in.",
        "Today I work exclusively with anxiety and panic, and the difficulties that come with them. I see people in Milan, Monza, Cernusco sul Naviglio and online.",
        "I'm not a jack-of-all-trades — and I consider that a strength.",
      ],
    },
  ];

  // Publications: citation content (authors/title/source) is deliberately
  // IDENTICAL across it/en — academic citations aren't translated, per the
  // source draft's own explicit note ("Same seven works as the IT section
  // above ... author names, titles and journals stay in their original
  // language regardless of site locale"). Only kicker/title/note (below)
  // differ per locale.
  const publicationItems = [
    {
      group: "journal",
      authors: "De Girolamo G., Iannone G., et al.",
      title:
        "The acceptability of real-time health monitoring among community participants with depression: a systematic review and meta-analysis of the literature",
      source: "Depression and Anxiety, 2020",
      url: "https://onlinelibrary.wiley.com/doi/abs/10.1002/da.23023",
    },
    {
      group: "journal",
      authors: "Perna G., Iannone G., Alciati A., Caldirola D.",
      title: "Are anxiety disorders associated with accelerated aging? A focus on neuroprogression",
      // CV dates this 2015; PubMed (article 8457612, DOI 10.1155/2016/8457612)
      // dates it 2016 — using PubMed's year per this pass's own instruction.
      source: "Neural Plasticity, 2016",
      url: "https://pubmed.ncbi.nlm.nih.gov/26881136/",
    },
    {
      group: "book",
      authors: "Caldirola D., Iannone G., Diaferia G., Perna G.",
      title: "Different effects of cigarette smoking on neuropsychological performance in psychiatric disorders",
      source: "In: The Neuropathology of Drug Addictions and Substance Misuse, a cura di Preedy V. — Academic Press, 2015",
    },
    {
      group: "book",
      authors: "Perna G., Iannone G., Torti T., Cavedini P.",
      title: "The neurobiology of Generalized Anxiety Disorder",
      source:
        "In: New Perspectives on Generalized Anxiety Disorder, a cura di Guglielmo G., Janiri L., Pozzi G. — Nova Science Publishers, 2014",
    },
    {
      group: "conference",
      authors: "Iannone G., Caldirola D., Di Chiaro V., Daccò S., Micieli W., Perna G.",
      title:
        "L'impatto dei traumi infantili sulle funzioni neuropsicologiche. Uno studio in pazienti con Disturbo Bipolare",
      source: "19° Congresso della Società Italiana di Psicopatologia (SOPSI), Milano",
    },
    {
      group: "conference",
      authors: "Perna G., Sangiorgio E., Pozzi V., Iannone G., Caldirola D.",
      title:
        "La relazione tra trauma infantile, genere, età ed esordio di malattia in una popolazione psichiatrica adulta",
      source: "18° Congresso della Società Italiana di Psicopatologia (SOPSI), Torino, 2014",
    },
    {
      group: "conference",
      authors: "Vanni G., Piccinni M., Borriello G., Iannone G., Cavedini P., Perna G.",
      title:
        "Associazione tra emotività espressa, trauma infantile e temperamento in pazienti con disturbo ossessivo-compulsivo",
      source: "18° Congresso della Società Italiana di Psicopatologia (SOPSI), Torino, 2014",
    },
  ];

  const publicationsIt = {
    kicker: "RICERCA PUBBLICATA",
    title: "Lavori pubblicati",
    note: "Due dei lavori sono liberamente consultabili online.",
    items: publicationItems,
  };
  const publicationsEn = {
    kicker: "PUBLISHED RESEARCH",
    title: "Published work",
    note: "Two of these are freely available online.",
    items: publicationItems,
  };

  await client
    .patch("chiSonoSection-it")
    .set({
      glassCard: glassCardIt,
      parallaxDivider: parallaxDividerIt,
      howIWork: howIWorkIt,
      credentials: credentialsIt,
      bodyBlocks: bodyBlocksIt,
      timeline: timelineIt,
      publications: publicationsIt,
    })
    .commit();
  console.log("patched chiSonoSection-it");

  await client
    .patch("chiSonoSection-en")
    .set({
      glassCard: glassCardEn,
      parallaxDivider: parallaxDividerEn,
      howIWork: howIWorkEn,
      credentials: credentialsEn,
      bodyBlocks: bodyBlocksEn,
      timeline: timelineEn,
      publications: publicationsEn,
    })
    .commit();
  console.log("patched chiSonoSection-en");

  console.log("\n=== chi sono full rebuild data: done ===");
}

main();
