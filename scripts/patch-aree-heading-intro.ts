import { createClient } from "@sanity/client";

// Aree refinement pass — replaces areeSection's own heading/intro (the
// old intro carried the last [segnaposto] marker in this section; the six
// area descriptions themselves were already real copy from a prior pass).
// Dot-path .set() on "title"/"intro" only — kicker/previewHover on the
// same document untouched.
//
// DRAFT — NOT APPROVED. §9 checked via the actual deontologyCheck
// validator for IT (both strings pass); EN checked by hand.
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
  title: "Di cosa mi occupo: ansia, panico e stress",
  intro:
    "Lavoro soprattutto con l'ansia e con ciò che spesso la accompagna — attacchi di panico, agorafobia, stress e difficoltà nelle relazioni. Ogni percorso parte da quello che porti tu, non da un protocollo standard.",
};

const EN_PATCH = {
  title: "What I work with: anxiety, panic, and stress",
  intro:
    "I work mainly with anxiety and what often comes with it — panic attacks, agoraphobia, stress, and relationship difficulties. Every path starts from what you bring, not from a standard protocol.",
};

async function getFields(id: string) {
  return client.fetch(`*[_id == $id][0]{ title, intro }`, { id });
}

async function patchDoc(id: string, patch: Record<string, unknown>) {
  const before = await getFields(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));

  await client.patch(id).set(patch).commit();

  const after = await getFields(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("areeSection-it", IT_PATCH);
  await patchDoc("areeSection-en", EN_PATCH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
