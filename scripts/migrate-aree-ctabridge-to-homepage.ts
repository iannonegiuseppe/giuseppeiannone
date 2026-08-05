import { createClient } from "@sanity/client";

// Homepage-fold pass — copies areeSection/ctaBridgeSection's content
// into homePage.aree / homePage.ctaBridge (the new field groups added in
// homePage.ts this same pass). Additive only: patch.set on exactly
// `aree`/`ctaBridge`, never createOrReplace, never touches the source
// documents (areeSection/ctaBridgeSection keep their own data, orphaned
// but intact — see structure.ts's own comment once they're hidden).
// Idempotent: safe to re-run, always copies the CURRENT source value.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

interface AreeSectionDoc {
  kicker?: string;
  title?: string;
  intro?: string;
}

interface CtaBridgeSectionDoc {
  title?: string;
  titleEmphasis?: string;
  body?: string;
  linkLabel?: string;
}

async function migrateLocale(language: "it" | "en") {
  const homePageId = `homePage-${language}`;
  const areeSectionId = `areeSection-${language}`;
  const ctaBridgeSectionId = `ctaBridgeSection-${language}`;

  const [source, before] = await Promise.all([
    client.fetch<{ aree: AreeSectionDoc | null; ctaBridge: CtaBridgeSectionDoc | null }>(
      `{
        "aree": *[_id == $areeSectionId][0]{kicker, title, intro},
        "ctaBridge": *[_id == $ctaBridgeSectionId][0]{title, titleEmphasis, body, linkLabel}
      }`,
      { areeSectionId, ctaBridgeSectionId },
    ),
    client.fetch<{ aree: unknown; ctaBridge: unknown }>(`*[_id == $homePageId][0]{aree, ctaBridge}`, {
      homePageId,
    }),
  ]);

  console.log(`\n=== ${language.toUpperCase()} ===`);
  console.log(`BEFORE homePage-${language}.aree:`, JSON.stringify(before?.aree ?? null));
  console.log(`BEFORE homePage-${language}.ctaBridge:`, JSON.stringify(before?.ctaBridge ?? null));
  console.log(`SOURCE ${areeSectionId}:`, JSON.stringify(source.aree));
  console.log(`SOURCE ${ctaBridgeSectionId}:`, JSON.stringify(source.ctaBridge));

  if (!source.aree) throw new Error(`${areeSectionId} not found — aborting, no partial write.`);
  if (!source.ctaBridge) throw new Error(`${ctaBridgeSectionId} not found — aborting, no partial write.`);

  await client
    .patch(homePageId)
    .set({
      aree: { kicker: source.aree.kicker, title: source.aree.title, intro: source.aree.intro },
      ctaBridge: {
        title: source.ctaBridge.title,
        titleEmphasis: source.ctaBridge.titleEmphasis,
        body: source.ctaBridge.body,
        linkLabel: source.ctaBridge.linkLabel,
      },
    })
    .commit();

  const after = await client.fetch<{ aree: unknown; ctaBridge: unknown }>(
    `*[_id == $homePageId][0]{aree, ctaBridge}`,
    { homePageId },
  );
  console.log(`AFTER  homePage-${language}.aree:`, JSON.stringify(after?.aree));
  console.log(`AFTER  homePage-${language}.ctaBridge:`, JSON.stringify(after?.ctaBridge));
}

async function main() {
  await migrateLocale("it");
  await migrateLocale("en");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
