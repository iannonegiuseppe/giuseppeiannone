import Image from "next/image";
import type { Image as SanityImage } from "sanity";
import type { BreadcrumbItem } from "@/sanity/breadcrumbs";
import { Breadcrumbs } from "@/sanity/BreadcrumbsNav";
import { imageDimensions, urlFor } from "@/sanity/image";
import styles from "./PortraitHero.module.scss";

// Chi sono opening pass — a contained, editorial hero: portrait to the
// side, not a full-bleed photo band behind a scrim (PillarHero's own
// shape). Built new rather than reusing PillarHero because that
// component's entire structure — heroImage as an absolute-positioned
// background layer, the scrim/fade pair, text color repointed to
// --light-base-bg to survive an arbitrary photo underneath — assumes
// full-bleed. None of that applies to a page about a person rather than
// a monument to him. Named generically (not "ChiSonoHero"): the shape
// here — kicker, title with one emphasis word, one-line standfirst, a
// small-caps meta line, a contained portrait — has no chi-sono-specific
// content baked in, so any future page wanting the same "text beside a
// portrait" treatment (a team/practitioner page, say) could reuse it
// as-is.
export function PortraitHero({
  trail,
  kicker,
  title,
  titleEmphasisWord,
  standfirst,
  locationsLine,
  portrait,
}: {
  trail: BreadcrumbItem[];
  kicker: string;
  title: string;
  titleEmphasisWord?: string;
  standfirst?: string;
  locationsLine?: string;
  portrait?: (SanityImage & { alt?: string }) | undefined;
}) {
  const dims = portrait ? imageDimensions(portrait) : null;
  const requestWidth = dims ? Math.min(dims.width, 1200) : undefined;

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

  return (
    <div className={styles.heroBand}>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs trail={trail} />
      </div>
      <div className={styles.grid}>
        <div className={styles.text}>
          <p className={styles.kicker}>{kicker}</p>
          <h1 className={styles.title}>{renderEmphasis(title, titleEmphasisWord)}</h1>
          {standfirst ? <p className={styles.standfirst}>{standfirst}</p> : null}
          {locationsLine ? <p className={styles.locations}>{locationsLine}</p> : null}
        </div>
        {portrait && dims ? (
          <div className={styles.portraitFrame}>
            <Image
              src={urlFor(portrait).width(requestWidth!).url()}
              alt={portrait.alt ?? ""}
              width={dims.width}
              height={dims.height}
              className={styles.portrait}
              priority
              sizes="(min-width: 1024px) 480px, 100vw"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
