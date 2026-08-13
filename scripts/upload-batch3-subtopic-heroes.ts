import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

// Batch 3 hero images — the fourteen subtopics from panic/sessuali/stress/
// relazioni-difficili/coppia/trauma. One asset per topic, reused across the
// it/en document pair (same "one asset, two references" pattern as every
// prior subtopic hero pass, confirmed live before writing this script).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const topics = [
  {
    file: "Attacchi-di-panico-notturni.jpg",
    docIt: "subtopicPage-panico-notturno-it",
    docEn: "subtopicPage-panico-notturno-en",
    altIt: "Camera da letto illuminata da una luce calda al tramonto, con un letto disfatto e piante sul davanzale.",
    altEn: "Bedroom lit by warm sunset light, with an unmade bed and plants on the windowsill.",
  },
  {
    file: "Paura-di-perdere-il-controllo.jpg",
    docIt: "subtopicPage-perdere-controllo-it",
    docEn: "subtopicPage-perdere-controllo-en",
    altIt: "Una persona di spalle che cammina in un corridoio, con lunghe strisce d'ombra sul pavimento.",
    altEn: "A person seen from behind walking down a corridor, with long shadow stripes across the floor.",
  },
  {
    file: "Eiaculazione-precoce.jpg",
    docIt: "subtopicPage-eiaculazione-it",
    docEn: "subtopicPage-eiaculazione-en",
    altIt: "Comodino con una lampada accesa e una sveglia rotonda, accanto a un letto in una stanza dalle pareti verde scuro.",
    altEn: "Nightstand with a lit lamp and a round alarm clock, beside a bed in a dark green room.",
  },
  {
    file: "Calo-del-desiderio.jpg",
    docIt: "subtopicPage-desiderio-it",
    docEn: "subtopicPage-desiderio-en",
    altIt: "Una coppia sdraiata a letto, ciascuno con un tablet in mano davanti al viso.",
    altEn: "A couple lying in bed, each holding a tablet in front of their face.",
  },
  {
    file: "Dolore-durante-i-rapporti.jpg",
    docIt: "subtopicPage-dolore-rapporti-it",
    docEn: "subtopicPage-dolore-rapporti-en",
    altIt: "Una donna vista di spalle mentre guarda fuori da una finestra, scostando una tenda leggera.",
    altEn: "A woman seen from behind looking out of a window, holding back a sheer curtain.",
  },
  {
    file: "Burnout-lavorativo.jpg",
    docIt: "subtopicPage-burnout-it",
    docEn: "subtopicPage-burnout-en",
    altIt: "Una persona cammina in un sottopassaggio illuminato, con un leggero effetto di movimento.",
    altEn: "A person walking through a lit underground passage, with a slight motion blur.",
  },
  {
    file: "Stress-e-sintomi-fisici.jpg",
    docIt: "subtopicPage-sintomi-stress-it",
    docEn: "subtopicPage-sintomi-stress-en",
    altIt: "Una donna seduta su un bancone di cucina, ginocchia strette al petto, con una tazza in mano.",
    altEn: "A woman sitting on a kitchen counter, knees drawn to her chest, holding a mug.",
  },
  {
    file: "Dipendenza-affettiva.jpg",
    docIt: "subtopicPage-dipendenza-it",
    docEn: "subtopicPage-dipendenza-en",
    altIt: "Primo piano di uno smartphone con cover rosa su una superficie color lavanda.",
    altEn: "Close-up of a smartphone in a pink case on a lavender surface.",
  },
  {
    file: "Difficoltà-a-dire-di-no.jpg",
    docIt: "subtopicPage-dire-no-it",
    docEn: "subtopicPage-dire-no-en",
    altIt: "Una scrivania ingombra di fogli, cartelle e appunti, con un computer acceso sullo sfondo.",
    altEn: "A desk cluttered with papers, folders and notes, with a computer screen glowing in the background.",
  },
  {
    file: "Dopo-un-tradimento.jpg",
    docIt: "subtopicPage-tradimento-it",
    docEn: "subtopicPage-tradimento-en",
    altIt: "Una donna seduta sul bordo del letto, pensierosa, con lo sguardo rivolto altrove.",
    altEn: "A woman sitting on the edge of a bed, pensive, looking away.",
  },
  {
    file: "Comunicazione-nella-coppia.jpg",
    docIt: "subtopicPage-comunicazione-it",
    docEn: "subtopicPage-comunicazione-en",
    altIt: "Vista dall'alto di due persone che mangiano una zuppa insieme a una tavola apparecchiata.",
    altEn: "Overhead view of two people eating soup together at a set table.",
  },
  {
    file: "Trauma-infantile.jpg",
    docIt: "subtopicPage-trauma-infantile-it",
    docEn: "subtopicPage-trauma-infantile-en",
    altIt: "Mani che sfogliano un album di vecchie fotografie di famiglia in bianco e nero.",
    altEn: "Hands leafing through an album of old black-and-white family photographs.",
  },
  {
    file: "Lutto-e-perdita.jpg",
    docIt: "subtopicPage-lutto-it",
    docEn: "subtopicPage-lutto-en",
    altIt: "Una panchina bianca vuota sotto un albero, illuminata da una luce calda.",
    altEn: "An empty white bench under a tree, lit by warm light.",
  },
  {
    file: "Trauma-relazionale.jpg",
    docIt: "subtopicPage-trauma-relazionale-it",
    docEn: "subtopicPage-trauma-relazionale-en",
    altIt: "Due porte bianche socchiuse che si aprono su una stanza luminosa e spoglia.",
    altEn: "Two white doors ajar, opening onto a bright, sparse room.",
  },
];

async function main() {
  for (const topic of topics) {
    const filePath = path.join("contents", topic.file);
    const buffer = fs.readFileSync(filePath);
    const asset = await client.assets.upload("image", buffer, { filename: topic.file });
    console.log(
      `${topic.file} -> ${asset._id} (${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height})`,
    );

    await client
      .patch(topic.docIt)
      .set({
        heroImage: { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: topic.altIt },
      })
      .commit();
    console.log(`  ${topic.docIt} patched`);

    await client
      .patch(topic.docEn)
      .set({
        heroImage: { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: topic.altEn },
      })
      .commit();
    console.log(`  ${topic.docEn} patched`);
  }
  console.log("All 14 topics uploaded and attached.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
