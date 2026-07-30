import { createClient } from "@sanity/client";

// Light-island pass — replaces ctaBridgeSection.body's [segnaposto]/
// [placeholder] marker with real copy. title/titleEmphasis/linkLabel are
// UNCHANGED (this pass's own brief: heading stays as-is). "Rispondo
// entro 24 ore" is a commitment the client explicitly confirmed he can
// keep, per this pass's own instruction — not a generic promise.
//
// DRAFT — NOT APPROVED. §9 checked via the actual deontologyCheck
// validator for IT (passes — see this pass's own report). EN checked by
// hand.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}
if (!token) {
  throw new Error(
    "Missing SANITY_API_WRITE_TOKEN. Create a temporary write-scoped token in the Sanity " +
      'dashboard (API -> Tokens -> Add API token, "Editor" permission), set it in ' +
      ".env.local, run this script, then delete the token again.",
  );
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const IT_BODY =
  "Il primo passo è solo un messaggio. Da lì capiamo insieme cosa può essere utile, senza impegno a proseguire. Rispondo entro 24 ore.";

const EN_BODY =
  "The first step is just a message. From there, we figure out together what might help, with no obligation to continue. I reply within 24 hours.";

async function getBody(id: string) {
  return client.fetch(`*[_id == $id][0]{ body }`, { id });
}

async function patchDoc(id: string, body: string) {
  const before = await getBody(id);
  console.log(`\n=== ${id} BEFORE ===`, JSON.stringify(before, null, 2));

  await client.patch(id).set({ body }).commit();

  const after = await getBody(id);
  console.log(`=== ${id} AFTER ===`, JSON.stringify(after, null, 2));
}

async function main() {
  await patchDoc("ctaBridgeSection-it", IT_BODY);
  await patchDoc("ctaBridgeSection-en", EN_BODY);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
