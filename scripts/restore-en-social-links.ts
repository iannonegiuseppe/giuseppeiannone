import { createClient } from "@sanity/client";

// Footer social-icon diagnosis — the icon row (Footer.tsx/FooterLab.tsx)
// itself has no bug: it correctly renders exactly what's set on each
// locale's own siteSettings.socialLinks (verified live — filters strictly
// on truthy values, same fixed display order regardless of which fields
// are filled, unchanged since it was introduced in ec504cc). Checked git
// history for siteSettings.ts: the socialLinks field shape has been
// additive-only since that commit, no later pass renamed/removed a field
// that could have orphaned existing EN data.
//
// siteSettings uses @sanity/document-internationalization — it/en are
// separate documents, and Sanity does not mirror field values between
// language variants automatically. Querying both documents directly
// found: siteSettings-it has all five URLs; siteSettings-en has only
// whatsapp. Since a business's Instagram/Facebook/YouTube/LinkedIn
// accounts don't differ by site language, this is a content gap (the EN
// document's matching fields were simply never filled in), not a code
// regression — the four missing icons were never populated for EN, they
// didn't "disappear". Restoring them by copying the IT document's own
// values (the same real-world accounts) rather than a schema/code change.
// Idempotent: skips a field that's already set.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function main() {
  const [it, en] = await Promise.all([
    client.fetch<{ socialLinks?: Record<string, string> } | null>(
      `*[_id == "siteSettings-it"][0]{socialLinks}`,
    ),
    client.fetch<{ socialLinks?: Record<string, string> } | null>(
      `*[_id == "siteSettings-en"][0]{socialLinks}`,
    ),
  ]);

  if (!it?.socialLinks) {
    console.log("siteSettings-it has no socialLinks — nothing to copy from, stopping.");
    return;
  }

  const keys = ["instagram", "whatsapp", "facebook", "youtube", "linkedin"] as const;
  const patch: Record<string, string> = {};
  for (const key of keys) {
    const itValue = it.socialLinks[key];
    const enValue = en?.socialLinks?.[key];
    if (itValue && !enValue) {
      patch[`socialLinks.${key}`] = itValue;
    }
  }

  if (Object.keys(patch).length === 0) {
    console.log("siteSettings-en: already matches siteSettings-it, nothing to do (idempotent).");
    return;
  }

  console.log("siteSettings-en: setting", JSON.stringify(patch, null, 2));
  await client.patch("siteSettings-en").set(patch).commit();
  console.log("siteSettings-en: done");
}

main();
