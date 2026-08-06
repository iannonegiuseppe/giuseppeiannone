import { createClient } from "@sanity/client";

// Chi sono opening pass (pass 1 of 4) — writes heroStandfirst/
// heroLocations/whatIWorkWith/howIWork on the existing chiSonoSection
// documents. createIfNotExists + patch.set on fields that don't touch
// kicker/title/titleEmphasisWord/paragraphs/pullQuote/portrait/
// storyLink/signatureEnabled/seo/language — none of those are written
// here, all untouched.
//
// Two approved edits applied against the source draft
// (contents/chi-sono-sezioni-apertura.md):
// 1) Couples therapy added to whatIWorkWith.intro's second paragraph,
//    after "difficoltà nelle relazioni" (IT) / "difficulties in
//    relationships" (EN) — the draft predates Giuseppe's confirmation
//    that he sees couples.
// 2) "Non do consigli su cosa fare della propria vita." / "I don't
//    advise people on what to do with their lives." removed from
//    howIWork's "Cosa non faccio" / "What I don't do" part — the
//    broader form of the stay-or-leave line already removed from the
//    relationships pillar. The paragraph simply starts one sentence
//    later; nothing replaces it.
//
// "Fra un incontro e l'altro" / "Between sessions" is genuinely
// bracketed and empty in the draft — omitted from both locales' `parts`
// arrays entirely (IT: 4 parts, EN: 5 — EN's own "Working in English"
// has no IT counterpart, same as several pillar pages already).
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

async function main() {
  await patchDoc("chiSonoSection-it", {
    heroStandfirst:
      "Psicologo psicoterapeuta. Mi occupo di ansia e attacchi di panico — e ci sono arrivato passandoci.",
    heroLocations: "Milano, Monza, Cernusco sul Naviglio",
    whatIWorkWith: {
      kicker: "DI COSA MI OCCUPO",
      heading: "Se sei qui, probabilmente è per una di queste cose",
      intro: [
        "Lavoro con l'ansia e con gli attacchi di panico, e con le difficoltà che gli si costruiscono intorno: l'agorafobia, la claustrofobia, l'ansia sociale, la preoccupazione per la salute, l'insonnia che arriva quando la testa non si ferma.",
        "Lavoro anche con lo stress prolungato e il burnout, con le difficoltà nelle relazioni, con la terapia di coppia e con le disfunzioni sessuali — che nella maggior parte dei casi hanno una componente ansiosa riconoscibile, anche quando non sembra.",
        "E lavoro con il trauma: quello che ha una data e quello che non ce l'ha.",
        "Non mi occupo di tutto il resto. Non è una limitazione di cui mi scuso: è una scelta. Ai disturbi d'ansia ho dedicato la formazione, la ricerca e la pratica clinica, e continuo a occuparmi soltanto di quello.",
      ],
      closingLine: "Non sono un tuttologo — e lo considero un punto di forza.",
    },
    howIWork: {
      kicker: "COME LAVORO",
      heading: "Cosa succede, concretamente",
      intro:
        "Molte persone arrivano senza sapere cosa aspettarsi. È ragionevole: della psicoterapia si parla molto e si racconta poco.",
      parts: [
        {
          title: "Il primo incontro",
          body: [
            "Dura quarantacinque minuti. Mi racconti cosa succede — da quanto, in quali situazioni, cosa hai già provato a fare. Non è un test e non richiede di aver già capito qualcosa: le domande le faccio io.",
            "Serve a due cose: capire di cosa stiamo parlando, e valutare insieme se e come proseguire. Non comporta impegno a continuare, e non è raro che si concluda con l'indicazione di rivolgersi a qualcun altro, se quello che serve non è quello che faccio.",
          ],
        },
        {
          title: "Gli incontri successivi",
          body: [
            "Di solito settimanali, all'inizio. Il ritmo si valuta insieme e cambia nel tempo.",
            "Il lavoro procede su due binari che si intrecciano. Uno è capire il meccanismo: non l'ansia in generale, ma la tua — quali situazioni la attivano, quali interpretazioni la alimentano, quali strategie la stanno mantenendo senza che tu te ne accorga. Molte persone scoprono qui che quello che facevano per gestirla era parte di ciò che la teneva viva.",
            "L'altro è il lavoro sulle situazioni concrete: ricostruire margine dove il campo si era ristretto, gradualmente e d'accordo. Mai partendo da quella più difficile, e mai da soli.",
          ],
        },
        {
          title: "Il corpo",
          body: [
            "Nell'ansia il corpo arriva prima del pensiero. Il respiro, l'attenzione ai segnali corporei, il modo in cui si reagisce a un battito accelerato: sono cose su cui si può lavorare direttamente, e spesso sono il punto da cui si comincia.",
            "Non è un accessorio del percorso. È il motivo per cui ho studiato neuroscienze prima di diventare psicoterapeuta.",
          ],
        },
        {
          title: "Cosa non faccio",
          body: [
            "Non sono un medico e non prescrivo farmaci. Quando una terapia farmacologica è già in corso, o quando emerge che potrebbe essere utile valutarla, lavoro in raccordo con il medico curante o lo psichiatra.",
            "Il lavoro serve a rendere le decisioni più chiare, non a prenderle al posto di chi le deve prendere.",
            "E non prometto tempi. Quanto dura un percorso dipende da cosa lo ha portato, e chi lo sa in anticipo sta dicendo qualcosa che non può sapere.",
          ],
        },
      ],
    },
  });

  await patchDoc("chiSonoSection-en", {
    heroStandfirst:
      "Psychologist and psychotherapist. I work with anxiety and panic attacks — and I came to this by going through it.",
    heroLocations: "Milan, Monza, Cernusco sul Naviglio",
    whatIWorkWith: {
      kicker: "WHAT I WORK WITH",
      heading: "If you're here, it's probably one of these",
      intro: [
        "I work with anxiety and panic attacks, and with the difficulties that build up around them: agoraphobia, claustrophobia, social anxiety, health worry, the insomnia that arrives when your head won't stop.",
        "I also work with prolonged stress and burnout, with difficulties in relationships, with couples therapy, and with sexual difficulties — which in most cases have a recognisable anxiety component, even when it doesn't look that way.",
        "And I work with trauma: the kind that has a date, and the kind that doesn't.",
        "I don't work with everything else. That isn't a limitation I apologise for: it's a choice. Anxiety disorders are what I trained in, researched, and practise, and they remain the only thing I take on.",
      ],
      closingLine: "I'm not a jack-of-all-trades — and I consider that a strength.",
    },
    howIWork: {
      kicker: "HOW I WORK",
      heading: "What actually happens",
      intro:
        "Many people arrive without knowing what to expect. That's reasonable: psychotherapy gets talked about a great deal and described very little.",
      parts: [
        {
          title: "The first session",
          body: [
            "Forty-five minutes. You tell me what's happening — how long, in what situations, what you've already tried. It isn't a test and it doesn't require having worked anything out beforehand: I ask the questions.",
            "It's there for two things: to understand what we're dealing with, and to work out together whether and how to continue. It doesn't commit you to carrying on, and it isn't unusual for it to end with a recommendation to see someone else, if what you need isn't what I do.",
          ],
        },
        {
          title: "The sessions after that",
          body: [
            "Usually weekly, at first. The rhythm is assessed together and changes over time.",
            "The work runs on two tracks that interweave. One is understanding the mechanism: not anxiety in general, but yours — which situations set it off, which interpretations feed it, which strategies are maintaining it without your noticing. Many people discover here that what they were doing to manage it was part of what kept it alive.",
            "The other is working on concrete situations: rebuilding room where the field had narrowed, gradually and by agreement. Never starting from the hardest one, and never alone.",
          ],
        },
        {
          title: "The body",
          body: [
            "In anxiety the body arrives before the thought. Breathing, attention to bodily signals, how you respond to a racing heart — these can be worked on directly, and they're often where we start.",
            "It isn't an accessory to the work. It's why I studied neuroscience before becoming a psychotherapist.",
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
            "The work is there to make decisions clearer, not to make them on someone's behalf.",
            "And I don't promise timeframes. How long a course of work takes depends on what brought it, and anyone who knows in advance is telling you something they can't know.",
          ],
        },
      ],
    },
  });

  console.log("\n=== chi sono opening pass: done ===");
}

main();
