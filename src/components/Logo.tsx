import NextImage from "next/image";
import type { ResolvedLogo } from "@/sanity/seo";

// CMS-driven header/footer pass: shared by Header (HeaderInteractive.tsx)
// and Footer.tsx — same image-or-text rule in one place rather than
// duplicated per caller. Alt text is fixed to "Giuseppe Iannone"
// regardless of what siteSettings.logo actually shows (accessibility +
// SEO — the logo must carry the name even as an image, per spec), not a
// per-upload editable field.
//
// Takes an already-resolved {src, width, height} — never a raw Sanity
// image — because this component is imported by HeaderInteractive.tsx, a
// "use client" component. Resolution (urlFor + aspect-ratio sizing) happens
// server-side via sanity/seo.ts's resolveLogoImage(), called from
// layout.tsx; see that function's own comment for why.
//
// HONESTY-RULE SIMPLIFICATION: unlike the text wordmark, this image does
// NOT replicate the header's own scroll-collapse shrink animation (16px
// mobile / 24px desktop-rest / 17px desktop-collapsed, interpolated) —
// that's chrome-specific responsive polish for the TEXT glyph, and
// reproducing it for an arbitrary raster image was judged outside this
// pass's own scope (a content-model + wiring pass, not a re-design of the
// header's responsive brand mark). Flagged in this pass's own report;
// revisit if the owner uploads a real logo and wants the same shrink
// behavior.
export function Logo({
  logo,
  authorName,
  imageClassName,
  textClassName,
}: {
  logo?: ResolvedLogo;
  authorName: string;
  imageClassName?: string;
  textClassName?: string;
}) {
  if (logo) {
    return (
      <NextImage
        src={logo.src}
        alt="Giuseppe Iannone"
        width={logo.width}
        height={logo.height}
        className={imageClassName}
      />
    );
  }

  return <span className={textClassName}>{authorName}</span>;
}
