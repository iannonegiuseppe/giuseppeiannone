import { createClient } from "@sanity/client";

// Sedi + photo strip light-surface pass — sets the NEW, /design-lab-only
// field groups (homePage.sediLab, homePage.spaziLab) added this pass.
// Does NOT touch homePage.sedi (shared, live on production) or any `sede`
// document (onlineLine etc.) — see this pass's own report for why.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN.");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const IT_PATCH = {
  sediLab: {
    kicker: "DOVE CI INCONTRIAMO",
    heading: "Le sedute, in studio o online.",
    headingEmphasisWord: "online",
    intro:
      "Ricevo in due studi a Milano, Citylife e Bicocca, e poi a Monza e a Cernusco sul Naviglio. Gli incontri online hanno la stessa durata e lo stesso costo di quelli in studio. Lavoro in italiano e in inglese.",
    onlineSubLine: "Stessa durata, stesso costo.",
  },
  spaziLab: {
    kicker: "GLI SPAZI",
    heading: "Le stanze, prima di arrivarci.",
    headingEmphasisWord: "arrivarci",
    introLine: "Le foto sono degli studi in cui ricevo, scattate da me.",
  },
};

const EN_PATCH = {
  sediLab: {
    kicker: "WHERE WE MEET",
    heading: "Sessions, in person or online.",
    headingEmphasisWord: "online",
    intro:
      "I work from two practices in Milan — Citylife and Bicocca — and from Monza and Cernusco sul Naviglio. Online sessions run the same length and cost the same as those in person. I work in Italian and in English.",
    onlineSubLine: "Same length, same fee.",
  },
  spaziLab: {
    kicker: "THE ROOMS",
    heading: "The rooms, before you arrive.",
    headingEmphasisWord: "arrive",
    introLine: "These are the practices where I work. Photographs taken by me.",
  },
};

async function getFields(id: string) {
  return client.fetch(`*[_id == $id][0]{ sediLab, spaziLab }`, { id });
}

async function patchDoc(id: string, patch: Record<string, unknown>) {
  const before = await getFields(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));
  await client.patch(id).set(patch).commit();
  const after = await getFields(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("homePage-it", IT_PATCH);
  await patchDoc("homePage-en", EN_PATCH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
