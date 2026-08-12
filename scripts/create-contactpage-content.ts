import { createClient } from "@sanity/client";

// Contatti build pass — creates the two contactPage documents from scratch
// (schema had zero documents before this pass, per contactPage.ts's own
// comment). createIfNotExists, not createOrReplace: idempotent, and this
// script is a first-time creation, not a patch of existing content — see
// migrate-wordpress-articles.ts's own established "createIfNotExists +
// patch.set" convention for why that's the safer default here. Copy is
// verbatim from the approved brief, not rephrased. seo.noIndex stays true
// and metaTitle/metaDescription are clearly marked placeholders — both
// awaiting the owner's own review before the page is indexed.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  await client.createIfNotExists({
    _id: "contactPage-it",
    _type: "contactPage",
    language: "it",
    kicker: "Contatti",
    title: "Il modo più semplice per iniziare",
    titleEmphasisWord: "iniziare",
    intro: "Scegli il canale che ti è più comodo. Rispondo personalmente, di solito entro 24 ore.",
    whatsapp: {
      label: "Canale principale",
      title: "WhatsApp",
      body: "Il modo più veloce per scrivermi. Anche solo un messaggio, per capire se posso esserti utile.",
      cta: "Apri WhatsApp",
    },
    phone: {
      label: "Telefono",
      title: "Chiamami",
      body: "Se preferisci sentire una voce prima di scrivere.",
    },
    email: {
      label: "Email",
      title: "Scrivimi",
      body: "Per raccontare con più calma quello che sta succedendo.",
    },
    hours: {
      label: "Orari",
      value: "Lunedì–venerdì, 8:00–21:00",
      note: "Sabato e domenica chiuso",
    },
    appointments: {
      label: "Appuntamenti",
      value: "Su richiesta",
      note: "Rispondo entro 24 ore",
    },
    sediKicker: "Le sedi",
    sediHeading: "Quattro studi, e la videochiamata",
    online: {
      title: "Incontri online",
      body: "Stessa durata e stessa tariffa degli incontri in studio, su piattaforma riservata. Da dove preferisci.",
    },
    seo: {
      metaTitle: "[placeholder — da rivedere] Contatti | Giuseppe Iannone",
      metaDescription: "[placeholder — da rivedere] Scrivi, chiama o vieni in uno degli studi di Giuseppe Iannone.",
      noIndex: true,
    },
  });
  console.log("contactPage-it created (or already existed)");

  await client.createIfNotExists({
    _id: "contactPage-en",
    _type: "contactPage",
    language: "en",
    kicker: "Contact",
    title: "The simplest way to start",
    titleEmphasisWord: "start",
    intro: "Choose whichever channel suits you. I reply personally, usually within 24 hours.",
    whatsapp: {
      label: "Main channel",
      title: "WhatsApp",
      body: "The quickest way to reach me. Even just a message, to see whether I can be of help.",
      cta: "Open WhatsApp",
    },
    phone: {
      label: "Phone",
      title: "Call me",
      body: "If you would rather hear a voice before writing.",
    },
    email: {
      label: "Email",
      title: "Write to me",
      body: "To explain more calmly what is going on.",
    },
    hours: {
      label: "Hours",
      value: "Monday to Friday, 8:00–21:00",
      note: "Closed Saturday and Sunday",
    },
    appointments: {
      label: "Appointments",
      value: "On request",
      note: "I reply within 24 hours",
    },
    sediKicker: "Locations",
    sediHeading: "Four studios, and video calls",
    online: {
      title: "Online sessions",
      body: "Same length and same fee as sessions in the studio, on a private platform. From wherever you prefer.",
    },
    seo: {
      metaTitle: "[placeholder — needs review] Contact | Giuseppe Iannone",
      metaDescription: "[placeholder — needs review] Write, call, or visit one of Giuseppe Iannone's studios.",
      noIndex: true,
    },
  });
  console.log("contactPage-en created (or already existed)");
}

main();
