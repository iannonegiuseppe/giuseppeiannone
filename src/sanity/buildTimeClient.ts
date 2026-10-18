import { createClient } from "@sanity/client";

// Config-time-only Sanity access, shared by every next.config.ts
// redirects() generator (buildTimeRedirects.ts, localeContentRedirects.ts).
//
// Lives in its own module rather than inside one of those: redirects()
// runs before the Next.js app exists (no request context), so it can't
// use src/sanity/client.ts — that file imports next/headers. This uses
// the plain @sanity/client package directly instead, the same way
// scripts/migrate-wordpress-articles.ts already does, so it isn't a new
// dependency, just another call site for one that already resolves.
//
// Keeping it here also keeps the two generators independent of each
// other: the cross-locale pass has nothing to do with the WordPress
// migration, and importing the factory from that module would have
// dragged its frozen 468-slug snapshot into every consumer (and every
// unit test) that only wanted a client.
export function getBuildTimeClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_READ_TOKEN;

  if (!projectId || !dataset) {
    throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET");
  }

  return createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });
}
