import { createClient } from "@sanity/client";

// Chi sono timeline pass (pass 2 of 4) — writes chiSonoSection.timeline,
// both locales. createIfNotExists + patch.set, touches only this one
// field.
//
// Years: verbatim to what's known. Entry 1 (Siena) is dated 2001 in the
// source. Entry 8 ("Oggi"/"Today") has NO year — 2016 is when he
// registered with the Albo, not when "today" began; attaching it here
// would tell the reader something untrue. That date belongs to the
// professional details section (pass 3) instead. Entries 2-8 have no
// year field written at all — not an empty string, the field is simply
// absent, so the rail/entry-meta render the place alone.
//
// pullQuote position: the source draft places entry 4's quote BETWEEN
// its two body paragraphs, but entry 1's quote AFTER all three of its
// paragraphs. The schema treats pullQuote as one distinct field, not a
// body-embedded content type, so both entries render it in the same
// place — after the body — for a consistent rhythm across all 8 entries
// rather than a per-entry position. Same text either way, just one
// placement decision, not a content change.
//
// Not written here (deferred to pass 3, per instruction): publications,
// the "spia sul cruscotto" quote section, professional details.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function patchDoc(id: string, fields: Record<string, unknown>) {
  await client.createIfNotExists({ _id: id, _type: "chiSonoSection" });
  await client.patch(id).set(fields).commit();
  console.log(`\n--- ${id} ---`);
  console.log(JSON.stringify(fields, null, 2));
}

const timelineIt = [
  {
    place: "Siena",
    year: "2001",
    kicker: "L'INIZIO",
    title: "Un'esperienza a cui non sapevo dare un nome",
    body: [
      "Studiavo Filologia all'Università per Stranieri e della psicologia non sapevo nulla. Un giorno, durante una lezione di letterature comparate, il cuore ha iniziato a correre all'improvviso, senza motivo. Testa leggera, respiro corto, la sensazione di essere staccato dal mio corpo e dall'aula.",
      "Sono uscito di corsa e ho fatto la strada verso casa chiedendomi se ce l'avrei fatta ad arrivare. Quando sono arrivato era già finito.",
      "Era un attacco di panico — ma allora non sapevo dargli un nome.",
    ],
    pullQuote:
      "Da quel giorno ho iniziato a evitare. Il supermercato, il cinema, l'ascensore, i mezzi, l'università. Era diventata la mia strategia.",
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
  },
  {
    place: "Maastricht",
    kicker: "FORMAZIONE",
    title: "Neuroscienze Cognitive e Cliniche",
    body: [
      "Avevo già una laurea e un lavoro. Mi sono iscritto di nuovo all'università, questa volta a Psicologia, e ho concluso gli studi in Neuroscienze Cognitive e Cliniche all'Università di Maastricht, con specializzazione in Psicopatologia.",
      "Dopo la specializzazione ho svolto un tirocinio clinico presso il Dipartimento dei Disturbi d'Ansia della clinica PsyQ di Maastricht. Lì, anche grazie al mio background di insegnante, conducevo sedute di gruppo di psicoeducazione per pazienti olandesi con disturbi d'ansia.",
    ],
  },
  {
    place: "Maastricht",
    kicker: "RICERCA",
    title: "Dai pazienti ai topi, e di nuovo ai pazienti",
    body: [
      "L'interesse per la ricerca mi ha portato a un secondo tirocinio, su stress e resilienza, presso la Mental Health School of Neuroscience.",
      "Non è un dettaglio pittoresco. È il motivo per cui, quando in studio si parla di quello che il corpo fa durante un attacco di panico, so di cosa sto parlando dal lato del laboratorio, non solo da quello della stanza.",
    ],
    pullQuote:
      "Un laboratorio al piano meno uno, a sezionare fettine sottilissime di cervelli di topi e a contare neuroni nell'ippocampo al microscopio ottico. Cercavo di capire se certi topi nascano più preparati di altri ad affrontare lo stress.",
  },
  {
    place: "Italia",
    kicker: "DUE BORSE DI RICERCA",
    title: "Le alterazioni fisiologiche del disturbo di panico",
    body: [
      "Rientrato in Italia, ho vinto due borse di ricerca biennali per studiare le alterazioni fisiologiche e i correlati psicologici del disturbo di panico.",
      "È l'esperienza che ha aggiunto al lavoro clinico una base metodologica: leggere la letteratura scientifica, valutarla, e distinguere quello che è documentato da quello che circola.",
      "In quegli anni ho pubblicato alcuni lavori su ansia e depressione.",
    ],
  },
  {
    place: "Milano",
    kicker: "SPECIALIZZAZIONE",
    title: "La scuola di psicoterapia",
    body: [
      "Ho conseguito il Diploma di specializzazione in Psicoterapia Cognitiva Neuropsicologica: un percorso di quattro anni che abilita all'esercizio della professione di psicoterapeuta.",
      "In quegli anni ho svolto un tirocinio di dodici mesi presso il reparto di Psichiatria dell'Ospedale IRCCS Policlinico Maggiore di Milano, con pazienti affetti da psicosi, disturbo bipolare e disturbi di personalità.",
      "Anche lì l'ansia e il panico c'erano.",
    ],
  },
  {
    place: "Brescia",
    kicker: "RICERCA CLINICA",
    title: "Psichiatria epidemiologica",
    body: [
      "Per un anno ho lavorato come ricercatore presso il Dipartimento di Psichiatria Epidemiologica dell'IRCCS Fatebenefratelli di Brescia, dove ho pubblicato una meta-analisi sull'accettabilità delle misure di rilevamento dell'umore nei pazienti con depressione.",
      "Nello stesso periodo ho condotto giornate di formazione sull'uso di una batteria di test neuropsicologici e somministrato test in contesti di psichiatria forense.",
    ],
  },
  {
    place: "Milano",
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
    year: "2001",
    kicker: "THE BEGINNING",
    title: "Something I had no name for",
    body: [
      "I was studying Philology at the University for Foreigners and knew nothing about psychology. One day, during a comparative literature lecture, my heart started racing out of nowhere. Light head, short breath, the sense of being detached from my own body and from the room.",
      "I left in a hurry and walked home wondering whether I would make it. By the time I got there it was over.",
      "It was a panic attack — but I had no name for it then.",
    ],
    pullQuote:
      "From that day I started avoiding. The supermarket, the cinema, lifts, public transport, the university. It had become my strategy.",
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
  },
  {
    place: "Maastricht",
    kicker: "TRAINING",
    title: "Cognitive and Clinical Neuroscience",
    body: [
      "I already had a degree and a job. I enrolled at university again, this time in Psychology, and completed my studies in Cognitive and Clinical Neuroscience at Maastricht University, specialising in Psychopathology.",
      "After qualifying I did a clinical placement in the Anxiety Disorders Department of the PsyQ clinic in Maastricht. There, partly thanks to my background as a teacher, I ran psychoeducation groups for Dutch patients with anxiety disorders.",
    ],
  },
  {
    place: "Maastricht",
    kicker: "RESEARCH",
    title: "From patients to mice, and back to patients",
    body: [
      "An interest in research led me to a second placement, on stress and resilience, at the Mental Health School of Neuroscience.",
      "That isn't a picturesque detail. It's why, when we talk in session about what the body does during a panic attack, I know what I'm talking about from the laboratory side, not only from the consulting-room side.",
    ],
    pullQuote:
      "A laboratory one floor below ground, sectioning very thin slices of mouse brain and counting neurons in the hippocampus under an optical microscope. I was trying to work out whether some mice are born better equipped than others to handle stress.",
  },
  {
    place: "Italy",
    kicker: "TWO RESEARCH GRANTS",
    title: "The physiology of panic disorder",
    body: [
      "Back in Italy, I was awarded two two-year research grants to study the physiological alterations and psychological correlates of panic disorder.",
      "That's the experience that added a methodological base to the clinical work: reading the scientific literature, assessing it, and telling what's documented apart from what merely circulates.",
      "During those years I published some work on anxiety and depression.",
    ],
  },
  {
    place: "Milan",
    kicker: "SPECIALISATION",
    title: "Psychotherapy training",
    body: [
      "I completed the Specialisation Diploma in Cognitive-Neuropsychological Psychotherapy: a four-year course that qualifies a practitioner to work as a psychotherapist.",
      "During those years I did a twelve-month placement in the Psychiatry department of the IRCCS Policlinico Maggiore hospital in Milan, with patients living with psychosis, bipolar disorder and personality disorders.",
      "Anxiety and panic were there too.",
    ],
  },
  {
    place: "Brescia",
    kicker: "CLINICAL RESEARCH",
    title: "Epidemiological psychiatry",
    body: [
      "For a year I worked as a researcher in the Department of Epidemiological Psychiatry at IRCCS Fatebenefratelli in Brescia, where I published a meta-analysis on the acceptability of mood measurement instruments in patients with depression.",
      "In the same period I ran training days on the use of a neuropsychological test battery, and administered tests in forensic psychiatry settings.",
    ],
  },
  {
    place: "Milan",
    kicker: "TODAY",
    title: "I'm not a jack-of-all-trades",
    body: [
      "I work in Italian and in English. Over the years I've worked with people who came to Milan from all over the world: studying and living abroad taught me how much it matters to be able to describe yourself in the language you feel at home in.",
      "Today I work exclusively with anxiety and panic, and the difficulties that come with them. I see people in Milan, Monza, Cernusco sul Naviglio and online.",
      "I'm not a jack-of-all-trades — and I consider that a strength.",
    ],
  },
];

async function main() {
  await patchDoc("chiSonoSection-it", { timeline: timelineIt });
  await patchDoc("chiSonoSection-en", { timeline: timelineEn });
  console.log("\n=== chi sono timeline: done ===");
}

main();
