import { createClient } from "@sanity/client";

// Additive seed for the new emergencyContacts field (siteSettings.ts) —
// does not touch crisisSupportText or any other field on the document.
// Seeded with the two numbers already present in the existing prose
// (112, Telefono Amico Italia 02 2327 2327), per explicit instruction.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const CONTACTS_BY_LANGUAGE: Record<string, Array<{ _key: string; label: string; number: string }>> = {
  it: [
    { _key: "emergenza-112", label: "Numero unico di emergenza", number: "112" },
    { _key: "telefono-amico", label: "Telefono Amico Italia", number: "02 2327 2327" },
  ],
  en: [
    { _key: "emergenza-112", label: "Single European emergency number", number: "112" },
    { _key: "telefono-amico", label: "Telefono Amico Italia", number: "02 2327 2327" },
  ],
};

async function main() {
  const docs: Array<{ _id: string; language: string }> = await client.fetch(
    `*[_type == "siteSettings"]{ _id, language }`
  );
  console.log("Found siteSettings docs:", JSON.stringify(docs));

  for (const doc of docs) {
    const contacts = CONTACTS_BY_LANGUAGE[doc.language];
    if (!contacts) {
      console.log(`SKIP ${doc._id}: no contacts defined for language "${doc.language}"`);
      continue;
    }

    const before = await client.fetch(`*[_id == $id][0]{ _id, language, crisisSupportText, emergencyContacts }`, {
      id: doc._id,
    });
    console.log(`BEFORE ${doc._id}:`, JSON.stringify(before));

    await client.patch(doc._id).set({ emergencyContacts: contacts }).commit();

    const after = await client.fetch(`*[_id == $id][0]{ _id, language, crisisSupportText, emergencyContacts }`, {
      id: doc._id,
    });
    console.log(`AFTER  ${doc._id}:`, JSON.stringify(after));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
