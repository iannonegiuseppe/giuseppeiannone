"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const otherLocale: Locale = currentLocale === "it" ? "en" : "it";
  const homeFallback = homePath(otherLocale);

  // Computed synchronously so static pages (home, about, method, ...) get
  // the exact link from the very first paint — no flash, no layout shift,
  // since only the href changes here, never the visible label.
  const [href, setHref] = useState(
    () =>
      reciprocalSingletonPath(currentLocale, otherLocale, pathname) ??
      homeFallback,
  );

  useEffect(() => {
    const staticMatch = reciprocalSingletonPath(
      currentLocale,
      otherLocale,
      pathname,
    );
    if (staticMatch) {
      setHref(staticMatch);
      return;
    }

    // Not a known fixed route — a pillar/subtopic page. Its exact
    // reciprocal path is already computed and emitted by that page's own
    // generateMetadata (Stage 2 Step 3) as a <link rel="alternate">; read
    // it rather than re-deriving it or querying Sanity again. Guarded:
    // any miss (missing tag, empty href, unrecognized future page type)
    // falls back to home, never to a broken link.
    const tag = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${otherLocale}"]`,
    );
    const alternateHref = tag?.getAttribute("href");
    setHref(alternateHref ? alternateHref : homeFallback);
  }, [pathname, currentLocale, otherLocale, homeFallback]);

  return (
    <Link href={href} lang={otherLocale} className={styles.switcher}>
      {otherLocale.toUpperCase()}
    </Link>
  );
}
