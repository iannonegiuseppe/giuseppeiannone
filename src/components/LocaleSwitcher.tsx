"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { homePath, singletonPathFns, type Locale } from "@/sanity/paths";
import styles from "./LocaleSwitcher.module.scss";

// Tries every known fixed route (home/about/method/price/faq/contact/
// legal) against the current pathname — free, synchronous, correct for
// every page except pillar/subtopic (genuinely translated slugs, no
// fixed mapping exists).
function reciprocalSingletonPath(
  currentLocale: Locale,
  otherLocale: Locale,
  pathname: string,
): string | null {
  for (const pathFor of singletonPathFns) {
    if (pathFor(currentLocale) === pathname) return pathFor(otherLocale);
  }
  return null;
}

// No live subscription — the alternate <link> tag is fixed for the
// lifetime of the page, so this only needs to reconcile once, after
// hydration, against the DOM that isn't available during SSR.
function subscribe() {
  return () => {};
}

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const otherLocale: Locale = currentLocale === "it" ? "en" : "it";
  const homeFallback = homePath(otherLocale);

  // Derived directly from render-time values (no DOM), so it's identical
  // on the server and on the client's very first paint — no flash, no
  // layout shift, since only the href changes here, never the visible
  // label.
  const staticMatch = reciprocalSingletonPath(currentLocale, otherLocale, pathname);

  // Not a known fixed route — a pillar/subtopic page. Its exact reciprocal
  // path is already computed and emitted by that page's own
  // generateMetadata (Stage 2 Step 3) as a <link rel="alternate">; read it
  // rather than re-deriving it or querying Sanity again. Guarded: any miss
  // (missing tag, empty href, unrecognized future page type) falls back to
  // home, never to a broken link. useSyncExternalStore (rather than
  // state+effect) reconciles the client-only DOM read against the
  // server's `null` snapshot without a synchronous setState in an effect.
  const alternateHref = useSyncExternalStore(
    subscribe,
    () => {
      if (staticMatch) return staticMatch;
      const tag = document.querySelector<HTMLLinkElement>(
        `link[rel="alternate"][hreflang="${otherLocale}"]`,
      );
      return tag?.getAttribute("href") ?? null;
    },
    () => staticMatch,
  );

  const href = alternateHref ?? homeFallback;

  return (
    <Link href={href} lang={otherLocale} className={styles.switcher}>
      {otherLocale.toUpperCase()}
    </Link>
  );
}
