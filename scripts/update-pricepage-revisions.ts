import { createClient } from "@sanity/client";

// /prezzi six-revisions pass — content edits only (title, new
// servicesHeading, duration-only derivedNote rewrites). Verbatim per the
// owner's own instructions where given (title); derivedNote rewrites are
// mine, reported alongside the "before" text so they can be corrected if
// they read oddly.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) throw new Error("Missing Sanity env vars");
const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  await client
    .patch("pricePage-it")
    .set({
      title: "Quanto costa una seduta",
      servicesHeading: "Le quattro modalità di lavoro",
      "services.sexology.derivedNote": "stessa durata della seduta individuale",
      "services.online.derivedNote": "stessa durata della seduta corrispondente in studio",
    })
    .commit();
  console.log("pricePage-it: title, servicesHeading, derivedNote(s) set");

  await client
    .patch("pricePage-en")
    .set({
      title: "What a session costs",
      servicesHeading: "The four ways of working",
      "services.sexology.derivedNote": "same duration as the individual session",
      "services.online.derivedNote": "same duration as the corresponding in-studio session",
    })
    .commit();
  console.log("pricePage-en: title, servicesHeading, derivedNote(s) set");
}

main();
