import { createClient } from "@sanity/client";

// Real contact/legal data confirmed by the client (Giuseppe), replacing
// placeholder values. Not translatable — identical on both locales,
// except each field's own established display conventions (phone/email
// channel LABELS are what render on screen; VALUES are what hrefs are
// built from — see siteSettings.ts's own contactChannels.value comment).
// Dot-path patches only (never a whole-document/whole-array
// createOrReplace) — this only touches the exact fields listed, nothing
// else on these documents.
//
// Discovered live (not assumed): siteSettings-it.socialLinks.whatsapp
// already held the correct real URL (apparently set by hand in Studio
// previously) — but siteSettings-it/en.contactChannels' own whatsapp
// VALUE (what the footer/header dialog links actually build from) was
// still the placeholder +390000000000, and siteSettings-en.socialLinks
// was entirely null (not just missing whatsapp — the whole object).
// Fixed both here: contactChannels is the single source every wa.me/tel/
// mailto link in the app actually derives from (see whatsappUrl() in
// src/sanity/contact.ts); socialLinks.whatsapp only drives the footer's
// own WhatsApp icon and is set to the same confirmed number for
// consistency, not left to diverge.
//
// PEC is deliberately NOT added anywhere — client decision, not now.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

const WHATSAPP_RAW = "+393391901474"; // tel:/wa.me source value (whatsappUrl() strips non-digits)
const WHATSAPP_URL = "https://wa.me/393391901474"; // pre-built, for the url-typed socialLinks.whatsapp field
const PHONE_DISPLAY = "+39 339 190 1474"; // spaced, readable — what actually renders as the channel label
const EMAIL = "info@giuseppeiannone.it";
const PIVA = "IT 03610780136";
const ALBO_NUMBER = "18949"; // bare number — Footer.tsx's own hardcoded sentence appends "n. {this}"

const ALBO_LINE = {
  it: `Iscritto all'Albo degli Psicologi della Lombardia, n. ${ALBO_NUMBER}`,
  en: `Registered with the Order of Psychologists of Lombardy, no. ${ALBO_NUMBER}`,
};

async function patchSiteSettings(id: string, isSocialLinksNull: boolean) {
  const before = await client.fetch(
    `*[_id == $id][0]{contactChannels, piva, author, socialLinks}`,
    { id },
  );
  console.log(`BEFORE ${id}:`, JSON.stringify(before));

  const patch: Record<string, unknown> = {
    'contactChannels[_key=="channel-whatsapp"].value': WHATSAPP_RAW,
    'contactChannels[_key=="channel-phone"].label': PHONE_DISPLAY,
    'contactChannels[_key=="channel-phone"].value': WHATSAPP_RAW,
    'contactChannels[_key=="channel-email"].label': EMAIL,
    'contactChannels[_key=="channel-email"].value': EMAIL,
    "author.registrationNumber": ALBO_NUMBER,
    piva: PIVA,
  };

  // EN's socialLinks was entirely null (not an object at all) — a
  // dot-path set into a null parent is ambiguous, so the whole field is
  // set instead, with only whatsapp populated (the one value this task
  // actually confirmed; instagram/facebook/linkedin/youtube stay absent
  // rather than guessed — a separate, out-of-scope gap, reported not
  // fixed). IT's socialLinks already exists as a real object, so its
  // whatsapp key is set via the normal dot-path.
  if (isSocialLinksNull) {
    patch.socialLinks = { whatsapp: WHATSAPP_URL };
  } else {
    patch["socialLinks.whatsapp"] = WHATSAPP_URL;
  }

  await client.patch(id).set(patch).commit();

  const after = await client.fetch(
    `*[_id == $id][0]{contactChannels, piva, author, socialLinks}`,
    { id },
  );
  console.log(`AFTER  ${id}:`, JSON.stringify(after));
}

async function patchAlboLine(locale: "it" | "en") {
  const id = `homePage-${locale}`;
  const before = await client.fetch(`*[_id == $id][0]{"alboLine": diplomi.alboLine}`, { id });
  console.log(`BEFORE ${id}:`, JSON.stringify(before));

  await client.patch(id).set({ "diplomi.alboLine": ALBO_LINE[locale] }).commit();

  const after = await client.fetch(`*[_id == $id][0]{"alboLine": diplomi.alboLine}`, { id });
  console.log(`AFTER  ${id}:`, JSON.stringify(after));
}

async function main() {
  await patchSiteSettings("siteSettings-it", false);
  await patchSiteSettings("siteSettings-en", true);
  await patchAlboLine("it");
  await patchAlboLine("en");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
