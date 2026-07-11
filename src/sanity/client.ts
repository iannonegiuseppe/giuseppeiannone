import { createClient } from "next-sanity";
import { draftMode } from "next/headers";

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

// Separate client, separate (Viewer-scoped) token, used only when draft
// mode is active — never mixed with the published-only client above.
// stega is deliberately only enabled here: it encodes invisible
// steganographic characters into string values so Presentation's
// "Documents on this page" panel and click-to-edit can trace rendered
// text back to its source document/field. Enabling it on the published
// client would leak those characters into real, indexed content.
// studioUrl is a same-origin relative path since Studio is embedded in
// this app at /studio, not a separate deployment.
const previewClient = createClient({
  projectId,
  dataset,
  apiVersion: "2026-07-05",
  useCdn: false,
  token: process.env.SANITY_API_PREVIEW_TOKEN,
  perspective: "drafts",
  stega: { enabled: true, studioUrl: "/studio" },
});

// Single entry point for every page fetch: picks the published (tagged,
// cacheable) client or the draft (uncached) client based on Next's own
// draft-mode state, so "is this request in draft mode" is decided in
// exactly one place. Draft responses use cache: "no-store" — never
// cached, on top of Next.js already rendering the route dynamically
// whenever draftMode().isEnabled is read.
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
): Promise<T> {
  const isDraft = await isDraftModeEnabled();

  if (isDraft) {
    return previewClient.fetch<T>(query, params, { cache: "no-store" });
  }

  return client.fetch<T>(query, params, { next: { tags } });
}

export async function isDraftModeEnabled(): Promise<boolean> {
  const { isEnabled } = await draftMode();
  return isEnabled;
}

// For callers that must never branch on draft mode: generateStaticParams
// (build time, no request exists yet, so draftMode() isn't meaningful) and
// public routes like sitemap.ts (must always reflect published-only
// content, regardless of the requester's own draft-mode cookie). Always
// published, always tagged — tags are a required argument on purpose, so
// an untagged (and therefore never-revalidated) fetch can't be written by
// accident. This and sanityFetch above are the only two places allowed to
// call client.fetch/previewClient.fetch — see CLAUDE.md.
export function sanityFetchPublished<T>(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
): Promise<T> {
  return client.fetch<T>(query, params, { next: { tags } });
}
