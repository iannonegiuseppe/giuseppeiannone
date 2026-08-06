import Image from "next/image";
import type { Image as SanityImage } from "sanity";
import type { BreadcrumbItem } from "@/sanity/breadcrumbs";
import { Breadcrumbs } from "@/sanity/BreadcrumbsNav";
import { imageDimensions, urlFor } from "@/sanity/image";
import styles from "./PillarHero.module.scss";

// Substring-match emphasis technique, same as HeroOverlap.tsx's own
// renderHeadline / RecognitionSection.tsx's own renderEmphasis — duplicated
// per this codebase's established convention for small single-purpose
// helpers rather than shared, see those two files' own comments.
function renderEmphasis(text: string, emphasisWord: string | undefined) {
  if (!emphasisWord) return text;
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <em className={styles.titleEmphasis}>{emphasisWord}</em>
      {after}
    </>
  );
}

export function PillarHero({
  trail,
  heroKicker,
  title,
  titleEmphasisWord,
  standfirst,
  heroImage,
}: {
  trail: BreadcrumbItem[];
  heroKicker: string;
  title: string;
  titleEmphasisWord?: string;
  // Chi sono pass — optional now: that route has no field equivalent to
  // a pillar's own standfirst (chiSonoSection's closest candidate, the
  // pull quote, is explicitly placed in the body instead — see that
  // route's own page.tsx comment), so this renders kicker + title only
  // rather than inventing a lead line. Every existing pillar page still
  // passes a real standfirst and is unaffected.
  standfirst?: string;
  heroImage?: (SanityImage & { alt?: string }) | undefined;
}) {
  const dims = heroImage ? imageDimensions(heroImage) : null;
  // Capped at the source's own natural width — never upscale (same
  // reasoning as the article route's own requestWidth, portableTextComponents.tsx's
  // image renderer). No .height() alongside it: this is `fill` +
  // object-fit:cover, so the browser does all the actual cropping
  // responsively — asking Sanity to ALSO crop server-side to a fixed
  // height was a real bug (forced an unrelated 16:9 ratio onto whatever
  // aspect the source actually is, on top of the upscale).
  const requestWidth = dims ? Math.min(dims.width, 2400) : undefined;

  return (
    <div className={styles.heroBand}>
      {heroImage && dims ? (
        <Image
          src={urlFor(heroImage).width(requestWidth!).url()}
          alt={heroImage.alt ?? ""}
          fill
          sizes="100vw"
          className={styles.heroImage}
          priority
        />
      ) : null}
      {/* Scrim only when there's a photo underneath — with no heroImage the
          section's own flat --color-accent fill (page.module.scss) already
          holds the same measured contrast, so an extra scrim layer over a
          flat color would just be a redundant tint. See PillarHero.module.scss
          for the arithmetic, reused verbatim from the blog article route's
          own cover header. */}
      {heroImage && dims ? <div className={styles.heroScrim} aria-hidden="true" /> : null}
      {heroImage && dims ? <div className={styles.heroFade} aria-hidden="true" /> : null}
      <div className={styles.heroContent}>
        <div className={styles.breadcrumbs}>
          <Breadcrumbs trail={trail} />
        </div>
        <p className={styles.kicker}>{heroKicker}</p>
        <h1 className={styles.title}>{renderEmphasis(title, titleEmphasisWord)}</h1>
        {standfirst ? <p className={styles.standfirst}>{standfirst}</p> : null}
      </div>
    </div>
  );
}
