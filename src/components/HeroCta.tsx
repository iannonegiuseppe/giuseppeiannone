"use client";

import { useLenisRef } from "./LenisProvider";

// Hero — finish it: the CTA previously pointed at href="#" (a pre-existing
// dead link). Wired here to smooth-scroll to the contact section instead
// of a real navigation, since the target is on the same page. Lenis drives
// the site's native scroll (see LenisProvider's own comment), so its
// scrollTo is used when the instance is active rather than a plain
// scrollIntoView — calling the two APIs interchangeably would leave
// Lenis's internal virtual-scroll position out of sync with the real one.
// prefers-reduced-motion is checked directly (not inferred from Lenis being
// absent, since Lenis is also disabled for coarse-pointer/touch, which
// should still get a native smooth scroll, not an instant jump).
export function HeroCta({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const lenisRef = useLenisRef();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    if (lenisRef?.current) {
      lenisRef.current.scrollTo(target as HTMLElement);
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
