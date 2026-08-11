import Image from "next/image";
import type { CSSProperties } from "react";
import styles from "./ParallaxFrameStatic.module.scss";

// CSS-only reveal — forked from ParallaxFrame.tsx (still used, unmodified,
// by DensityPage.tsx's own preview route) specifically for "Lo spazio" on
// the real /design-lab homepage. No JS at all: no scroll listener, no
// rAF loop, no Lenis subscription, no ResizeObserver. The mechanic is
// pure CSS: this component's own frame is a normal in-flow box with
// overflow:hidden + clip-path:inset(0) — clip-path is what makes a
// position:fixed descendant obey THIS box instead of the viewport (plain
// overflow:hidden does not clip a fixed child; clip-path does, because it
// clips at paint time across the whole subtree, not at the scrollport).
// The image itself is position:fixed, sized to cover the viewport,
// completely inert — it never moves, is never transformed, is never
// touched by scroll. As the page scrolls, the FRAME (a normal block)
// moves past the stationary image, and the frame's own clip window is
// what reveals/closes it — motion with zero JS driving it.
//
// Verified before writing this: no ancestor between this frame and <html>
// (including Lenis's own DOM, which drives native window.scrollTo()
// rather than a transformed wrapper) sets transform/filter/will-change/
// perspective — any of which would create a containing block for the
// fixed image and break this. Confirmed via computed style, not assumed.
//
// Reduced motion: pure CSS media query (density.module.scss), no JS
// branch needed at all — the image switches to position:absolute inside
// its own frame (normal in-flow, sized to a fixed aspect-ratio box), no
// fixed positioning, no reveal.
export function ParallaxFrameStatic({
  aspect,
  imageUrl,
  imageAlt,
  className,
}: {
  aspect?: string;
  imageUrl: string;
  imageAlt?: string;
  className?: string;
}) {
  return (
    <div
      className={className ? `${styles.spaceParallaxFrame} ${className}` : styles.spaceParallaxFrame}
      style={{ "--space-parallax-aspect": aspect } as CSSProperties}
    >
      <Image
        src={imageUrl}
        alt={imageAlt ?? ""}
        width={2400}
        height={1350}
        sizes="100vw"
        priority={false}
        className={styles.spaceParallaxImage}
      />
    </div>
  );
}
