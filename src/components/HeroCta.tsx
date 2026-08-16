"use client";

import { useLenisRef } from "./LenisProvider";
import { buttonClassName, ButtonContent, type ButtonTone, type ButtonVariant } from "./Button";

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
//
// Gold-button unification pass — `variant` is a new, OPTIONAL opt-in: when
// omitted, this renders exactly as before (a plain <a>, `className` used
// verbatim, `children` passed through untouched) — CtaBridgeSection.tsx's
// own usage relies on this, it's a text link with its own hand-written
// arrow span, not a filled button, and must stay byte-for-byte unaffected.
// When a caller (HeroOverlap.tsx) passes variant="primary", this reuses
// Button.tsx's own buttonClassName/ButtonContent — the exact same fill,
// hover, transition, and label/arrow/glint markup a real <Button> renders
// — rather than a second, forked copy of that recipe. HeroCta can't just
// BE a <Button>: it owns real behavior (smooth-scroll interception, native
// <a href> fallback for no-JS) neither Button nor ButtonLink model.
export function HeroCta({
  href,
  className,
  children,
  variant,
  tone = "base",
  showArrow = true,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  showArrow?: boolean;
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

  const resolvedClassName = variant
    ? buttonClassName(variant, "default", tone, false, className)
    : className;

  return (
    <a
      href={href}
      className={resolvedClassName}
      data-tone={variant ? tone : undefined}
      onClick={handleClick}
    >
      {variant ? (
        <ButtonContent variant={variant} showArrow={showArrow}>
          {children}
        </ButtonContent>
      ) : (
        children
      )}
    </a>
  );
}
