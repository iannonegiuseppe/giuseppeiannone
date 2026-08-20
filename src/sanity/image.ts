import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image } from "sanity";

// Built from {projectId, dataset} directly, not the full Sanity client
// (client.ts) — image CDN URLs are public and deterministic from those two
// values alone, no auth/token needed to construct one. Keeping this file
// free of client.ts's own import (next/headers, server-only) is what lets
// BlogFilterableSection.tsx, a client component, import urlFor/
// imageDimensions for the filtered-view cards it renders from the
// route-handler response — a full client.ts import there breaks the
// client bundle (next/headers is Server-Component-only).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
}

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: Image) {
  return builder.image(source);
}

// Sanity asset refs encode their original pixel dimensions in the id
// itself (e.g. "image-<hash>-800x450-svg") — reading them here avoids a
// second GROQ dereference just to get width/height for next/image's
// required (CLS-safety) props.
const ASSET_REF_DIMENSIONS = /^image-\w+-(\d+)x(\d+)-\w+$/;

export function imageDimensions(
  source: Image,
): { width: number; height: number } | null {
  const ref = source.asset?._ref;
  if (!ref) return null;

  const match = ASSET_REF_DIMENSIONS.exec(ref);
  if (!match) return null;

  const [, widthStr, heightStr] = match;
  if (!widthStr || !heightStr) return null;

  return { width: Number(widthStr), height: Number(heightStr) };
}
