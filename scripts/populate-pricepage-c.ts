import { createClient } from "@sanity/client";

// /prezzi port pass — populates pricePage-it/-en with the exact copy the
// owner approved for the design-lab "C" proposal (src/app/design-lab/
// prezzi-proposals/c-editoriale/content.ts), mapped into the new fields
// added to pricePage's schema this same pass. Verbatim — nothing reworded.
// Fee/duration figures are NOT written here; every one stays computed
// from siteSettings.pricing at render time (src/sanity/pricing.ts).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

function introBlock(docId: string, key: string, text: string) {
  return {
    _key: `${docId}-${key}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `${docId}-${key}-span`, _type: "span", marks: [], text }],
  };
}

function link(key: string, label: string, targetId: string) {
  return { _key: key, label, target: { _type: "reference", _ref: targetId } };
}

async function main() {
  // Pillar page ids — fetched live, not guessed (this pass's own report
  // lists the same values, re-confirmed here at write time).
  const pillars = await client.fetch<{ _id: string }[]>(
    `*[_type == "pillarPage" && slug.current in [
      "disturbi-d-ansia", "anxiety-disorders",
      "attacchi-di-panico", "panic-attacks",
      "stress-e-burnout", "stress-and-burnout",
      "trauma",
      "terapia-di-coppia", "couples-therapy",
      "disfunzioni-sessuali", "sexual-difficulties"
    ]]{ _id, "slug": slug.current }`,
  );
  const idFor = (slug: string) => {
    const found = pillars.find((p: any) => p.slug === slug);
    if (!found) throw new Error(`Pillar not found for slug: ${slug}`);
    return found._id;
  };

  const IT = {
    docId: "pricePage-it",
    title: "Le mie tariffe",
    body: [
      introBlock(
        "pricePage-it",
        "intro-1",
        "La tariffa dipende dal tipo di seduta, non dal luogo. Individuale o di coppia, a Milano, a Monza, a Cernusco o in videochiamata: il prezzo è lo stesso, ed è scritto qui sotto per intero prima ancora che lei mi scriva.",
      ),
      introBlock(
        "pricePage-it",
        "intro-2",
        "Anche il primo incontro è una seduta a tutti gli effetti e si paga alla tariffa ordinaria: non è un colloquio conoscitivo gratuito, ma non è nemmeno un impegno a proseguire. Si salda alla fine di ogni seduta, in contanti, con bonifico o con carta. La ricevuta viene sempre rilasciata: se il pagamento è tracciabile, è detraibile al 19% come spesa sanitaria.",
      ),
    ],
    servicesIntro: "In studio — a Milano (Citylife e Bicocca), a Monza, a Cernusco sul Naviglio — oppure online:",
    services: {
      individual: {
        title: "Seduta individuale",
        paragraph1:
          "Quarantacinque minuti, di norma una volta a settimana. Il primo incontro serve a mettere a fuoco che cosa la porta qui e a capire se il modo in cui lavoro le è utile: non deve arrivare preparato, né sapere già da dove cominciare.",
        linkPrefix: "Indicata, tra le altre cose, per chi lavora su",
        links: [
          link("l1", "ansia", idFor("disturbi-d-ansia")),
          link("l2", "attacchi di panico", idFor("attacchi-di-panico")),
          link("l3", "stress", idFor("stress-e-burnout")),
          link("l4", "trauma", idFor("trauma")),
        ],
        linkSuffix: ".",
      },
      couple: {
        title: "Terapia di coppia",
        paragraph1:
          "Un'ora, con entrambi presenti. Non è la sede in cui si stabilisce chi ha ragione: si guarda a come funziona il rapporto, che cosa si ripete e che cosa ciascuno porta dentro quello schema. Quando serve, il percorso può alternare qualche incontro individuale.",
        linkPrefix: "Pensata per chi affronta",
        links: [link("l1", "difficoltà di coppia", idFor("terapia-di-coppia"))],
        linkSuffix: ".",
      },
      sexology: {
        title: "Consulenza sessuologica",
        derivedNote: "stessa tariffa e durata della seduta individuale",
        paragraph1:
          "Uno spazio dedicato alla sessualità — da soli o in coppia — con la stessa riservatezza di qualsiasi altro colloquio. Si parte da quello che sta succedendo adesso, senza dare per scontato che la causa sia solo fisica o solo psicologica.",
        linkPrefix: "Un percorso dedicato a chi affronta",
        links: [link("l1", "difficoltà sessuali", idFor("disfunzioni-sessuali"))],
        linkSuffix: ".",
      },
      online: {
        title: "Incontri online",
        derivedNote: "stessa durata e stessa tariffa della seduta corrispondente in studio",
        paragraph1:
          "Stessa durata, stessa tariffa e stesso modo di lavorare della seduta in studio. Riceve il link prima dell'appuntamento; quello che conta davvero è avere una connessione stabile e una stanza in cui nessuno la interrompa.",
      },
    },
    darkBand: {
      kicker: "In breve",
      heading: "Quello che paga è quello che legge qui",
      column1:
        "Non ci sono pacchetti da acquistare, sedute minime, quote di iscrizione o supplementi per il primo incontro. La tariffa è quella indicata sopra e non cambia in corso di percorso senza che gliene parli prima.",
      column2:
        "Non cambia nemmeno in base al luogo o al mezzo. Milano, Monza, Cernusco o videochiamata: si lavora sempre alle stesse condizioni, in ogni sede.",
      emphasisWord: "sempre alle stesse condizioni",
    },
    facts: [
      { _key: "f1", label: "Dove", value: "Milano, Monza, Cernusco sul Naviglio, online — stessa tariffa ovunque." },
      { _key: "f2", label: "Prima seduta", value: "Completa, alla tariffa ordinaria." },
      { _key: "f3", label: "Pagamento", value: "Contanti, bonifico o carta, a fine seduta. Ricevuta sempre rilasciata." },
      { _key: "f4", label: "Detrazione", value: "19% come spesa sanitaria, pagamenti tracciabili." },
    ],
  };

  const EN = {
    docId: "pricePage-en",
    title: "My fees",
    body: [
      introBlock(
        "pricePage-en",
        "intro-1",
        "The fee depends on the type of session, not on where it takes place. Individual or couple, in Milan, Monza, Cernusco or by video call: the price is the same, and it's set out in full below before you ever write to me.",
      ),
      introBlock(
        "pricePage-en",
        "intro-2",
        "The first meeting is a full session too, and it's charged at the ordinary rate: it isn't a free introductory chat, but it isn't a commitment to continue either. Payment is settled at the end of each session, in cash, by transfer or by card. A receipt is always issued: where the payment is traceable, it qualifies for the 19% Italian healthcare-expense deduction.",
      ),
    ],
    servicesIntro: "In the studio — in Milan (Citylife and Bicocca), in Monza, in Cernusco sul Naviglio — or online:",
    services: {
      individual: {
        title: "Individual session",
        paragraph1:
          "Forty-five minutes, usually once a week. The first meeting is for working out what brings you here and whether the way I work is useful to you: you don't need to arrive prepared, or to know where to start.",
        linkPrefix: "Suited, among other things, to work on",
        links: [
          link("l1", "anxiety", idFor("anxiety-disorders")),
          link("l2", "panic attacks", idFor("panic-attacks")),
          link("l3", "stress", idFor("stress-and-burnout")),
          link("l4", "trauma", idFor("trauma")),
        ],
        linkSuffix: ".",
      },
      couple: {
        title: "Couples therapy",
        paragraph1:
          "One hour, with both of you present. This isn't the place where it's decided who's right: we look at how the relationship works, what keeps repeating, and what each of you brings to that pattern. Where it helps, a course of work can include occasional individual meetings.",
        linkPrefix: "For couples facing",
        links: [link("l1", "relationship difficulties", idFor("couples-therapy"))],
        linkSuffix: ".",
      },
      sexology: {
        title: "Sexology consultation",
        derivedNote: "same fee and duration as the individual session",
        paragraph1:
          "A space for talking about sexuality — on your own or as a couple — with the same confidentiality as any other session. We start from what is happening now, without assuming the cause is purely physical or purely psychological.",
        linkPrefix: "For those facing",
        links: [link("l1", "sexual difficulties", idFor("sexual-difficulties"))],
        linkSuffix: ".",
      },
      online: {
        title: "Online sessions",
        derivedNote: "same duration and fee as the corresponding in-studio session",
        paragraph1:
          "Same duration, same fee and same way of working as a session in the studio. You'll receive the link before the appointment; what matters most is a stable connection and a room where you won't be interrupted.",
      },
    },
    darkBand: {
      kicker: "In short",
      heading: "What you pay is what you read here",
      column1:
        "There are no packages to buy, no minimum number of sessions, no registration fee and no surcharge for the first meeting. The fee is the one shown above, and it doesn't change mid-course without my discussing it with you first.",
      column2:
        "It doesn't change with the place or the medium either. Milan, Monza, Cernusco or video call: the work happens on the same terms every time, in every location.",
      emphasisWord: "on the same terms every time",
    },
    facts: [
      { _key: "f1", label: "Where", value: "Milan, Monza, Cernusco sul Naviglio, online — the same fee everywhere." },
      { _key: "f2", label: "First session", value: "A complete session, at the ordinary fee." },
      { _key: "f3", label: "Payment", value: "Cash, bank transfer or card, at the end of the session. Receipt always issued." },
      { _key: "f4", label: "Deduction", value: "19% as a medical expense, for traceable payments." },
    ],
  };

  for (const doc of [IT, EN]) {
    await client
      .patch(doc.docId)
      .set({
        title: doc.title,
        body: doc.body,
        servicesIntro: doc.servicesIntro,
        services: doc.services,
        darkBand: doc.darkBand,
        facts: doc.facts,
      })
      .commit();
    console.log(`${doc.docId}: content set`);
  }
}

main();
