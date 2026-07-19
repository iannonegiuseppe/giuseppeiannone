import { createClient } from "@sanity/client";

// Header CTA / hero alignment pass: targeted patch, NOT a reseed — same
// discipline as patch-hero-copy.ts/patch-recognition-copy.ts/
// patch-hope-copy.ts. Only headerSettings.ctaButtonText is set (a single
// top-level field on this document — navItems is left completely
// untouched by this .set()).
//
// The header CTA previously read "Prenota un primo colloquio" (IT) /
// "Book a first consultation" (EN) while the hero CTA reads "Inizia il
// percorso" — two different labels for the same primary action. This
// patch aligns the header to the hero's own wording.
//
// EN note: the homePage-en hero's own ctaLabel currently resolves to the
// literal Italian "Inizia il percorso" too (confirmed live, not a typo
// here) — homePage-en has no dedicated seed block in scripts/seed.ts, so
// it appears to have been created via document-internationalization's
// duplicate action and never had its hero re-translated. This patch
// matches the header to what the hero ACTUALLY renders today, per this
// pass's own instruction not to invent a different English string — the
// underlying hero-en translation gap is a separate, pre-existing issue,
// left unfixed here.
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

const PATCHES: Record<string, string> = {
  "headerSettings-it": "Inizia il percorso",
  "headerSettings-en": "Inizia il percorso",
};

async function getCta(id: string) {
  return client.fetch(`*[_id == $id][0]{ ctaButtonText }`, { id });
}

async function main() {
  for (const [id, ctaButtonText] of Object.entries(PATCHES)) {
    const before = await getCta(id);
    console.log(`BEFORE ${id}:`, JSON.stringify(before));

    await client.patch(id).set({ ctaButtonText }).commit();

    const after = await getCta(id);
    console.log(`AFTER  ${id}:`, JSON.stringify(after));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
