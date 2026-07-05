import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-07-05",
  // Relies on Next.js's own fetch cache + revalidateTag for freshness
  // instead of Sanity's CDN cache.
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});
