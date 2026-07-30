import { createClient } from "@sanity/client";

// Credentials band, three-level pass — adds the new per-cell description
// sentence (homePage.ts's credentialsBand.*Description fields). Dot-path
// keys only, same discipline as every other patch script in this repo.
//
// DRAFT — NOT APPROVED. §9 checked via the actual deontologyCheck validator
// for IT (all four pass); EN checked by hand against the same categories.
//
// Date-arithmetic check ("Dal 2013" / "Since 2013"): 13 years of clinical
// practice, counted back from the current year, lands on 2013 — checked
// against the confirmed qualification dates (Bicocca Laurea 2011,
// Maastricht M.Sc. 2013, SLOP specialization 2020) for a hard contradiction,
// not just plausibility. No contradiction found: Bicocca (2011, the
// bachelor's-level Laurea, L-24) precedes it, Maastricht's M.Sc. lands the
// same year, and SLOP's later psychotherapy specialization (2020, which in
// Italy requires already being a registered, practicing Psicologo before
// enrolling) follows it — a tight but internally consistent sequence.
// IMPORTANT CAVEAT, reported rather than silently resolved: 2013 is DERIVED
// (current year minus the existing "13" figure), not an independently
// confirmed registration/practice-start date from any other record in this
// project — the "13" figure's own anchor year was never separately
// established. Proceeding with the client-provided copy as instructed,
// since there's no actual conflict, but flagging the derivation itself so
// it can be verified against Giuseppe's real Albo registration date before
// this ships.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary write-scoped " +
      "token in the Sanity dashboard (API → Tokens → Add API token, " +
      '"Editor" permission), set it in .env.local, run this script, ' +
      "then delete the token again.",
  );
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-07-05",
  useCdn: false,
});

const IT_PATCH = {
  "credentialsBand.clinicalPracticeDescription":
    "Dal 2013, tra studio privato e formazione continua.",
  "credentialsBand.trainingDescription":
    "Laurea, master e specializzazione, senza mai smettere di aggiornarmi.",
  "credentialsBand.locationsDescription":
    "Milano Citylife e Bicocca, Monza, Cernusco sul Naviglio.",
  "credentialsBand.languagesDescription":
    "Percorsi disponibili in entrambe le lingue, di persona o a distanza.",
};

const EN_PATCH = {
  "credentialsBand.clinicalPracticeDescription":
    "Since 2013, between private practice and ongoing training.",
  "credentialsBand.trainingDescription":
    "Degree, master's, and specialization — I've never stopped keeping up to date.",
  "credentialsBand.locationsDescription":
    "Milan Citylife and Bicocca, Monza, Cernusco sul Naviglio.",
  "credentialsBand.languagesDescription":
    "Available in both languages, in person or remotely.",
};

async function getFields(id: string) {
  return client.fetch(
    `*[_id == $id][0]{
      "clinicalPracticeDescription": credentialsBand.clinicalPracticeDescription,
      "trainingDescription": credentialsBand.trainingDescription,
      "locationsDescription": credentialsBand.locationsDescription,
      "languagesDescription": credentialsBand.languagesDescription
    }`,
    { id },
  );
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
