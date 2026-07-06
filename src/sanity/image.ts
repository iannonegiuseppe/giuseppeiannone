import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image } from "sanity";
import { client } from "./client";

const builder = createImageUrlBuilder(client);

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
