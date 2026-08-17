import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

// Chi sono hero photo swap — replaces the portrait field only (kicker/
// title/paragraphs/pullQuote/signatureEnabled/etc. all untouched, unlike
// patch-chi-sono-section.ts's own original seed, which set the whole
// document). Uploads docs/images/09.jpg (the 5000x3336 master export,
// same aspect as the already-optimized public/design-lab/photos/09.webp
// already serving as the contact-block photo sitewide) rather than
// re-uploading that derivative — Sanity's own image CDN gets the
// highest-resolution source to work from, matching PillarHero.tsx's own
// "never upscale" discipline. Idempotent by originalFilename, same
// pattern as patch-chi-sono-section.ts's own uploadPublicImage.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function uploadImageIfNeeded(absolutePath: string, filename: string): Promise<string> {
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
    { filename },
  );
  if (existing?._id) return existing._id;

  const buffer = fs.readFileSync(absolutePath);
  const asset = await client.assets.upload("image", buffer, { filename, contentType: "image/jpeg" });
  return asset._id;
}

const ALT = {
  it: "Giuseppe Iannone, psicoterapeuta",
  en: "Giuseppe Iannone, psychotherapist",
};

async function main() {
  // Real bug found live, not assumed: "09.jpg" already existed in this
  // dataset (created 2026-07-12, an unrelated 1000x667/45KB asset with
  // no connection to this file) — the idempotent-by-originalFilename
  // lookup matched it purely on the filename string and silently reused
  // it instead of uploading the real 5000x3336 source, since filenames
  // this generic aren't actually unique across a large content
  // ecosystem. A distinctive filename avoids the same collision here.
  const filePath = path.join(process.cwd(), "docs/images/09.jpg");
  const assetId = await uploadImageIfNeeded(filePath, "chi-sono-portrait-09-open-palms.jpg");
  console.log("portrait asset id:", assetId);

  for (const locale of ["it", "en"] as const) {
    const id = `chiSonoSection-${locale}`;

    const before = await client.fetch<{ portrait?: unknown }>(`*[_id == $id][0]{portrait}`, { id });
    console.log(`BEFORE ${id}:`, JSON.stringify(before));

    await client
      .patch(id)
      .set({
        portrait: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
          alt: ALT[locale],
        },
      })
      .commit();

    const after = await client.fetch<{ portrait?: unknown }>(`*[_id == $id][0]{portrait}`, { id });
    console.log(`AFTER  ${id}:`, JSON.stringify(after));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
