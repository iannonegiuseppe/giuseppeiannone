// Combines the site-wide dev-time indexing toggle (Step 8.5) with a
// per-document seo.noIndex override: either one wanting noindex wins.
export function resolveRobots(noIndex?: boolean) {
  const indexingEnabled = process.env.NEXT_PUBLIC_ENABLE_INDEXING === "true";
  const shouldIndex = indexingEnabled && !noIndex;

  return { index: shouldIndex, follow: shouldIndex };
}
