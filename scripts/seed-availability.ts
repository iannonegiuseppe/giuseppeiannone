import { createClient } from "@sanity/client";

// Availability-badge pass: one-off patch seeding the new
// availabilityStatus/acceptingText/waitlistText/pausedText fields onto the
// existing siteSettings-it document (see src/sanity/schemaTypes/documents/
// siteSettings.ts) with the spec's own default values — these fields
// didn't exist when siteSettings-it was first created, so the schema's
// initialValue (which only applies to documents created fresh through
// Studio) never reached it. setIfMissing rather than set: safe to re-run,
// and won't clobber a value the owner has already edited in Studio.
//
// IT ONLY, matching this project's own "no EN counterpart" pattern
// already used elsewhere in scripts/seed.ts for homepage-adjacent content
// (the homepage itself EN-redirects to IT — see src/app/[locale]/page.tsx's
// own "TEMPORARY EN GATE" comment) — siteSettings-en's own copy of these
// fields is left EMPTY here, not filled with this Italian text. That's a
// safe, already-documented fallback (AvailabilityBadge renders nothing
// when the active status has no text), not a bug — but it does mean
// siteSettings-en will show Studio validation errors on its NEXT save
// (Rule.required() on new fields doesn't retroactively invalidate an
// already-published document, only blocks new saves) until the owner adds
// English text for its own Header/ChannelPickerDialog placement.
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

async function main() {
  await client
    .patch("siteSettings-it")
    .setIfMissing({
      availabilityStatus: "accepting",
      acceptingText: "Attualmente accolgo nuovi pazienti.",
      waitlistText: "Nuovi percorsi da [segnaposto — periodo]: scrivimi per riservare un posto.",
      pausedText: "Al momento non accolgo nuovi pazienti.",
    })
    .commit();
  console.log("siteSettings-it: availability defaults seeded (setIfMissing).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
